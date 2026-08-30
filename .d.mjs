import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:900},deviceScaleFactor:2});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:3145/para-abogados',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(1500);
console.log('errores:', errs.length?errs:'ninguno');
// que el nav siga apuntando a anclas existentes
for (const a of ['#capacidades','#fuentes','#leads','#planes','#jus-ia']) {
  console.log(`  ${a}: ${await p.locator(a).count() ? 'ok' : 'FALTA'}`);
}
// capturas de cada demo
for (const [sel,name] of [['#jus-ia','jusia'],['#leads','leads']]) {
  const bx = await p.locator(sel).boundingBox();
  await p.screenshot({path:`/tmp/demo-${name}.png`, clip:{x:bx.x,y:bx.y+10,width:bx.width,height:Math.min(bx.height,470)}});
}
const over = await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
console.log('desborde horizontal:', over);
await p.screenshot({path:'/tmp/pa-completa.png', fullPage:true});
await b.close();
