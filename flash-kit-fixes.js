// Kit Flash Evento: materiais recorrentes editáveis por flash/evento.
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
function flashKitConfig(){db.settings=db.settings||{};if(!Array.isArray(db.settings.flashKit))db.settings.flashKit=FLASH_KIT_DEFAULTS.map(x=>({...x}));return db.settings.flashKit}
function flashKitEditor(){let kit=flashKitConfig();form('Kit Flash Evento',`<div class="tiny" style="margin-bottom:10px">Materiais padrão. Tudo abaixo pode ser editado. Cartucho e tinta continuam variáveis em cada flash.</div><div id="fkrows">${kit.map((x,i)=>flashKitRow(x,i)).join('')}</div><button class="btn light full" id="fkadd">+ Adicionar material</button><div class="card" style="margin-top:12px"><b>Detalhe branco</b><div class="tiny">Quando marcado no Flash Rápida: usa 1 batoque P + tinta branca + 1 copinho pequeno com água. Não adiciona outro cartucho.</div></div>`,saveFlashKit,'Salvar kit');$('#fkadd').onclick=()=>{kit.push({key:'custom_'+uid(),label:'Novo material',qty:1,unit:'un',scope:'flash'});closeM();flashKitEditor()}}
function flashKitRow(x,i){return `<div class="card"><label>Material</label><input id="fkl${i}" value="${esc(x.label)}"><div class="grid"><div><label>Quantidade</label><input id="fkq${i}" type="number" step=".01" value="${x.qty}"></div><div><label>Unidade</label><select id="fku${i}">${unitOptions(x.unit||'un')}</select></div></div><label>Consumo</label><select id="fks${i}"><option value="flash" ${x.scope!=='event'?'selected':''}>Por flash</option><option value="event" ${x.scope==='event'?'selected':''}>Por evento</option></select><button class="btn light full" type="button" onclick="removeFlashKitItem(${i})">Remover</button></div>`}
function saveFlashKit(){let kit=flashKitConfig();kit.forEach((x,i)=>{x.label=$(`#fkl${i}`).value.trim()||x.label;x.qty=Math.max(0,+$(`#fkq${i}`).value||0);x.unit=$(`#fku${i}`).value;x.scope=$(`#fks${i}`).value});save();closeM();render()}
function removeFlashKitItem(i){flashKitConfig().splice(i,1);save();closeM();flashKitEditor()}
// Substitui a tela antiga do kit mantendo um atalho para a configuração editável.
const _kitViewFlashBase=typeof kitView==='function'?kitView:null;
if(_kitViewFlashBase){kitView=function(){return flashKitEditor()}}
