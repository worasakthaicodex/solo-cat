import assert from 'node:assert/strict'
import {projectProgress,phaseProgress,validateProject,asPhasedProject} from '../src/project-progress.js'
const project=(weights,done=true)=>({title:'Fractional project',plans:weights.map((weight,i)=>({id:String(i),title:'Task '+i,weight,done}))})
assert.equal(validateProject(project([0.1,0.2,0.25])), '')
assert.equal(projectProgress(project([0.1,0.2])).progress,0.3)
assert.equal(projectProgress(project([0.1,0.2])).remaining,99.7)
assert.equal(projectProgress(project([33.33,33.33,33.33,0.01])).progress,100)
assert.equal(projectProgress(project([0.01,99.99])).remaining,0)
assert.equal(validateProject(project([0.1,0.2,99.7])), '')
assert.notEqual(validateProject(project([0.1,0.2,99.71])), '')
for(const value of [0,-1,100.01,0.001,1.111,'',NaN,Infinity])assert.notEqual(validateProject(project([value])), '',String(value))
const sample=project([0.1,0.2]);sample.plans[0].done=false
assert.equal(projectProgress(sample).progress,0.2)
console.log('PASS exact fractional totals, 100% boundary, undo and validation of weight precision')
const task=(weight,done)=>({id:crypto.randomUUID(),title:'Task',weight,done})
const phased={title:'Phased project',phases:[{id:'a',title:'Design',weight:40,plans:[task(50,true),task(50,false)]},{id:'b',title:'Build',weight:60,plans:[task(100,false)]}]}
assert.equal(validateProject(phased),'')
assert.equal(projectProgress(phased).progress,20)
assert.equal(phaseProgress(phased.phases[0]).progress,50)
phased.phases[1].plans[0].done=true
assert.equal(projectProgress(phased).progress,80)
phased.phases[0].plans[1].done=true
assert.equal(projectProgress(phased).progress,100)
assert.equal(projectProgress(phased).completedPhases,2)
phased.phases[0].plans[0].done=false
assert.equal(projectProgress(phased).progress,80)
const tiny={title:'Tiny',phases:[{title:'A',weight:0.01,plans:[task(0.01,true),task(99.99,false)]},{title:'B',weight:99.99,plans:[task(100,true)]}]}
assert.equal(projectProgress(tiny).progress,99.990001)
tiny.phases[0].plans[0].done=false;tiny.phases[0].plans[1].done=true
assert.equal(projectProgress(tiny).progress,99.999999)
assert.equal(validateProject({...phased,phases:[...phased.phases,{title:'Extra',weight:0.01,plans:[]}]}),'น้ำหนักรวมในแต่ละระดับต้องไม่เกิน 100%')
assert.notEqual(validateProject({...phased,phases:[{title:'Over',weight:20,plans:[task(100,true),task(0.01,false)]}]}),'')
for(const weight of [0,0.001,100.01])assert.notEqual(validateProject({title:'Bad phase',phases:[{title:'Phase',weight,plans:[]}]}),'')
const legacy={id:'old',...project([0.1,0.2,99.7]),note:'Keep me',due:'2026-10-10'},before=JSON.stringify(legacy),migrated=asPhasedProject(legacy)
assert.equal(projectProgress(migrated).progress,projectProgress(legacy).progress)
assert.equal(migrated.note,legacy.note);assert.equal(migrated.due,legacy.due)
assert.deepEqual(migrated.phases[0].plans,legacy.plans)
assert.equal(JSON.stringify(legacy),before)
assert.strictEqual(asPhasedProject(migrated),migrated)
assert.equal(projectProgress(asPhasedProject({id:'empty',plans:[]})).progress,0)
console.log('PASS weighted phases, independent limits, precise tiny contributions, completion, undo and lossless legacy conversion')
