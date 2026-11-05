const {test}=require('node:test');
const assert=require('node:assert/strict');
// These tests expect functions/lib/questions.js after TypeScript build.
const {QUESTIONS,isCorrect,publicQuestion}=require('../lib/questions.js');
test('exactly 13 questions in correct arena order',()=>{assert.equal(QUESTIONS.length,13);assert.deepEqual(QUESTIONS.map(q=>q.arena),[1,1,1,1,2,2,2,2,3,3,3,3,3]);});
test('mass data and expected answers',()=>{assert.ok(isCorrect(QUESTIONS[1],12.01*1.66054e-24));assert.ok(isCorrect(QUESTIONS[8],10.8));assert.ok(isCorrect(QUESTIONS[10],21.5));assert.equal(isCorrect(QUESTIONS[8],11.8),false);});
test('numeric values do not allow malformed inputs',()=>{assert.equal(isCorrect(QUESTIONS[1],NaN),false);assert.equal(isCorrect(QUESTIONS[1],'1.99e-23'),false);assert.equal(isCorrect(QUESTIONS[0],1.5),false);});
test('public questions cannot disclose answers',()=>{for(const q of QUESTIONS){const p=publicQuestion(q);assert.equal('answer'in p,false);assert.equal('explanation'in p,false);}});
