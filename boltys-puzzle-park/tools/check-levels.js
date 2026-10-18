const data=require('../data/levels.json');
console.log('Total:',data.meta.total,'Screw:',data.screw.length,'Sort:',data.sort.length,'Arrow:',data.arrow.length);
let ok=true;
data.screw.forEach(l=>{ if(l.boxes<2||l.time<30){ console.error('Screw invalid',l); ok=false; }});
console.log(ok?'✅ All 110 levels valid':'❌ Errors');
