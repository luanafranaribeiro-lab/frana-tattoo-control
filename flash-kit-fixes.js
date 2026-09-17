// Kit Flash Evento: configuração do botão dentro de Estoque.
const FLASH_KIT_DEFAULTS=[
 {key:'gloves',label:'Luvas',qty:2,unit:'un',scope:'flash'},
 {key:'soap',label:'Sabonete neutro',qty:0,unit:'ml',scope:'flash'},
 {key:'razor',label:'Gilete',qty:1,unit:'un',scope:'flash'},
 {key:'paper',label:'Papel',qty:3,unit:'un',scope:'flash'},
 {key:'transfer',label:'Transfer',qty:0,unit:'ml',scope:'flash'},
 {key:'printed',label:'Flash impresso 5 × 5 cm',qty:1,unit:'un',scope:'flash'},
 {key:'cap',label:'Batoque',qty:1,unit:'un',scope:'flash'},
 {key:'stick',label:'Mexedor de café',qty:1,unit:'un',scope:'flash'},
 {key:'vaseline',label:'Vaselina',qty:0,unit:'g',scope:'flash'},
 {key:'vitalderm',label:'Vitalderm 5 × 5 cm',qty:.05,unit:'m',scope:'flash'},
 {key:'gift',label:'Mimo',qty:1,unit:'un',scope:'flash'},
 {key:'film',label:'Plástico filme',qty:0,unit:'m',scope:'flash'},
 {key:'tape',label:'Fita crepe',qty:0,unit:'m',scope:'flash'},
 {key:'bandage',label:'Bandagem',qty:0,unit:'m',scope:'flash'},
 {key:'mask',label:'Máscara',qty:1,unit:'un',scope:'event'}
];
function ensureFlashKit(){
 let k=db.kits[0];
 if(!k){k={id:uid(),name:'Kit Flash Evento',materials:[]};db.kits.push(k)}
 if(!Array.isArray(k.defaults)||!k.defaults.length)k.defaults=FLASH_KIT_DEFAULTS.map(x=>({...x}));
 return k;
}
function flashDefaultRows(k){return k.defaults.map((x,i)=>`<div class="card"><label>Material</label><input id="fkl${i}" value="${esc(x.label)}"><div class="grid"><div><label>Quantidade</label><input id="fkq${i}" type="number" step=".001" min="0" value="${x.qty}"></div><div><label>Unidade</label><select id="fku${i}">${unitOptions(x.unit||'un')}</select></div></div><label>Consumo</label><select id="fks${i}"><option value="flash" ${x.scope!=='event'?'selected':''}>Por flash</option><option value="event" ${x.scope==='event'?'selected':''}>Por evento</option></select><button class="btn light full" type="button" onclick="removeFlashDefault(${i})">Remover</button></div>`).join('')}
function kitsView(){
 let k=ensureFlashKit();
 form('Kit Flash Evento',`<div class="tiny">Materiais recorrentes do evento. Quantidade, unidade e consumo podem ser editados. Cartucho e tinta continuam variáveis em cada flash.</div><label>Nome do kit</label><input id="kn" value="${esc(k.name||'Kit Flash Evento')}"><h2>Itens do kit</h2><div id="flashDefaults">${flashDefaultRows(k)}</div><button class="btn light full" id="flashDefaultAdd">+ Adicionar tópico</button><h2>Materiais vinculados ao estoque</h2>${kitItemRows(k)}<button class="btn light full" id="kitAdd">+ Adicionar material do estoque</button><div class="card"><b>Detalhe branco</b><div class="tiny">No Flash Rápida, ao marcar “Detalhe branco”: acrescentar 1 batoque P + tinta branca + 1 copinho pequeno de café com água. Usar o mesmo cartucho; não acrescentar outro.</div></div>`,()=>{
   k.name=$('#kn').value.trim()||'Kit Flash Evento';
   k.defaults.forEach((x,i)=>{x.label=$(`#fkl${i}`).value.trim()||x.label;x.qty=Math.max(0,+$(`#fkq${i}`).value||0);x.unit=$(`#fku${i}`).value;x.scope=$(`#fks${i}`).value});
   save();closeM();render();
 },'Salvar kit');
 $('#kitAdd').onclick=()=>kitAddPicker(k);
 $('#flashDefaultAdd').onclick=()=>{k.defaults.push({key:'custom_'+uid(),label:'Novo material',qty:1,unit:'un',scope:'flash'});save();kitsView()};
}
function removeFlashDefault(i){let k=ensureFlashKit();k.defaults.splice(i,1);save();kitsView()}
