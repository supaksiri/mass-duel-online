# MASS DUEL ONLINE — ATOMIC ARENA (ต้นแบบเชื่อม Firebase)

## สถานะที่ตรวจสอบได้
ซอร์สโค้ดต้นแบบ React + TypeScript + Vite และ Firebase Realtime Database + Callable Functions พร้อมโครงสร้างการทำงานจริง แต่ **ยังไม่ได้ตั้งค่าโครงการ Firebase ของผู้ใช้ ยังไม่ได้ deploy และยังไม่ได้ทดสอบ Multiplayer ข้ามเครื่องจริง** การรัน `npm install` ในสภาพแวดล้อมจัดทำนี้ไม่สำเร็จเนื่องจากเครือข่ายเข้าถึง registry ไม่ได้ ดังนั้นยังไม่ยืนยันว่า Build ผ่าน กรุณารัน build และ test หลังติดตั้ง dependencies ในเครื่องที่ใช้งานอินเทอร์เน็ตได้

## สถาปัตยกรรม
- เว็บนักเรียนและครู: React + TypeScript + Vite (responsive)
- Auth: Firebase Anonymous Auth (ไม่ต้องลงทะเบียนด้วยอีเมล)
- Real-time: Realtime Database `/rooms/{code}` ใช้เฉพาะข้อมูลสำหรับแสดงผล
- คำตอบถูกต้องและคะแนน: Cloud Functions (`createRoom`, `joinRoom`, `submitAnswer`, `hostAction`) + private `/privateRooms/{code}`
- Timer: เส้นตายฝั่งเซิร์ฟเวอร์; scheduled function ทุก 1 นาทีเป็น fallback สำหรับเฉลยอัตโนมัติหลังหมดเวลา (อาจหน่วงได้ประมาณ 1 นาที)
- Teachers: เจ้าของห้องคือ anonymous UID ของอุปกรณ์ที่สร้างห้อง, ปุ่ม pause/resume/reveal/skip/finish
- นักเรียน: 1 โทรศัพท์ต่อทีม, ตอบครั้งเดียวต่อรอบ, ดูเฉลยหลังเปิดรอบ
- กระดาน: 3 Arena × 4 โจทย์ + Final, ตำแหน่งขึ้นเมื่อคำตอบถูกเท่านั้น
- รายงาน: CSV ชื่อทีม/คะแนน/จำนวนตอบถูก/ตอบทั้งหมด (ไม่มีชื่อจริงนักเรียน)

## ติดตั้ง
1. ติดตั้ง Node.js 22+ และ Firebase CLI (`npm install -g firebase-tools`)
2. ในโฟลเดอร์หลัก: `npm install`; ในโฟลเดอร์ `functions`: `npm install`
3. สร้าง Firebase Project, เลือกแผนที่ใช้งาน Cloud Functions ได้ (อาจจำเป็นต้องเปิด Billing/Blaze)
4. ใน Firebase Console เปิด **Authentication > Sign-in method > Anonymous**
5. สร้าง **Realtime Database** ในภูมิภาคที่เหมาะสม
6. เปิด Firebase Web App แล้วคัดลอก config ลง `.env.local` โดยใช้ `.env.example` เป็นแม่แบบ (รวม databaseURL)
7. `firebase login`, `firebase use --add` เพื่อเลือก project ของตน
8. `firebase deploy --only database,functions` เพื่อ deploy กฎปฏิเสธการเขียนจาก client และ Cloud Functions
9. `npm run build` ในโฟลเดอร์หลัก และ `npm run build` ใน `functions`; ทดสอบ `npm run dev` ผ่าน localhost
10. หากใช้ GitHub Pages: ตั้ง `VITE_BASE_PATH=/ชื่อ-repository/` ใน workflow; ให้ workflow build จาก env secrets / vars แล้ว deploy โฟลเดอร์ `dist/` ไป Pages; base URL ชี้ไปที่ repo path. ห้ามใส่ service-account JSON ใน frontend หรือ GitHub repository

### คำสั่งตรวจสอบ
```
cd functions && npm install && npm run build && npm test
cd .. && npm install && npm run build
firebase emulators:start
```
หมายเหตุ: การทดสอบ end-to-end ต้องเปิด local emulators แล้วตั้งค่า SDK ชี้ emulator ก่อน หรือทดสอบกับ Firebase Project สำหรับพัฒนาโดยเฉพาะ; โครงการนี้ยังไม่ได้เปิด emulator connections อัตโนมัติ

