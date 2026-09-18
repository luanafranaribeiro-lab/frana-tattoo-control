// Estoque: edição e inclusão seguindo as mesmas regras do cadastro de compras.
function stockTypeOf(s){
  let t=s.type||s.cat||'Outro';
  if(t==='Cartuchos')t='Cartucho'; if(t==='Tintas')t='Tinta';
  if(t==='Transferidor')t='Transfer'; if(t==='Cartão pós-tattoo')t='Cartão pós tattoo';
  return purchaseRules[t]?t:'Outro';
}
function stockMetaFields(prefix,type,s={}){
  let r=purchaseRules[type]||purchaseRules.Outro, html='';
  let brand=s.brand||'', model=s.model||'', num=s.num||'', config=s.config||'';
  if(r.other)html+=`<div><label>Outro tipo</label><input id="${prefix}other" value="${esc(s.customType||((s.type&&!purchaseRules[s.type])?s.type:''))}"></div>`;
  if(r.cart)html+=`<div class="grid"><div><label>Numeração</label><input id="${prefix}num" value="${esc(num)}" placeholder="Ex.: 03, 05, 07"></div><div><label>Configuração</label><input id="${prefix}config" value="${esc(config)}" placeholder="Ex.: RL, RS, Magnum"></div></div>`;
  if(r.brand)html+=`<div><label>Marca</label><input id="${prefix}brand" value="${esc(brand)}"></div>`;
  if(r.desc)html+=`<div><label>${r.desc==='cor'?'Cor':'Descrição'}</label><input id="${prefix}model" value="${esc(model)}"></div>`;
  if(r.select)html+=`<div><label>Descrição</label><select id="${prefix}model">${r.select.map(x=>`<option ${x===model?'selected':''}>${x}</option>`).join('')}</select></div>`;
  if(r.vital)html+=`<div class="grid"><div><label>Largura</label><div class="row compact-unit"><input id="${prefix}vw" type="number" step=".01" value="${s.widthCm||5}"><span>cm</span></div></div><div><label>Comprimento da embalagem</label><div class="row compact-unit"><input id="${prefix}vl" type="number" step=".01" value="${s.rollLengthM||10}"><span>m</span></div></div></div>`;
  if(r.pomada)html+=`<div class="tiny">A quantidade comprada corresponde ao número de pomadas. O consumo usado no mimo é calculado separadamente.</div>`;
  if(r.card)html+=`<div class="tiny">Cartão pós tattoo: o estoque mínimo é 9 un, equivalente a 1 folha A4 impressa.</div>`;
  return html;
}
function stockIdentity(type,prefix,s={}){
  let r=purchaseRules[type]||purchaseRules.Outro;
  let custom=r.other?($(`#${prefix}other`)?.value.trim()||'Outro'):type;
  let brand=$(`#${prefix}brand`)?.value.trim()||'';
  let model=$(`#${prefix}model`)?.value.trim()||'';
  let num=$(`#${prefix}num`)?.value.trim()||'';
  let config=$(`#${prefix}config`)?.value.trim()||'';
  if(type==='Cartucho'&&(!num||!config)){alert('Informe a numeração e a configuração do cartucho.');return null}
  if(type==='Vitalderm'){
    let w=+$(`#${prefix}vw`).value||0,l=+$(`#${prefix}vl`).value||0;
    if(w<=0||l<=0){alert('Informe largura e comprimento do Vitalderm.');return null}
    model=`${fmt(w)} cm x ${fmt(l)} m`;
  }
  let detail=type==='Cartucho'?`${num}${config}`:model;
  return {type,custom,brand,model,num,config,name:[brand,detail||custom].filter(Boolean).join(' ').trim(),cat:type==='Cartucho'?'Cartuchos':type==='Tinta'?'Tintas':custom};
}
function stockUnitFields(prefix,type,s={}){
  let r=purchaseRules[type]||purchaseRules.Outro, units=r.unit?[r.unit]:(r.units||stockUnits), unit=r.unit||s.unit||units[0];
  let bought=s.purchasedQty!=null?s.purchasedQty:(s.openingPurchasedQty!=null?s.openingPurchasedQty:s.qty||0);
  let current=s.qty||0;
  let original=s.originalTotal!=null?s.originalTotal:(bought*(+s.cost||0));
  let min=r.card?9:(s.min||0);
  return `<div class="grid"><div><label>Unidade de controle</label><select id="${prefix}unit" ${r.unit?'disabled':''}>${unitOptions(unit,units)}</select></div><div><label>Quantidade comprada</label><input id="${prefix}bought" type="number" step=".01" value="${bought}"></div></div><div class="grid"><div><label>Quantidade atual</label><input id="${prefix}current" type="number" step=".01" value="${current}"></div><div><label>Custo original</label><input id="${prefix}total" type="number" step=".01" value="${original}"></div></div><div><label>Estoque mínimo</label><input id="${prefix}min" type="number" step=".01" value="${min}" ${r.card?'readonly':''}></div><div class="tiny">O custo por ${esc(unit)} é calculado pelo valor da embalagem fechada ÷ quantidade comprada. A quantidade atual é o que realmente resta no estoque.</div>`;
}
function existingStockEntry(){
  form('Incluir estoque existente',`<label>Tipo</label><select id="etype">${typeOptions()}</select><div id="existingFields"></div>`,saveExistingStock,'Incluir no estoque');
  $('#etype').onchange=renderExistingFields; renderExistingFields();
}
function renderExistingFields(){let t=$('#etype').value;$('#existingFields').innerHTML=stockMetaFields('e',t)+stockUnitFields('e',t,{})}
function saveExistingStock(){
  let type=$('#etype').value,r=purchaseRules[type]||purchaseRules.Outro,id=stockIdentity(type,'e'); if(!id)return;
  let bought=+$('#ebought').value,current=+$('#ecurrent').value,total=+$('#etotal').value,unit=r.unit||$('#eunit').value,min=r.card?9:(+$('#emin').value||0);
  if(bought<=0){alert('Informe a quantidade comprada.');return} if(current<0){alert('Informe uma quantidade atual válida.');return}
  let s={id:uid(),name:id.name,cat:id.cat,type:id.type,customType:id.custom,brand:id.brand,model:id.model,num:id.num,config:id.config,unit,purchasedQty:bought,openingPurchasedQty:bought,qty:current,originalTotal:total,cost:total/bought,min,openingStock:true};
  if(type==='Vitalderm'){s.widthCm=+$('#evw').value;s.rollLengthM=+$('#evl').value}
  db.stock.push(s);save();closeM();render();
}
function stockSheet(id){
  let s=db.stock.find(x=>x.id===id);if(!s)return;let type=stockTypeOf(s);
  form('Editar material',`<label>Tipo</label><select id="stype">${typeOptions(type)}</select><div id="stockEditFields"></div><button class="btn danger full" id="sd">Excluir item</button>`,()=>saveStockSheet(id),'Salvar');
  let draw=()=>{let t=$('#stype').value;$('#stockEditFields').innerHTML=stockMetaFields('s',t,s)+stockUnitFields('s',t,s)};$('#stype').onchange=draw;draw();
  $('#sd').onclick=()=>{if(confirm('Excluir este material do estoque?')){db.stock=db.stock.filter(x=>x.id!==id);db.kits.forEach(k=>k.materials=(k.materials||[]).filter(m=>m.stockId!==id));save();closeM();render()}};
}
function saveStockSheet(id){
  let s=db.stock.find(x=>x.id===id);if(!s)return;let type=$('#stype').value,r=purchaseRules[type]||purchaseRules.Outro,meta=stockIdentity(type,'s',s);if(!meta)return;
  let bought=+$('#sbought').value,current=+$('#scurrent').value,total=+$('#stotal').value,unit=r.unit||$('#sunit').value,min=r.card?9:(+$('#smin').value||0);
  if(bought<=0){alert('Informe a quantidade comprada.');return}if(current<0){alert('Informe uma quantidade atual válida.');return}
  Object.assign(s,{name:meta.name,cat:meta.cat,type:meta.type,customType:meta.custom,brand:meta.brand,model:meta.model,num:meta.num,config:meta.config,unit,purchasedQty:bought,qty:current,originalTotal:total,cost:total/bought,min});
  if(type==='Vitalderm'){s.widthCm=+$('#svw').value;s.rollLengthM=+$('#svl').value}
  if(typeof mimoRefreshCost==='function')mimoRefreshCost();
  save();closeM();render();
}
// Compras novas passam a guardar também a quantidade total comprada e o custo original acumulado do item.
const _savePurchaseStockBase=savePurchase;
savePurchase=function(){
  let selected=$('#ptype').value,r=purchaseRules[selected]||purchaseRules.Outro,type=selected==='Outro'?($('#pother')?.value.trim()||'Outro'):selected,brand=$('#pbrand')?.value.trim()||'',model=$('#pmodel')?.value.trim()||'',num=$('#pnum')?.value.trim()||'',config=$('#pconfig')?.value.trim()||'',qty=+$('#pqty').value,total=+$('#pcost').value,min=r.card?9:(+$('#pmin').value||0),unit=r.unit||$('#punit').value;
  if(qty<=0){alert('Informe a quantidade.');return}if(selected==='Cartucho'&&(!num||!config)){alert('Informe a numeração e a configuração do cartucho.');return}
  if(selected==='Vitalderm'){let width=+$('#pvw').value||0,length=+$('#pvl').value||0;if(width<=0||length<=0){alert('Informe largura e comprimento do Vitalderm.');return}model=`${fmt(width)} cm x ${fmt(length)} m`}
  let detail=selected==='Cartucho'?`${num}${config}`:model,name=[brand,detail||type].filter(Boolean).join(' ').trim(),cat=selected==='Cartucho'?'Cartuchos':selected==='Tinta'?'Tintas':type;
  let old=db.stock.find(x=>x.name.toLowerCase()===name.toLowerCase()&&x.unit===unit);
  if(old){let bought=old.purchasedQty!=null?+old.purchasedQty:(+old.qty||0),orig=old.originalTotal!=null?+old.originalTotal:bought*(+old.cost||0);old.purchasedQty=bought+qty;old.originalTotal=orig+total;old.cost=old.originalTotal/old.purchasedQty;old.qty=(+old.qty||0)+qty;old.min=min||old.min;old.cat=cat;old.type=selected;old.brand=brand;old.model=model;old.num=num;old.config=config}
  else{old={id:uid(),name,cat,qty,unit,cost:total/qty,min,type:selected,brand,model,num,config,purchasedQty:qty,originalTotal:total};if(selected==='Vitalderm'){old.widthCm=+$('#pvw').value;old.rollLengthM=+$('#pvl').value}db.stock.push(old)}
  db.purchases.push({id:uid(),stockId:old.id,name,qty,total,unit,type:selected,date:new Date().toISOString().slice(0,10)});if(typeof mimoRefreshCost==='function')mimoRefreshCost();save();closeM();page='stock';render();
};