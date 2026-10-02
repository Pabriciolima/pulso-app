export const ALARM_SYMPTOMS = new Set(['Dor / pressão forte no peito','Falta de ar','Dor de cabeça súbita e intensa','Desmaio','Alteração da visão / fala ou fraqueza']);
export function adviceFor({systolic, diastolic, symptoms=[]}) {
  if(symptoms.some(s=>ALARM_SYMPTOMS.has(s))) return {level:'danger',label:'Sintoma de alarme',title:'Procure atendimento agora',text:'Esse sintoma precisa de avaliação imediata, independentemente do valor da pressão. Procure uma emergência ou ligue SAMU 192. Não espere outra medição ou a consulta marcada.',emergency:true};
  if(systolic>=180 || diastolic>=120) return {level:'danger',label:'Valor muito alto',title:'Precisa de atenção imediata',text:'Sem sintomas de alarme, repita após pelo menos 1 minuto. Se continuar com sistólica ≥ 180 OU diastólica ≥ 120, contate imediatamente um profissional de saúde. Se surgir dor no peito, falta de ar ou outro sintoma de alarme, ligue 192. Não tome dose extra por conta própria.',emergency:false};
  if((systolic && systolic<90) || (diastolic && diastolic<60)) return {level:'attention',label:'Valor baixo',title:'Observe os sintomas',text:'A pressão está em uma faixa baixa. Se estiver com tontura ou mal-estar, procure orientação médica. Desmaio, dor no peito ou falta de ar exigem emergência. Não altere a medicação por conta própria.'};
  if(symptoms.length) return {level:'attention',label:'Com sintomas',title:'Converse com a equipe de saúde',text:'Registre quando os sintomas começaram e procure orientação médica, especialmente se forem novos, persistentes ou estiverem piorando. Não atribua a dor de cabeça automaticamente à pressão. Sintomas de alarme exigem emergência.'};
  if(systolic>=140 || diastolic>=90) return {level:'attention',label:'Valor elevado',title:'Acompanhe com seu médico',text:'Descanse sentado e confira a técnica de medição. Registre uma segunda medida com pelo menos 1 minuto de intervalo. Se valores elevados se repetirem, converse com seu médico. Siga apenas o tratamento prescrito; não ajuste doses.'};
  return {level:'calm',label:'Registro realizado',title:'Continue seu acompanhamento',text:'Mantenha o registro nos horários combinados com seu médico. Uma medida isolada não confirma nem descarta hipertensão. Compare o histórico com o alvo individual definido na consulta.'};
}
export function validateReading(r, now=new Date()) {
  if(!Number.isInteger(r.systolic)||r.systolic<50||r.systolic>300) throw Error('Confira a sistólica: use o valor em mmHg, por exemplo 120, não 12.');
  if(!Number.isInteger(r.diastolic)||r.diastolic<30||r.diastolic>200) throw Error('Confira a diastólica: use o valor em mmHg, por exemplo 80, não 8.');
  if(r.systolic<=r.diastolic) throw Error('A sistólica precisa ser maior que a diastólica. Confira os números no aparelho.');
  if(r.pulse!==null&&(!Number.isInteger(r.pulse)||r.pulse<20||r.pulse>250)) throw Error('Confira o pulso: digite um valor entre 20 e 250 bpm, ou deixe em branco.');
  const date=new Date(r.measured_at); if(Number.isNaN(date.getTime())||date>now) throw Error('Informe uma data e hora válidas, sem usar um horário futuro.');
  if(!['Manhã','Tarde','Noite'].includes(r.period)) throw Error('Escolha um período válido.');
}
