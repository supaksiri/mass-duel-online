import {initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously,onAuthStateChanged,type User} from 'firebase/auth';
import {getDatabase,ref,onValue} from 'firebase/database';
import {getFunctions,httpsCallable} from 'firebase/functions';
const env=import.meta.env;
export const configured=Boolean(env.VITE_FIREBASE_API_KEY&&env.VITE_FIREBASE_DATABASE_URL&&env.VITE_FIREBASE_PROJECT_ID);
const app=configured?initializeApp({apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,databaseURL:env.VITE_FIREBASE_DATABASE_URL,projectId:env.VITE_FIREBASE_PROJECT_ID,appId:env.VITE_FIREBASE_APP_ID}):null;
export const auth=app?getAuth(app):null;
export const database=app?getDatabase(app):null;
const functions=app?getFunctions(app,env.VITE_FIREBASE_FUNCTIONS_REGION||'asia-southeast1'):null;
export async function authenticate():Promise<User>{if(!auth)throw Error('ยังไม่ได้ตั้งค่า Firebase');if(auth.currentUser)return auth.currentUser;return new Promise((resolve,reject)=>{const off=onAuthStateChanged(auth,user=>{if(user){off();resolve(user);}else{off();signInAnonymously(auth).then(x=>resolve(x.user)).catch(reject);}},reject);});}
export async function action<T>(name:string,data:object):Promise<T>{await authenticate();if(!functions)throw Error('ยังไม่ได้ตั้งค่า Firebase Functions');const result=await httpsCallable(functions,name)(data);return result.data as T;}
export function subscribe(code:string,onRoom:(room:Room|null)=>void){if(!database)return()=>{};return onValue(ref(database,'rooms/'+code),snap=>onRoom(snap.val() as Room|null));}
export type Team={uid:string;name:string;score:number;position:number;answered:number;correct:number};
export type Question={id:string;arena:1|2|3;type:'choice'|'number';prompt:string;options?:string[];unit?:string;duration:number};
export type Room={status:'lobby'|'question'|'revealed'|'paused'|'finished';index:number;question:Question|null;deadline:number;remaining:number;phaseVersion:number;teams:Record<string,Team>;submitted:Record<string,boolean>;reveal:{answer:number;explanation:string;reference:string;correct:Record<string,boolean>}|null};
