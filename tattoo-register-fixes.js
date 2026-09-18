// Registro de tattoo: materiais padrão automáticos + variáveis selecionáveis.
const TR_INK_ML=.5;
function trType(s){return typeof stockTypeOf==='function'?stockTypeOf(s):(s.type||s.customType||s.cat||'')}
function trFind(re){return db.stock.find(s=>re.test(`${trType(s)} ${s.customType||''} ${s.cat||''} ${s.name||''} ${s.model||''}`))}
function trAdd(out,s,qty){if(s&&qty>0)out.push({stockId:s.id,qty})}
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
 trAdd(out,trFind(/cart[aã]o.*p[oó]s/i),1);
 trAdd(out,trFind(/potinho/i),1);
 trAdd(out,trFind(/pomada/i),3);
 return out;
}
function trCartOptions(){return db.stock.filter(s=>trType(s)==='Cartucho'&&(+s.qty||0)>0).map(s=>`<option value="${s.id}">${esc(s.name)} · ${fmt(s.qty)} un</option>`).join('')}
function trInkOptions(){return db.stock.filter(s=>trType(s)==='Tinta'&&!/(branc|white)/i.test(`${s.name||''} ${s.model||''}`)&&(+s.qty||0)>0).map(s=>`<option value="${s.id}">${esc(s.name)} · ${fmt(s.qty)} ml</option>`).join('')}
function trCartRow(){let o=trCartOptions();return o?`<div class="row tr-cart-row" style="gap:8px"><select class="tr-cart" style="flex:1">${o}</select><input class="tr-cart-q" type="number" min="1" step="1" value="1" style="width:68px"><button type="button" class="btn light tr-del">✕</button></div>`:empty('Nenhum cartucho disponível.')}
function trInkRow(){let o=trInkOptions();return o?`<div class="row tr-ink-row" style="gap:8px"><select class="tr-ink" style="flex:1">${o}</select><button type="button" class="btn light tr-del">✕</button></div>`:empty('Nenhuma tinta disponível.')}
function trBind(){document.querySelectorAll('.tr-del').forEach(b=>b.onclick=()=>b.closest('.tr-cart-row,.tr-ink-row')?.remove())}
function trAutoSummary(){return trStandardMaterials().map(m=>{let s=db.stock.find(x=>String(x.id)===String(m.stockId));return s?`${esc(s.name)}: ${fmt(m.qty)} ${esc(s.unit||'un')}`:''}).filter(Boolean).join(' · ')}
function newTattoo(edit=null,appointment=null,eventId=null){
 if(edit)return trLegacyEdit(edit,appointment,eventId);
 form('Registrar tattoo',`<label>Cliente / identificação</label><input id="tc" value="${esc(appointment?.client||'')}"><div class="grid"><div><label>Valor</label><input id="tp" type="number" step=".01" value="${appointment?.price??db.settings.minimum}"></div><div><label>Recebido</label><input id="tr" type="number" step=".01" value="${appointment?appointment.price:''}"></div></div><h2>Cartucho</h2><div id="trCarts">${trCartRow()}</div><button type="button" class="btn light full" id="trAddCart">+ Outro cartucho</button><h2>Tinta</h2><div id="trInks">${trInkRow()}</div><button type="button" class="btn light full" id="trAddInk">+ Outra tinta</button><div class="tiny">Cada tinta usa 0,5 ml e 1 batoque P.</div><label class="row item"><span><b>Detalhe branco</b><div class="tiny">0,5 ml de branco + copinho + 0,2 g solidificador</div></span><input id="trWhite" type="checkbox" style="width:auto"></label><label>Vitalderm usado (cm)</label><input id="trVital" type="number" step=".1" min="0" value="5"><details><summary>Ver materiais padrão</summary><div class="card tiny">${trAutoSummary()}</div></details>`,()=>trSaveNew(appointment,eventId),'Registrar tattoo');
 $('#trAddCart').onclick=()=>{$('#trCarts').insertAdjacentHTML('beforeend',trCartRow());trBind()};
 $('#trAddInk').onclick=()=>{$('#trInks').insertAdjacentHTML('beforeend',trInkRow());trBind()};trBind();
}
function trLegacyEdit(edit,appointment,eventId){form('Editar tattoo',`<label>Cliente / identificação</label><input id="tc" value="${esc(edit.client||edit.name||'')}"><div class="grid"><div><label>Valor total</label><input id="tp" type="number" step=".01" value="${edit.price||0}"></div><div><label>Total recebido</label><input id="tr" type="number" step=".01" value="${edit.received??edit.price??0}"></div></div><label>Materiais usados</label>${materialRows(edit.materials||[])}`,()=>saveTattoo(edit,appointment,eventId),'Salvar alterações')}
function trSaveNew(appointment,eventId){
 let mats=trStandardMaterials(),caps=trFind(/batoque.*\bP\b/i),vital=trFind(/vitalderm/i);
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