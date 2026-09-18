// Tattoos: histórico agrupado por evento + agenda dedicada.
function tattooHistoryEventCard(e,tt){
  let rev=tt.reduce((s,t)=>s+(+(t.received==null?t.price:t.received)||0),0);
  return `<button class="card full-card" onclick="openEvent(${e.id})"><div class="row"><div><b>${esc(e.name||'Evento')}</b><div class="tiny">${esc(e.date||'')}</div></div><span class="pill">Evento</span></div><div class="row" style="margin-top:8px"><span>${tt.length} ${tt.length===1?'tattoo':'tattoos'}</span><b>Recebido ${money(rev)}</b></div></button>`;
}
function tattooHistoryRegularCard(t){
  let profit=(+t.price||0)-(+t.cost||0);
  return `<button class="card full-card" onclick="tattooSheet(${t.id})"><div class="row"><div><b>${esc(t.client||t.name||'Tattoo')}</b><div class="tiny">${esc(t.date||t.isoDate||'')}</div></div><b>${money(t.price)}</b></div><div class="tiny">Custo materiais ${money(t.cost)} · Lucro ${money(profit)}</div></button>`;
}
function agendaView(){
  let rows=active().slice().sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).map(a=>`<button class="card full-card" onclick="appointmentSheet(${a.id})"><div class="row"><div><b>${esc(a.client||'Cliente')}</b><div class="tiny">${esc(a.date||'')}${a.time?' · '+esc(a.time):''}</div></div><b>${money(a.price)}</b></div></button>`).join('');
  form('Agenda',rows||empty('Nenhum agendamento.'),closeM,'Fechar');
}
function tattoos(){
  let eventIds=[...new Set(db.tattoos.filter(t=>t.eventId!=null).map(t=>String(t.eventId)))];
  let eventCards=eventIds.map(id=>{let e=db.events.find(x=>String(x.id)===id),tt=db.tattoos.filter(t=>String(t.eventId)===id);return e?tattooHistoryEventCard(e,tt):tt.map(tattooHistoryRegularCard).join('')}).join('');
  let regular=db.tattoos.filter(t=>t.eventId==null).slice().reverse().map(tattooHistoryRegularCard).join('');
  return `<div class="row"><div class="brand">Tattoos</div><button class="btn light" onclick="agendaView()">Agenda</button></div><button class="btn full" onclick="newTattoo()">+ Registrar tattoo</button><h2>Histórico</h2>${eventCards+regular||'<div class="card sub">Nenhuma tattoo registrada ainda.</div>'}`;
}
function tattooSheet(id){
  let t=db.tattoos.find(x=>x.id===id);if(!t)return;
  if(t.eventId!=null){let e=db.events.find(x=>String(x.id)===String(t.eventId)),rec=t.received==null?t.price:t.received;form(esc(t.client||t.name||'Flash'),`<div class="card">${e?`<div class="tiny">${esc(e.name)} · ${esc(e.date||t.date||'')}</div>`:''}<div class="row"><span>Recebido</span><b>${money(rec)}</b></div></div><div class="actions"><button id="editT">Editar</button><button id="delT">Excluir</button></div>`,closeM,'Fechar');$('#editT').onclick=()=>newTattoo(t);$('#delT').onclick=()=>{restore(t);db.tattoos=db.tattoos.filter(x=>x.id!==id);save();closeM();render()};return}
  let profit=(+t.price||0)-(+t.cost||0);
  form(esc(t.client||t.name||'Tattoo'),`<div class="card"><div class="row"><span>Valor</span><b>${money(t.price)}</b></div><div class="row"><span>Custo materiais</span><b>${money(t.cost)}</b></div><div class="row"><span>Lucro</span><b>${money(profit)}</b></div></div><div class="actions"><button id="editT">Editar</button><button id="delT">Excluir</button></div>`,closeM,'Fechar');$('#editT').onclick=()=>newTattoo(t);$('#delT').onclick=()=>{restore(t);db.tattoos=db.tattoos.filter(x=>x.id!==id);save();closeM();render()}
}