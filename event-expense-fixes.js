// Despesas do evento: categorias rápidas, edição e cálculo automático de gasolina.
const EVENT_EXPENSE_TYPES=['Inscrição','Gasolina','Alimentação','Pedágio'];
function eventExpenseFields(x=null){
  let type=x?.expenseType||x?.desc||'Inscrição';
  if(!EVENT_EXPENSE_TYPES.includes(type))type='Inscrição';
  return `<label>Tipo</label><select id="xType">${EVENT_EXPENSE_TYPES.map(v=>`<option ${v===type?'selected':''}>${v}</option>`).join('')}</select><div id="xGas"></div><div id="xValueWrap"><label>Valor</label><input id="xv" type="number" step=".01" min="0" value="${x?.value??''}"></div>`;
}
function eventGasFields(x=null){
  let km=x?.gasKm??'',cons=x?.gasKmL??db.settings.kmL??'',price=x?.gasPrice??db.settings.fuel??'';
  return `<div class="card"><div class="grid"><div><label>Distância total (km)</label><input id="xgkm" type="number" step=".1" min="0" value="${km}"></div><div><label>Consumo do carro (km/L)</label><input id="xgcons" type="number" step=".1" min="0" value="${cons}"></div></div><label>Gasolina (R$/L)</label><input id="xgprice" type="number" step=".01" min="0" value="${price}"><div class="row" style="margin-top:8px"><span class="sub">Valor calculado</span><b id="xgresult">R$ 0,00</b></div></div>`;
}
function eventExpenseRefresh(x=null){
  let gas=$('#xType')?.value==='Gasolina',box=$('#xGas');
  if(box)box.innerHTML=gas?eventGasFields(x):'';
  if(gas){let calc=()=>{let km=+$('#xgkm')?.value||0,cons=+$('#xgcons')?.value||0,price=+$('#xgprice')?.value||0,v=cons>0?km/cons*price:0;if($('#xv'))$('#xv').value=v?v.toFixed(2):'';if($('#xgresult'))$('#xgresult').textContent=money(v)};['xgkm','xgcons','xgprice'].forEach(id=>{let el=$('#'+id);if(el)el.oninput=calc});calc()}
}
function eventExpenseForm(eventId,x=null){
  form(x?'Editar despesa':'Despesa do evento',eventExpenseFields(x),()=>{
    let type=$('#xType').value,value=+$('#xv').value||0;
    if(value<0)return;
    let data={desc:type,expenseType:type,value,eventId,kind:'operational',date:x?.date||new Date().toISOString().slice(0,10)};
    if(type==='Gasolina'){data.gasKm=+$('#xgkm')?.value||0;data.gasKmL=+$('#xgcons')?.value||0;data.gasPrice=+$('#xgprice')?.value||0}
    if(x)Object.assign(x,data);else db.expenses.push({id:uid(),...data});
    save();closeM();render();
  },x?'Salvar alterações':'Adicionar');
  $('#xType').onchange=()=>eventExpenseRefresh(null);
  eventExpenseRefresh(x);
}
function newExpense(eventId=null){if(eventId!=null)return eventExpenseForm(eventId);form('Despesa geral',`<label>Descrição</label><input id="xd"><label>Valor</label><input id="xv" type="number" step=".01">`,()=>{db.expenses.push({id:uid(),desc:$('#xd').value||'Despesa',value:+$('#xv').value,eventId,kind:'operational',date:new Date().toISOString().slice(0,10)});save();closeM();render()})}
function editEventExpense(id){let x=db.expenses.find(e=>e.id===id);if(x)eventExpenseForm(x.eventId,x)}
function deleteEventExpense(id){if(!confirm('Excluir esta despesa?'))return;db.expenses=db.expenses.filter(x=>x.id!==id);save();closeM();render()}
function eventExpenseSheet(id){let x=db.expenses.find(e=>e.id===id);if(!x)return;let gas=x.expenseType==='Gasolina'? `<div class="tiny">${fmt(x.gasKm||0)} km · ${fmt(x.gasKmL||0)} km/L · ${money(x.gasPrice||0)}/L</div>`:'';form(x.expenseType||x.desc,`<div class="card"><div class="row"><span>Valor</span><b>${money(x.value)}</b></div>${gas}</div><div class="grid"><button class="btn light" type="button" id="xeEdit">Editar</button><button class="btn danger" type="button" id="xeDel">Excluir</button></div>`,closeM,'Fechar');$('#xeEdit').onclick=()=>eventExpenseForm(x.eventId,x);$('#xeDel').onclick=()=>deleteEventExpense(id)}
const eventViewBeforeExpenseFix=eventView;
eventView=function(id){
  let html=eventViewBeforeExpenseFix(id),e=db.events.find(x=>x.id===id);if(!e)return html;
  let ex=db.expenses.filter(x=>x.eventId===id&&!['purchase','test'].includes(x.kind));
  let old=ex.map(x=>line(x.desc,x.value)).join('')||empty('Sem despesas.');
  let rows=ex.map(x=>`<button class="event-line full-card" onclick="eventExpenseSheet(${x.id})"><div><b>${esc(x.expenseType||x.desc||'Despesa')}</b>${x.expenseType==='Gasolina'&&x.gasKm?`<div class="tiny">${fmt(x.gasKm)} km</div>`:''}</div><b>${money(x.value)}</b></button>`).join('')||empty('Sem despesas.');
  return html.replace(old,rows);
};