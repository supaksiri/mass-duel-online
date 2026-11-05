import {initializeApp} from 'firebase-admin/app';
import {getDatabase} from 'firebase-admin/database';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {QUESTIONS,isCorrect,publicQuestion} from './questions';
initializeApp();
const db=()=>getDatabase();
const REGION='asia-southeast1';
type Team={uid:string;name:string;score:number;position:number;answered:number;correct:number};
type Submission={value:number;at:number};
type Room={host:string;status:'lobby'|'question'|'revealed'|'paused'|'finished';createdAt:number;index:number;deadline:number;remaining:number;teams:Record<string,Team>;submissions:Record<string,Submission>;answers:Record<string,boolean>;phaseVersion:number};
const ensureAuth=(uid?:string)=>{if(!uid)throw new HttpsError('unauthenticated','กรุณาเชื่อมต่อบัญชีผู้เล่นก่อน');return uid;};
const codeOf=(input:unknown)=>{const c=String(input||'').trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(c))throw new HttpsError('invalid-argument','รหัสห้องต้องเป็น 6 ตัวอักษร');return c;};
const safeName=(s:unknown)=>{const name=String(s||'').trim().slice(0,24);if(name.length<2||/[<>]/.test(name))throw new HttpsError('invalid-argument','ชื่อทีมต้องยาว 2–24 ตัวอักษร');return name;};
const matchHost=(r:Room,uid:string)=>{if(r.host!==uid)throw new HttpsError('permission-denied','เฉพาะครูผู้สร้างห้องเท่านั้น');};
const qAt=(index:number)=>QUESTIONS[Math.min(index,QUESTIONS.length-1)];
const basePublic=(r:Room)=>({status:r.status,index:r.index,question:r.status==='lobby'||r.status==='finished'?null:publicQuestion(qAt(r.index)),deadline:r.deadline,remaining:r.remaining,phaseVersion:r.phaseVersion,teams:Object.fromEntries(Object.entries(r.teams||{}).map(([k,v])=>[k,v])),submitted:Object.keys(r.submissions||{}).reduce<Record<string,boolean>>((a,id)=>(a[id]=true,a),{}),reveal:r.status==='revealed'?{answer:qAt(r.index).answer,explanation:qAt(r.index).explanation,reference:qAt(r.index).reference,correct:r.answers||{}}:null});
async function publish(code:string){const snap=await db().ref(`privateRooms/${code}`).get();if(snap.exists())await db().ref(`rooms/${code}`).set(basePublic(snap.val() as Room));}
const randomCode=()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');};
export const createRoom=onCall({region:REGION, enforceAppCheck:false},async req=>{
 const uid=ensureAuth(req.auth?.uid);for(let i=0;i<8;i++){const code=randomCode();const now=Date.now();const room:Room={host:uid,status:'lobby',createdAt:now,index:0,deadline:0,remaining:0,teams:{},submissions:{},answers:{},phaseVersion:0};const result=await db().ref(`privateRooms/${code}`).transaction(v=>v?undefined:room,undefined,false);if(result.committed){await publish(code);return {code};}}
 throw new HttpsError('resource-exhausted','สร้างรหัสห้องไม่ได้ ลองใหม่');
});
export const joinRoom=onCall({region:REGION},async req=>{
 const uid=ensureAuth(req.auth?.uid),code=codeOf(req.data?.code),name=safeName(req.data?.name);let err='';
 const result=await db().ref(`privateRooms/${code}`).transaction((r:Room|null)=>{if(!r){err='ไม่พบห้องเกม';return;}if(r.status!=='lobby'&&!r.teams?.[uid]){err='ห้องเริ่มเกมแล้ว';return;}r.teams=r.teams||{};if(!r.teams[uid]&&Object.keys(r.teams).length>=12){err='ห้องเต็ม (สูงสุด 12 ทีม)';return;}if(!r.teams[uid]&&Object.values(r.teams).some(t=>t.name===name)){err='ชื่อทีมนี้ถูกใช้แล้ว';return;}r.teams[uid]=r.teams[uid]||{uid,name,score:0,position:0,answered:0,correct:0};return r;},undefined,false);
 if(!result.committed)throw new HttpsError('failed-precondition',err||'เข้าร่วมห้องไม่ได้');await publish(code);return {code};
});
export const hostAction=onCall({region:REGION},async req=>{
 const uid=ensureAuth(req.auth?.uid),code=codeOf(req.data?.code),action=String(req.data?.action||'');let err='';
 const result=await db().ref(`privateRooms/${code}`).transaction((r:Room|null)=>{if(!r){err='ไม่พบห้อง';return;}if(r.host!==uid){err='ไม่ใช่ครูเจ้าของห้อง';return;}const now=Date.now();
 if(action==='start'||action==='next') {if(action==='start'&&r.status!=='lobby'){err='เริ่มแล้ว';return;}if(action==='next'&&r.status!=='revealed'){err='ต้องเฉลยก่อน';return;}if(action==='next')r.index++;if(r.index>=QUESTIONS.length){r.status='finished';r.deadline=0;}else{r.status='question';r.remaining=qAt(r.index).duration*1000;r.deadline=now+r.remaining;r.submissions={};r.answers={};}}
 else if(action==='pause'){if(r.status!=='question'){err='หยุดได้ระหว่างตอบเท่านั้น';return;}r.remaining=Math.max(0,r.deadline-now);r.status='paused';r.deadline=0;}
 else if(action==='resume'){if(r.status!=='paused'){err='เกมไม่อยู่ในสถานะหยุด';return;}r.deadline=now+r.remaining;r.status='question';}
 else if(action==='reveal'||action==='skip'){if(r.status!=='question'&&r.status!=='paused'){err='ไม่สามารถเฉลยได้';return;}if(action==='reveal'&&r.status==='question'&&now<r.deadline&&Object.keys(r.submissions||{}).length<Object.keys(r.teams||{}).length){err='ยังไม่หมดเวลาและยังตอบไม่ครบ';return;}scoreRound(r,action==='skip');r.status='revealed';r.remaining=0;r.deadline=0;}
 else if(action==='finish'){r.status='finished';r.deadline=0;}else{err='คำสั่งไม่ถูกต้อง';return;}r.phaseVersion++;return r;},undefined,false);
 if(!result.committed)throw new HttpsError('failed-precondition',err||'เปลี่ยนสถานะไม่ได้');await publish(code);return {ok:true};
});
function scoreRound(r:Room,skip:boolean){const q=qAt(r.index);r.answers={};for(const [uid,sub] of Object.entries(r.submissions||{})){const correct=!skip&&isCorrect(q,sub.value);r.answers[uid]=correct;if(r.teams[uid]){r.teams[uid].answered++;if(correct){r.teams[uid].correct++;r.teams[uid].score+=q.id.startsWith('F')?5:2;r.teams[uid].position=Math.min(13,r.teams[uid].position+1);}}}}
export const submitAnswer=onCall({region:REGION},async req=>{
 const uid=ensureAuth(req.auth?.uid),code=codeOf(req.data?.code),index=Number(req.data?.index),value=req.data?.value;
 if(typeof value!=='number'||!Number.isFinite(value))throw new HttpsError('invalid-argument','คำตอบต้องเป็นตัวเลขที่ถูกต้อง');let err='';
 const result=await db().ref(`privateRooms/${code}`).transaction((r:Room|null)=>{if(!r){err='ไม่พบห้อง';return;}if(!r.teams?.[uid]){err='คุณไม่ได้อยู่ในห้องนี้';return;}if(r.status!=='question'||r.index!==index||Date.now()>r.deadline){err='หมดเวลาตอบหรือโจทย์เปลี่ยนแล้ว';return;}r.submissions=r.submissions||{};if(r.submissions[uid]){err='ส่งคำตอบแล้ว';return;}r.submissions[uid]={value,at:Date.now()};return r;},undefined,false);
 if(!result.committed)throw new HttpsError('failed-precondition',err||'ส่งไม่สำเร็จ');await publish(code);return {ok:true};
});
// Server fallback: reveals timed-out rounds even when teacher closes their tab; ~1 minute resolution.
export const expireRounds=onSchedule({schedule:'every 1 minutes',region:REGION,timeZone:'Asia/Bangkok'},async()=>{
 const all=await db().ref('privateRooms').get();const data=(all.val()||{}) as Record<string,Room>;
 await Promise.all(Object.entries(data).filter(([,r])=>r.status==='question'&&r.deadline<=Date.now()).map(async([code])=>{
  const result=await db().ref(`privateRooms/${code}`).transaction((r:Room|null)=>{if(!r||r.status!=='question'||r.deadline>Date.now())return;scoreRound(r,false);r.status='revealed';r.deadline=0;r.remaining=0;r.phaseVersion++;return r;},undefined,false);if(result.committed)await publish(code);
 }));
});
