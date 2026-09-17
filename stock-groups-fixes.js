// Organização visual do inventário por função no processo da tattoo.
const STOCK_GROUPS=[
 {key:'tattoo',label:'🖊 Tattoo',types:['Cartucho','Tinta','Batoque']},
 {key:'prep',label:'🧴 Preparo & aplicação',types:['Sabonete','Transfer','Vaselina','Gilete']},
 {key:'hygiene',label:'🧤 Proteção & higiene',types:['Luvas','Máscara','Plástico filme','Fita crepe','Bandagem']},
 {key:'paper',label:'📄 Papéis & impressão',types:['Papel']},
 {key:'after',label:'🩹 Pós-tattoo',types:['Vitalderm','Cartão pós tattoo','Potinho','Pomada']},
 {key:'support',label:'🥄 Descartáveis & apoio',types:['Palito']},
 {key:'other',label:'📦 Outros',types:['Outro']}
];
function stockGroupOf(s){let t=typeof stockTypeOf==='function'?stockTypeOf(s):(s.type||s.customType||s.cat||'Outro');let g=STOCK_GROUPS.find(x=>x.key!=='other'&&x.types.includes(t));return g||STOCK_GROUPS.find(x=>x.key==='other')}
function stockGroupItems(key){return db.stock.filter(s=>(+s.qty||0)>0&&stockGroupOf(s).key===key)}
function stockGroupCard(g){let items=stockGroupItems(g.key);if(!items.length)return'';return`<button class="card row" style="width:100%;text-align:left" onclick="stockGroupView('${g.key}')"><div><b>${g.label}</b><div class="tiny">${items.length} ${items.length===1?'item':'itens'}</div></div><b>›</b></button>`}
function stockCompactRow(s){return`<div class="card" onclick="stockSheet(${s.id})"><div class="row"><div style="min-width:0"><b>${esc(s.name)}</b><div class="tiny">${esc(stockTypeOf(s))} · ${money(s.cost)}/${esc(s.unit||'un')}</div></div><b class="${(+s.min||0)>0&&(+s.qty||0)<=+s.min?'red':''}">${fmt(s.qty)} ${esc(s.unit||'un')}</b></div></div>`}
function stockGroupView(key){let g=STOCK_GROUPS.find(x=>x.key===key),items=stockGroupItems(key);form(g?.label||'Estoque',items.map(stockCompactRow).join('')||empty('Nenhum item nesta categoria.'),closeM,'Fechar')}
function stock(){let low=db.stock.filter(x=>(+x.qty||0)>0&&(+x.min||0)>0&&(+x.qty||0)<=+x.min);return`<div class="brand">Estoque</div><button class="btn full" onclick="stockEntry()">+ Adicionar compra / material</button><div class="grid stock-actions"><button class="btn light" onclick="stockManager()">Editar estoque</button><button class="btn light" onclick="kitsView()">Kit Flash Evento</button><button class="btn light" onclick="purchasesView()">Itens comprados</button><button class="btn light" onclick="shoppingView()">Lista de compras (${shopping().length})</button></div>${low.length?`<h2>⚠️ Estoque baixo</h2>${low.map(stockCompactRow).join('')}`:''}<h2>Inventário</h2>${STOCK_GROUPS.map(stockGroupCard).join('')||'<div class="card sub">Nenhum item em estoque.</div>'}`}
