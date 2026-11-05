"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTIONS = void 0;
exports.isCorrect = isCorrect;
exports.publicQuestion = publicQuestion;
// Standards: u = 1.66053906660e-24 g; standard atomic weights are rounded illustrative values.
exports.QUESTIONS = [
    { id: 'A1', arena: 1, type: 'choice', prompt: 'จากตารางธาตุ Mg และ Al ธาตุใดมีมวลอะตอมเฉลี่ยมากกว่า?', options: ['Mg', 'Al', 'เท่ากัน', 'สรุปไม่ได้'], answer: 1, explanation: 'Mg ≈ 24.305 u ส่วน Al ≈ 26.982 u ดังนั้น Al มากกว่า', reference: 'ตารางธาตุ: Mg 24.305, Al 26.9815384', duration: 40 },
    { id: 'A2', arena: 1, type: 'number', prompt: 'มวลเฉลี่ยของ C หนึ่งอะตอมประมาณ 12.01 u คิดเป็นกี่กรัม? ตอบเป็นตัวเลขในรูป 1.99e-23 (ใช้ 1 u = 1.66054e-24 g)', answer: 1.9943e-23, tolerance: 0.012e-23, unit: 'g', explanation: '12.01 × 1.66054 × 10⁻²⁴ ≈ 1.9943 × 10⁻²³ g', reference: '1 u = 1.66053906660×10⁻²⁴ g', duration: 90 },
    { id: 'A3', arena: 1, type: 'choice', prompt: 'อะตอม 1 อะตอมมวล 24 u กับ 16 u ต่างกันกี่เท่า (มวลมาก/มวลน้อย)?', options: ['1.25 เท่า', '1.50 เท่า', '2 เท่า', '8 เท่า'], answer: 1, explanation: '24 ÷ 16 = 1.50 เท่า', reference: 'อัตราส่วนมวล', duration: 55 },
    { id: 'A4', arena: 1, type: 'choice', prompt: 'ข้อใดถูกต้องเกี่ยวกับ 1 u?', options: ['มวลของโปรตอน 1 อนุภาคเท่ากันพอดี', '1/12 มวลอะตอม C-12 หนึ่งอะตอม', 'มวลของคาร์บอนธรรมชาติหนึ่งอะตอม', '12 กรัม'], answer: 1, explanation: '1 u นิยามจาก 1/12 ของมวลอะตอมคาร์บอน-12 ที่เป็นกลางและอยู่ในสถานะพื้น', reference: 'นิยามหน่วยมวลอะตอม', duration: 50 },
    { id: 'B1', arena: 2, type: 'choice', prompt: 'มวลอะตอมสัมพัทธ์ Ar มีหน่วยเป็นอะไร?', options: ['g', 'u', 'g/mol', 'ไม่มีหน่วย'], answer: 3, explanation: 'Ar เป็นอัตราส่วนมวลเทียบมาตรฐาน จึงไม่มีหน่วย', reference: 'นิยาม relative atomic mass', duration: 40 },
    { id: 'B2', arena: 2, type: 'number', prompt: 'อะตอมสมมติ X มีมวลเป็น 20 เท่าของ (1/12) มวล C-12 ค่า Ar ของ X เท่าใด?', answer: 20, tolerance: 0.01, explanation: 'Ar = m(X)/(m(C-12)/12) = 20 (ไม่มีหน่วย)', reference: 'สูตร Ar', duration: 60 },
    { id: 'B3', arena: 2, type: 'choice', prompt: 'ข้อใดคือข้อความที่ถูกต้อง?', options: ['Ar ของ C-12 เท่ากับ 12 โดยนิยาม', 'Ar ของ C-12 เท่ากับ 1', 'Ar มีหน่วยเป็น u เสมอ', 'Ar คือเลขอะตอม'], answer: 0, explanation: 'C-12 มีมวลเท่ากับ 12 u พอดีตามนิยาม และมีมวลสัมพัทธ์ 12', reference: 'มาตรฐาน C-12', duration: 50 },
    { id: 'B4', arena: 2, type: 'number', prompt: 'ถ้าอะตอม X หนัก 2.65686e-23 g และ 1 u = 1.66054e-24 g ค่า relative mass ของ X เป็นประมาณเท่าใด? (ตอบทศนิยม 2 ตำแหน่ง)', answer: 16, tolerance: 0.03, explanation: '2.65686e-23 ÷ 1.66054e-24 ≈ 16.00', reference: 'สูตร Ar และนิยาม u', duration: 80 },
    { id: 'C1', arena: 3, type: 'number', prompt: 'ไอโซโทปสมมติ X-10 มวล 10.00 u ชุก 20% และ X-11 มวล 11.00 u ชุก 80% มวลอะตอมเฉลี่ยเป็นกี่ u?', answer: 10.8, tolerance: 0.01, unit: 'u', explanation: '10.00(0.20) + 11.00(0.80) = 10.80 u', reference: 'ค่าเฉลี่ยถ่วงน้ำหนักไอโซโทปสมมติ', duration: 80 },
    { id: 'C2', arena: 3, type: 'choice', prompt: 'ธาตุ X มีไอโซโทป 10 u กับ 11 u ถ้าความชุกของ 11 u เพิ่มขึ้น มวลเฉลี่ยจะเป็นอย่างไร?', options: ['ลดลง', 'เพิ่มขึ้น', 'คงเดิม', 'กลายเป็น 12 u'], answer: 1, explanation: 'ค่าเฉลี่ยถ่วงน้ำหนักจะขยับเข้าใกล้มวลของไอโซโทปที่มีความชุกมากขึ้น', reference: 'ค่าเฉลี่ยถ่วงน้ำหนัก', duration: 45 },
    { id: 'C3', arena: 3, type: 'number', prompt: 'ไอโซโทปสมมติ A มีมวล 20.00 u ชุก 25% และ B มวล 22.00 u ชุก 75% มวลอะตอมเฉลี่ยเป็นกี่ u?', answer: 21.5, tolerance: 0.01, unit: 'u', explanation: '20(0.25) + 22(0.75) = 21.50 u', reference: 'ค่าเฉลี่ยถ่วงน้ำหนักไอโซโทปสมมติ', duration: 75 },
    { id: 'C4', arena: 3, type: 'choice', prompt: 'เหตุใดมวลอะตอมของ Cl ในตารางธาตุจึงประมาณ 35.45?', options: ['โปรตอนมีเศษส่วน', 'เป็นค่าเฉลี่ยถ่วงน้ำหนักตามความชุกของไอโซโทป', 'ทุกอะตอม Cl หนัก 35.45 u เท่ากัน', 'Cl มีเลขอะตอม 35'], answer: 1, explanation: 'ค่าตารางธาตุเป็นค่าเฉลี่ยของไอโซโทปตามสัดส่วนความชุกตามธรรมชาติ', reference: 'ธรรมชาติของ chlorine isotopes', duration: 55 },
    { id: 'F1', arena: 3, type: 'number', prompt: 'FINAL CORE: X มีไอโซโทปสมมติ 10.00 u (30%) และ 11.00 u (70%) จงหามวลเฉลี่ยหน่วย u', answer: 10.7, tolerance: 0.01, unit: 'u', explanation: '10(0.30)+11(0.70)=10.70 u และ Ar ≈ 10.70 ไม่มีหน่วย; มวลเฉลี่ยต่ออะตอม ≈1.7768×10⁻²³ g', reference: 'โจทย์บูรณาการ ค่าเฉลี่ยถ่วงน้ำหนัก', duration: 95 }
];
function isCorrect(q, value) { if (q.type === 'choice')
    return typeof value === 'number' && Number.isInteger(value) && value === q.answer; if (typeof value !== 'number' || !Number.isFinite(value))
    return false; return Math.abs(value - q.answer) <= (q.tolerance ?? 0.001); }
function publicQuestion(q) { const { answer, tolerance, explanation, reference, ...publicFields } = q; void answer; void tolerance; void explanation; void reference; return publicFields; }
