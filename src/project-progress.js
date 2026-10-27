// Sum hundredths of a percent as integers, so 0.1 + 0.2 displays as 0.3.
const units=value=>Number.isFinite(Number(value))?Math.round(Number(value)*100):0
// Old preview projects keep every task and their original weighted progress.
export function asPhasedProject(project){
 if(Array.isArray(project.phases))return project
 const {plans=[],...rest}=project
 return {...rest,phases:plans.length?[{id:'legacy-phase-'+project.id,title:'แผนงานเดิม',weight:100,plans}]:[]}
}
export function phaseProgress(phase){return projectProgress({plans:phase.plans||[]})}
export function projectProgress(project){
 if(Array.isArray(project.phases)){
  const phases=project.phases,plans=phases.flatMap(phase=>phase.plans||[])
  const allocatedUnits=phases.reduce((sum,phase)=>sum+units(phase.weight),0)
  // Keep both layers in integer hundredths until the final division. A tiny
  // unfinished task must not round a project up to 100%.
  const earned=phases.reduce((sum,phase)=>sum+units(phase.weight)*(phase.plans||[]).filter(plan=>plan.done).reduce((total,plan)=>total+units(plan.weight),0),0)
  return {allocated:allocatedUnits/100,progress:earned/1000000,remaining:Math.max(0,10000-allocatedUnits)/100,completed:plans.filter(plan=>plan.done).length,total:plans.length,completedPhases:phases.filter(phase=>phaseProgress(phase).progress===100).length,phaseCount:phases.length}
 }
 const plans=project.plans||[]
 const allocatedUnits=plans.reduce((sum,plan)=>sum+units(plan.weight),0)
 const progressUnits=plans.filter(plan=>plan.done).reduce((sum,plan)=>sum+units(plan.weight),0)
 return {allocated:allocatedUnits/100,progress:progressUnits/100,remaining:Math.max(0,10000-allocatedUnits)/100,completed:plans.filter(plan=>plan.done).length,total:plans.length}
}
export function validateProject(project){
 if(!project.title?.trim())return 'กรุณาใส่ชื่อโครงการ'
 if(Array.isArray(project.phases)){
  if(project.phases.some(phase=>!phase.title?.trim()))return 'กรุณาใส่ชื่อเฟสให้ครบ'
  const phaseError=validateWeights(project.phases)
  if(phaseError)return phaseError
  for(const phase of project.phases){
   if((phase.plans||[]).some(plan=>!plan.title?.trim()))return 'กรุณาใส่ชื่อแผนงานให้ครบ'
   const problem=validateWeights(phase.plans||[])
   if(problem)return problem
  }
  return ''
 }
 if((project.plans||[]).some(plan=>!plan.title?.trim()))return 'กรุณาใส่ชื่อแผนงานให้ครบ'
 return validateWeights(project.plans||[])
}
function validateWeights(rows){
 if(rows.some(row=>{const value=Number(row.weight);return !Number.isFinite(value)||value<0.01||value>100||Math.abs(value*100-Math.round(value*100))>1e-8}))return 'กำหนดน้ำหนัก 0.01–100% ทศนิยมไม่เกิน 2 ตำแหน่ง'
 if(rows.reduce((sum,row)=>sum+units(row.weight),0)>10000)return 'น้ำหนักรวมในแต่ละระดับต้องไม่เกิน 100%'
 return ''
}
