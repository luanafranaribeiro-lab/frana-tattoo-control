// Registro de tattoo: materiais padrão automáticos + variáveis selecionáveis.
const TR_INK_ML=.5;
function trType(s){return typeof stockTypeOf==='function'?stockTypeOf(s):(s.type||s.customType||s.cat||'')}
function trFind(re){let matches=db.stock.filter(s=>re.test(`${trType(s)} ${s.customType||''} ${s.cat||''} ${s.name||''} ${s.model||''}`));return matches.find(s=>(+s.qty||0)>0)||matches[0]}
function trAdd(out,s,qty){if(s&&qty>0)out.push({stockId:s.id,qty})}
function trMimoParts(){return{card:trFind(/cart[aã]o.*p[oó]s/i),pot:trFind(/potinho/i),ointment:trFind(/pomada/i)}}
function trMimoMaterials(qty=1){let p=trMimoParts(),out=[];trAdd(out,p.card,qty);trAdd(out,p.pot,qty);/* Pomada cadastrada em unidades: custo/consumo do mimo = 3g proporcional, sem baixar 3 tubos inteiros. */return out}
function trIsMimoPart(s){return /cart[aã]o.*p[oó]s|potinho|pomada/i.test(`${trType(s)} ${s.name||''}`)}
function trStandardMaterials(){
 let out=[];
 trAdd(out,trFind(/papel.*vegetal/i),1);
 trAdd(out,trFind(/gilete/i),1);
 trAdd(out,trFind(/luvas?/i),2);
 trAdd(out,trFind(/papel.*toalha/i),3);
 trAdd(out,trFind(/transfer/i),1);
 trAdd(out,trFind(/sabonete/i),1);
 trAdd(out,trFind(/papel(?!.*toalha)(?!.*vegetal)/i),3);
 trAdd(out,trFind(/palito|mexedor.*caf[eé]/i),1);
 trAdd(out,trFind(/vaselina/i),3);
 trMimoMaterials(1).forEach(m=>out.push(m));
 return out;
}
function trCartOptions(){return db.stock.filter(s=>trType(s)==='Cartucho'&&(+s.qty||0)>0).map(s=>`<option value="${s.id}">${esc(s.name)} · ${fmt(s.qty)} un</option>`).join('')}
function trInkOptions(){return db.stock.filter(s=>trType(s)==='Tinta'&&!/(branc|white)/i.test(`${s.name||''} ${s.model||''}`)&&(+s.qty||0)>0).map(s=>`<option value="${s.id}">${esc(s.name)} · ${fmt(s.qty)} ml</option>`).join('')}
function trCartRow(){let o=trCartOptions();return o?`<div class="row tr-cart-row" style="gap:8px"><select class="tr-cart" style="flex:1">${o}</select><input class="tr-cart-q" type="number" min="1" step="1" value="1" style="width:68px"><button type="button" class="btn light tr-del">✕</button></div>`:empty('Nenhum cartucho disponível.')}
function trInkRow(){let o=trInkOptions();return o?`<div class="row tr-ink-row" style="gap:8px"><select class="tr-ink" style="flex:1">${o}</select><button type="button" class="btn light tr-del">✕</button></div>`:empty('Nenhuma tinta disponível.')}
function trBind(){document.querySelectorAll('.tr-del').forEach(b=>b.onclick=()=>b.closest('.tr-cart-row,.tr-ink-row')?.remove())}
function trAutoSummary(){return trStandardMaterials().map(m=>{let s=db.stock.find(x=>String(x.id)===String(m.stockId));return s?`${esc(s.name)}: ${fmt(m.qty)} ${esc(s.unit||'un')}`:''}).filter(Boolean).join(' · ')}
function trConfiguredStandardMaterials(){let base=trStandardMaterials(),cfg=db.settings.trStandard||{};return base.map(m=>({stockId:m.stockId,qty:Object.prototype.hasOwnProperty.call(cfg,String(m.stockId))?+cfg[String(m.stockId)]||0:m.qty})).filter(m=>m.qty>0)}
function trStandardEditor(){let rows=trConfiguredStandardMaterials().map(m=>{let s=db.stock.find(x=>String(x.id)===String(m.stockId));return s?`<div class="row item"><div><b>${esc(s.name)}</b><div class="tiny">${esc(s.unit||'un')}</div></div><input data-trstd="${s.id}" type="number" step=".01" min="0" value="${m.qty}" style="width:82px"></div>`:''}).join('');form('Materiais padrão',rows||empty('Nenhum material padrão encontrado.'),()=>{let cfg={};document.querySelectorAll('[data-trstd]').forEach(i=>cfg[i.dataset.trstd]=Math.max(0,+i.value||0));db.settings.trStandard=cfg;save();closeM();newTattoo(null,window.__trAppointment||null,window.__trEventId??null)},'Salvar')}
function newTattoo(edit=null,appointment=null,eventId=null){
 if(edit)return trLegacyEdit(edit,appointment,eventId);
 window.__trAppointment=appointment;window.__trEventId=eventId;
 form('Registrar tattoo',`<label>Cliente / identificação</label><input id="tc" value="${esc(appointment?.client||'')}"><div class="grid"><div><label>Valor</label><input id="tp" type="number" step=".01" value="${appointment?.price??db.settings.minimum}"></div><div><label>Recebido</label><input id="tr" type="number" step=".01" value="${appointment?appointment.price:''}"></div></div><h2>Cartucho</h2><div id="trCarts">${trCartRow()}</div><button type="button" class="btn light full" id="trAddCart">+ Outro cartucho</button><h2>Tinta</h2><div id="trInks">${trInkRow()}</div><button type="button" class="btn light full" id="trAddInk">+ Outra tinta</button><div class="tiny">Cada tinta usa 0,5 ml e 1 batoque P.</div><label class="row item"><span><b>Detalhe branco</b><div class="tiny">0,5 ml de branco + copinho + 0,2 g solidificador</div></span><input id="trWhite" type="checkbox" style="width:auto"></label><label>Vitalderm usado (cm)</label><input id="trVital" type="number" step=".1" min="0" value="5"><button type="button" class="btn light full" id="trEditStd">⚙ Materiais padrão</button>`,()=>trSaveNew(appointment,eventId),'Registrar tattoo');
 $('#trAddCart').onclick=()=>{$('#trCarts').insertAdjacentHTML('beforeend',trCartRow());trBind()};
 $('#trAddInk').onclick=()=>{$('#trInks').insertAdjacentHTML('beforeend',trInkRow());trBind()};$('#trEditStd').onclick=trStandardEditor;trBind();
}
function trLegacyEdit(edit,appointment,eventId){let mats=edit.materials||[],mimo=mats.some(m=>{let s=db.stock.find(x=>String(x.id)===String(m.stockId));return s&&trIsMimoPart(s)});let visible=mats.filter(m=>{let s=db.stock.find(x=>String(x.id)===String(m.stockId));return !s||!trIsMimoPart(s)});form('Editar tattoo',`<label>Cliente / identificação</label><input id="tc" value="${esc(edit.client||edit.name||'')}"><div class="grid"><div><label>Valor total</label><input id="tp" type="number" step=".01" value="${edit.price||0}"></div><div><label>Total recebido</label><input id="tr" type="number" step=".01" value="${edit.received??edit.price??0}"></div></div><label>Materiais usados</label>${mimo?'<div class="card row"><b>Mimo</b><b>1 un</b></div>':''}${materialRows(visible)}`,()=>saveTattoo(edit,appointment,eventId),'Salvar alterações')}
function trSaveNew(appointment,eventId){
 let mats=trConfiguredStandardMaterials(),caps=trFind(/batoque.*\bP\b/i),vital=trFind(/vitalderm/i);
 document.querySelectorAll('.tr-cart-row').forEach(r=>{let id=r.querySelector('.tr-cart')?.value,q=+r.querySelector('.tr-cart-q')?.value||0;if(id&&q)trAdd(mats,db.stock.find(s=>String(s.id)===id),q)});
 let inks=0;document.querySelectorAll('.tr-ink-row').forEach(r=>{let id=r.querySelector('.tr-ink')?.value;if(id){trAdd(mats,db.stock.find(s=>String(s.id)===id),TR_INK_ML);inks++}});
 if(inks)trAdd(mats,caps,inks);
 let whiteOn=!!$('#trWhite')?.checked;if(whiteOn){trAdd(mats,db.stock.find(s=>trType(s)==='Tinta'&&/(branc|white)/i.test(`${s.name||''} ${s.model||''}`)),TR_INK_ML);trAdd(mats,caps,1);let cup=trFind(/copinho|copo.*caf[eé]/i),solid=trFind(/solidificador/i);trAdd(mats,cup,1);trAdd(mats,solid,.2)}
 let cm=+$('#trVital').value||0;if(cm>0)trAdd(mats,vital,cm/100);
 let map=new Map();for(let m of mats)map.set(String(m.stockId),(map.get(String(m.stockId))||0)+(+m.qty||0));mats=[...map].map(([id,qty])=>{let s=db.stock.find(x=>String(x.id)===id);return{stockId:s?s.id:id,qty}});
 for(let m of mats){let s=db.stock.find(x=>String(x.id)===String(m.stockId));if(!s||m.qty>(+s.qty||0)){alert(`Estoque insuficiente para ${s?.name||'material'}.`);return}}
 let cost=0;for(let m of mats){let s=db.stock.find(x=>String(x.id)===String(m.stockId));s.qty-=m.qty;cost+=m.qty*(+s.cost||0);db.moves.push({id:uid(),stockId:s.id,qty:-m.qty,type:'consumo',date:new Date().toISOString()})}
 let price=+$('#tp').value||0,received=Math.min(price,Math.max(0,+$('#tr').value||0));db.tattoos.push({id:uid(),client:$('#tc').value||'Tattoo',price,received,cost,materials:mats,eventId:eventId??null,date:new Date().toISOString().slice(0,10),whiteDetail:whiteOn});
 if(appointment)db.appointments=db.appointments.filter(a=>a.id!==appointment.id);save();closeM();render();
}