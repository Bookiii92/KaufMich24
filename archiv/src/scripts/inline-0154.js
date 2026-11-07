
(function(){
 if(window.km24PdfDirectV7)return;window.km24PdfDirectV7=true;
 const H2C='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
 const JSPDF='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
 const load=(src,ready)=>new Promise((res,rej)=>{if(ready())return res();let s=[...document.scripts].find(x=>x.src===src);if(s){s.addEventListener('load',()=>res(),{once:true});s.addEventListener('error',rej,{once:true});return}let n=document.createElement('script');n.src=src;n.async=true;n.onload=()=>res();n.onerror=rej;document.head.appendChild(n)});
 const timeout=(p,ms,msg)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error(msg||'Zeitüberschreitung')),ms))]);
 const waitImages=root=>Promise.all([...root.querySelectorAll('img')].map(im=>im.complete&&im.naturalWidth?Promise.resolve():new Promise(r=>{im.onload=im.onerror=()=>r()})));
 const waitImage=(im,ms=1200)=>Promise.race([new Promise(r=>{if(im&&im.complete&&im.naturalWidth)return r();if(!im)return r();im.onload=im.onerror=()=>r()}),new Promise(r=>setTimeout(r,ms))]);
 async function rasterizeLogo(src,clone){
  try{const original=src.querySelector('.km24SalesBrand img'),target=clone.querySelector('.km24SalesBrand img');if(!original||!target)return;await waitImage(original,800);if(!original.naturalWidth)return;const c=document.createElement('canvas');c.width=160;c.height=160;const ctx=c.getContext('2d');ctx.clearRect(0,0,160,160);ctx.drawImage(original,0,0,160,160);target.src=c.toDataURL('image/png');target.removeAttribute('crossorigin')}catch(e){console.warn('KM24 logo raster fallback',e)}
 }
 function coverCanvasFromImage(img,cssW,cssH,ratio=2){
  if(!img||!img.naturalWidth||!img.naturalHeight)return null;
  const tw=Math.max(1,Math.round(cssW*ratio)),th=Math.max(1,Math.round(cssH*ratio));
  const c=document.createElement('canvas');c.width=tw;c.height=th;c.style.width='100%';c.style.height='100%';c.style.display='block';
  const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  const iw=img.naturalWidth,ih=img.naturalHeight,scale=Math.max(tw/iw,th/ih),dw=iw*scale,dh=ih*scale,dx=(tw-dw)/2,dy=(th-dh)/2;
  ctx.clearRect(0,0,tw,th);ctx.drawImage(img,dx,dy,dw,dh);return c;
 }
 async function rasterizeListingImages(src,clone){
  const jobs=[];
  const heroSrc=src.querySelector('.km24SalesHero img'),heroWrap=clone.querySelector('.km24SalesHero');
  if(heroSrc&&heroWrap)jobs.push((async()=>{await waitImage(heroSrc);const heroH=src.classList.contains('km24JobSheet')?488:330;const c=coverCanvasFromImage(heroSrc,718,heroH,2);if(c){const old=heroWrap.querySelector('img');if(old)old.replaceWith(c)}})());
  const srcThumbs=[...src.querySelectorAll('.km24SalesThumb img')],cloneThumbs=[...clone.querySelectorAll('.km24SalesThumb')];
  srcThumbs.forEach((im,i)=>{const wrap=cloneThumbs[i];if(!wrap)return;jobs.push((async()=>{await waitImage(im);const c=coverCanvasFromImage(im,350,142,2);if(c){const old=wrap.querySelector('img');if(old)old.replaceWith(c)}})())});
  await Promise.all(jobs);
 }
 function forceExportStyles(root){
  root.style.setProperty('position','relative','important');root.style.setProperty('left','0','important');root.style.setProperty('top','0','important');root.style.setProperty('transform','none','important');root.style.setProperty('transform-origin','top left','important');root.style.setProperty('width','794px','important');root.style.setProperty('height','1123px','important');root.style.setProperty('margin','0','important');root.style.setProperty('opacity','1','important');root.style.setProperty('visibility','visible','important');root.style.setProperty('background','radial-gradient(circle at 80% 8%,#0b63b9 0,#063b76 24%,#021d45 58%,#011630 100%)','important');
  root.querySelectorAll('.km24SalesHero,.km24SalesThumb').forEach(el=>{el.style.setProperty('overflow','hidden','important');el.style.setProperty('position','relative','important')});
  root.querySelectorAll('.km24SalesHero img,.km24SalesThumb img').forEach(el=>{el.style.setProperty('width','100%','important');el.style.setProperty('height','100%','important');el.style.setProperty('object-fit','cover','important');el.style.setProperty('object-position','center center','important');el.style.setProperty('display','block','important')});
  root.querySelectorAll('.km24SalesSpec').forEach(el=>{el.style.setProperty('background','#fff','important');el.style.setProperty('color','#071b33','important');el.style.setProperty('opacity','1','important')});
  root.querySelectorAll('.km24SalesSpec strong').forEach(el=>{el.style.setProperty('color','#071b33','important');el.style.setProperty('-webkit-text-fill-color','#071b33','important');el.style.setProperty('opacity','1','important');el.style.setProperty('font-weight','900','important');el.style.setProperty('text-shadow','none','important')});
  root.querySelectorAll('.km24SalesSpec span').forEach(el=>{el.style.setProperty('color','#52657b','important');el.style.setProperty('-webkit-text-fill-color','#52657b','important');el.style.setProperty('opacity','1','important');el.style.setProperty('font-weight','600','important');el.style.setProperty('text-shadow','none','important')});
 }
 function roundedRect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
 function fitFont(ctx,text,maxWidth,start,min,weight){let size=start;while(size>min){ctx.font=weight+' '+size+'px Arial,Helvetica,sans-serif';if(ctx.measureText(text).width<=maxWidth)break;size-=1}return size}
 function repaintSpecs(canvas,root){
  const ctx=canvas.getContext('2d'),rr=root.getBoundingClientRect(),sx=canvas.width/794,sy=canvas.height/1123;
  root.querySelectorAll('.km24SalesSpec').forEach(el=>{const r=el.getBoundingClientRect(),x=(r.left-rr.left)*sx,y=(r.top-rr.top)*sy,w=r.width*sx,h=r.height*sy,pad=12*sx,rad=16*sx;ctx.save();roundedRect(ctx,x,y,w,h,rad);ctx.fillStyle='#ffffff';ctx.fill();ctx.textBaseline='top';const strong=el.querySelector('strong'),span=el.querySelector('span'),v=(strong?.textContent||'').trim(),l=(span?.textContent||'').trim();let vs=fitFont(ctx,v,w-pad*2,18*sx,12*sx,'900');ctx.font='900 '+vs+'px Arial,Helvetica,sans-serif';ctx.fillStyle='#071b33';ctx.fillText(v,x+pad,y+8*sy,w-pad*2);ctx.font='600 '+(13*sx)+'px Arial,Helvetica,sans-serif';ctx.fillStyle='#52657b';ctx.fillText(l,x+pad,y+37*sy,w-pad*2);ctx.restore()})
 }
 function exportTitle(src){return (src.querySelector('.km24SalesTitle')?.textContent||'KaufMich24').trim().replace(/[^a-z0-9äöüéèàçß_-]+/gi,'_').slice(0,60)}
 async function renderSalesCanvas(){
  const src=document.getElementById('km24SalesSheetNode');if(!src)throw new Error('Verkaufsblatt nicht gefunden');
  await timeout(load(H2C,()=>!!window.html2canvas),10000,'Bild-Export konnte nicht geladen werden');
  await Promise.race([waitImages(src),new Promise(r=>setTimeout(r,1200))]);
  const clone=src.cloneNode(true);clone.removeAttribute('id');forceExportStyles(clone);
  await rasterizeListingImages(src,clone);
  const origQr=src.querySelector('.km24SalesQr canvas'),cloneQr=clone.querySelector('.km24SalesQr');if(origQr&&cloneQr){try{const qi=new Image();qi.src=origQr.toDataURL('image/png');qi.style.width='78px';qi.style.height='78px';cloneQr.innerHTML='';cloneQr.appendChild(qi)}catch(_){}}
  await rasterizeLogo(src,clone);
  const host=document.createElement('div');host.setAttribute('aria-hidden','true');host.style.cssText='position:fixed;left:-10000px;top:0;width:794px;height:1123px;overflow:hidden;background:#011630;pointer-events:none;z-index:-2147483647;';host.appendChild(clone);document.body.appendChild(host);
  try{
   await Promise.race([waitImages(clone),new Promise(r=>setTimeout(r,1200))]);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const canvas=await timeout(window.html2canvas(clone,{scale:1.75,useCORS:true,allowTaint:false,backgroundColor:'#011630',logging:false,width:794,height:1123,windowWidth:794,windowHeight:1123,scrollX:0,scrollY:0}),15000,'Verkaufsbild konnte nicht erstellt werden');
   if(!canvas||canvas.width<100||canvas.height<100)throw new Error('Verkaufsbild ist leer');
   repaintSpecs(canvas,clone);return {canvas,src};
  }finally{host.remove()}
 }
 async function savePdf(){
  const rendered=await renderSalesCanvas();await timeout(load(JSPDF,()=>!!window.jspdf?.jsPDF),10000,'PDF-Bibliothek konnte nicht geladen werden');
  const data=rendered.canvas.toDataURL('image/jpeg',0.96);if(!data||data.length<5000)throw new Error('PDF-Bild ist leer');
  const {jsPDF}=window.jspdf,pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});pdf.setFillColor(255,255,255);pdf.rect(0,0,210,297,'F');pdf.addImage(data,'JPEG',2.5,3.5,205,290,undefined,'FAST');pdf.save('KaufMich24_'+exportTitle(rendered.src)+'.pdf');
 }
 async function saveJpg(){
  const rendered=await renderSalesCanvas();const blob=await new Promise((res,rej)=>rendered.canvas.toBlob(b=>b?res(b):rej(new Error('JPG konnte nicht erstellt werden')),'image/jpeg',0.96));
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='KaufMich24_'+exportTitle(rendered.src)+'.jpg';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 }
 document.addEventListener('click',async function(e){
  const pdf=e.target?.closest?.('[data-sales-pdf]'),jpg=e.target?.closest?.('[data-sales-jpg]'),btn=pdf||jpg;if(!btn)return;
  e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();if(btn.dataset.km24ExportBusy==='1')return;btn.dataset.km24ExportBusy='1';const old=btn.textContent;btn.textContent=pdf?'PDF wird erstellt…':'JPG wird erstellt…';btn.classList.add('km24SalesBusy');
  try{if(pdf)await savePdf();else await saveJpg()}catch(err){console.error('KM24 export v7 failed',err);alert((pdf?'PDF':'JPG')+' konnte nicht erstellt werden: '+(err?.message||'Unbekannter Fehler'))}finally{btn.textContent=old;btn.classList.remove('km24SalesBusy');delete btn.dataset.km24ExportBusy}
 },true);
})();