## กติกาที่ใช้จริงในรุ่นต้นแบบ
- ทีมละ 3–4 คน, ใช้โทรศัพท์ 1 เครื่องและตารางธาตุกระดาษ
- 12 ข้อประจำ 3 Arena + Final Core 1 ข้อ รวม 13 รอบ; ทุกทีมตอบพร้อมกัน
- โจทย์ทั่วไปตอบถูก +2 คะแนน, Final +5 คะแนน; ตอบผิด 0; ไม่มีคะแนนติดลบ
- แสดงคำถามครั้งละหนึ่งข้อ; เลือกคำตอบหรือพิมพ์ค่าตัวเลขตามโจทย์
- ส่งคำตอบได้เพียงครั้งเดียว; ไม่สามารถแก้คำตอบหลังส่งหรือหลังหมดเวลา
- เปิดเฉลยเมื่อหมดเวลา หรือทุกทีมส่งครบ แล้วครูกดเปิดเฉลย; หากครูไม่อยู่ scheduled function จะเปิดเฉลยหลังหมดเวลาตามรอบตรวจ (ไม่ใช่แม่นยำระดับวินาที)
- ข้ามโจทย์ = ไม่ให้แต้มทั้งห้อง; pause/resume ปรับเวลาเหลือบนเซิร์ฟเวอร์
- ครูเป็นคนกดไปข้อถัดไปและกดจบเกม; แต่ละทีมเห็นคะแนนพร้อมกัน

## ความถูกต้องของเนื้อหา
- Atomic mass 1 u ≈ 1.66053906660 × 10^-24 g.
- Relative atomic mass (Ar) คืออัตราส่วน ไม่มีหน่วย
- Standard atomic weights จากตารางธาตุเป็นค่าที่ขึ้นกับองค์ประกอบไอโซโทปของธาตุ และบางธาตุมีช่วงค่า; ตัวเลขในเกมเป็นค่าที่ปัดเศษเพื่อการศึกษา
- Isotope-average cards ระบุชัดว่าใช้ไอโซโทปสมมติ 10.00 / 11.00 u เพื่อตัดความคลาดเคลื่อนจากมวลไอโซโทปจริงที่ไม่เท่ากับเลขมวล
- ในโจทย์ที่ใช้ค่า 12.01 u สำหรับคาร์บอน หมายถึงมวลเฉลี่ยตามตารางธาตุ ไม่ใช่มวลของอะตอม C-12 ที่แน่นอนเท่ากับ 12 u

## ความปลอดภัยและข้อจำกัดก่อนเปิดให้ใช้ทั้งโรงเรียน
- ไม่มีการเขียน Realtime Database โดยตรงจาก client; เฉลยและ logic ให้คะแนนอยู่ฝั่ง server
- ผู้เล่น sign-in anonymously และ read `/rooms/{code}` ได้เมื่อรู้รหัส; anonymous auth **ไม่ใช่การยืนยันตัวตนที่แข็งแรง**
- เปิด App Check, กำหนด quota และตรวจ rate limits ก่อนใช้จริง; ฟังก์ชันต้นแบบยังไม่มี rate-limiter หรือระบบบัญชีครูที่ทนการสูญเสีย session
- ครูต้องเปิดจากเบราว์เซอร์เดิมที่สร้างห้อง; ล้างข้อมูล browser อาจเสียสิทธิ์ host
- โหมดครูใช้งานในเครื่องของผู้สร้างห้องเท่านั้น; URL/รหัสห้องไม่เพียงพอสำหรับสวมสิทธิ์ครู
- `/rooms/{code}` มีชื่อทีมและ UID แบบไม่ระบุตัวตน; หลีกเลี่ยงใช้ชื่อจริงและอย่าเก็บข้อมูลส่วนบุคคลนักเรียน
- จำกัด 12 ทีมต่อห้อง แต่มิได้จำกัดจำนวนห้องหรือ cleanup ข้อมูลที่เก่า; ควรเพิ่ม room expiry และ abuse prevention
- ผลคะแนน export เป็น CSV แบบระดับทีม ไม่ใช่การประเมินผลรายบุคคล
- ฟังก์ชัน publish/read อาจพบการรีเฟรชสถานะเล็กน้อยจากคำสั่งที่เกิดพร้อมกัน; สำหรับการใช้จริงจำนวนนักเรียนมาก ควรเพิ่ม Integration Tests กับ Emulator และการทดสอบโหลด

## โครงสร้างไฟล์
```
index.html
src/main.tsx          หน้าครู/นักเรียน/กระดาน/สรุป
src/style.css         ธีม Responsive
src/firebase.ts       Firebase Web SDK + Realtime subscription
functions/src/index.ts         Cloud Functions: authoritative game state
functions/src/questions.ts     คำถาม เฉลย และ numeric grader
firebase.json
 database.rules.json
.env.example
```
