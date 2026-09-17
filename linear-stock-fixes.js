// Materiais lineares: cadastro/estoque em metros; consumo operacional em centímetros.
purchaseRules['Fita crepe'].unit='m';
purchaseRules['Bandagem'].unit='m';
function normalizeLinearStockUnits(){
  let changed=false;
  db.stock.forEach(s=>{let t=typeof stockTypeOf==='function'?stockTypeOf(s):(s.type||s.cat||'');if(['Vitalderm','Plástico filme','Fita crepe','Bandagem'].includes(t)&&s.unit!=='m'){s.unit='m';changed=true}});
  return changed;
}
const _stockLinearBase=stock;
stock=function(){if(normalizeLinearStockUnits())save();return _stockLinearBase()};
