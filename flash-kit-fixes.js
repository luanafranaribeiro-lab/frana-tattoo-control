// Kit Flash Evento: configuração compacta do botão dentro de Estoque.
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
function ensureFlashKit(){let k=db.kits[0];if(!k){k={id:uid(),name:'Kit Flash Evento',materials:[]};db.kits.push(k)}if(!Array.isArray(k.defaults)||!k.defaults.length)k.defaults=FLASH_KIT_DEFAULTS.map(x=>({...x}));return k}
function flashDefaultRows(k){return k.defaults.map((x,i)=>`<div class="item row" style="gap:8px"><input id="fkl${i}" value="${esc(x.label)}" aria-label="Material" style="margin:3px 0;min-width:0;flex:1"><div class="row" style="gap:4px;flex:0 0 auto"><input id="fkq${i}" type="number" step=".001" min="0" value="${x.qty}" aria-label="Quantidade" style="width:72px;margin:3px 0"><span class="tiny" style="min-width:28px">${esc(x.unit||'un')}</span><button class="btn light" type="button" onclick="removeFlashDefault(${i})" style="padding:7px 9px;min-width:auto">✕</button></div></div>`).join('')}
function kitsView(){let k=ensureFlashKit();form('Kit Flash Evento',`<div class="tiny">Material e quantidade por flash. Máscara = 1 por evento.</div><div id="flashDefaults">${flashDefaultRows(k)}</div><button class="btn light full" id="flashDefaultAdd">+ Adicionar material</button><div class="item row"><span>Detalhe branco</span><b>1 batoque P + tinta branca + 1 copinho com água</b></div><div class="tiny">Mesmo cartucho; não acrescenta outro.</div>`,()=>{k.defaults.forEach((x,i)=>{x.label=$(`#fkl${i}`).value.trim()||x.label;x.qty=Math.max(0,+$(`#fkq${i}`).value||0)});save();closeM();render()},'Salvar kit');$('#flashDefaultAdd').onclick=()=>{k.defaults.push({key:'custom_'+uid(),label:'Novo material',qty:1,unit:'un',scope:'flash'});save();kitsView()}}
function removeFlashDefault(i){let k=ensureFlashKit();k.defaults.splice(i,1);save();kitsView()}
