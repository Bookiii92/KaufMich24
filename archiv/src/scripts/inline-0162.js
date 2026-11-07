
(function(){
"use strict";
if(window.km24PriceStudioV2)return;
window.km24PriceStudioV2=true;
var PDF_SRC="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
var QR_SRC="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
var id=0;
function one(root,css){return root.querySelector(css)}
function all(root,css){return Array.prototype.slice.call(root.querySelectorAll(css))}
function label(root,css){var e=one(root,css);return e?String(e.textContent||"").trim():""}
function val(root,css){var e=one(root,css);return e?e.value:""}
function checked(root,css){var e=one(root,css);return !!(e&&e.checked)}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function round(ctx,x,y,w,h,r,fill,stroke){
 r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}
}
function textFit(ctx,str,x,y,maxW,sz,min,color,weight){
 str=String(str||"");sz=Math.max(min,sz);ctx.fillStyle=color;weight=weight||"700";
 while(sz>min){ctx.font=weight+" "+sz+"px Arial, Helvetica, sans-serif";if(ctx.measureText(str).width<=maxW)break;sz-=1}
 ctx.font=weight+" "+sz+"px Arial, Helvetica, sans-serif";
 if(ctx.measureText(str).width>maxW){while(str.length>2&&ctx.measureText(str+"…").width>maxW)str=str.slice(0,-1);str+="…"}
 ctx.fillText(str,x,y);return sz
}
function multiline(ctx,str,x,y,w,sz,lineHeight,num,color){
 ctx.fillStyle=color;ctx.font="800 "+sz+"px Arial, Helvetica, sans-serif";
 var words=String(str||"").replace(/\s+/g," ").trim().split(" "),lines=[],run="";
 words.forEach(function(word){
  var next=run?run+" "+word:word;
  if(ctx.measureText(next).width>w&&run){lines.push(run);run=word}else{run=next}
 });
 if(run)lines.push(run);
 if(lines.length>num){lines=lines.slice(0,num);var j=num-1;while(lines[j].length>2&&ctx.measureText(lines[j]+"…").width>w)lines[j]=lines[j].slice(0,-1);lines[j]+="…"}
 lines.forEach(function(t,i){textFit(ctx,t,x,y+i*lineHeight,w,sz,sz-3,color,"800")})
}
function imageFrom(src){
 return new Promise(function(resolve){
  if(!src){resolve(null);return}
  var im=new Image(),done=false,t=setTimeout(function(){if(done)return;done=true;resolve(null)},8500);
  im.crossOrigin="anonymous";
  im.onload=function(){if(done)return;done=true;clearTimeout(t);resolve(im)};
  im.onerror=function(){if(done)return;done=true;clearTimeout(t);resolve(null)};
  im.src=src;
 })
}
function photo(ctx,im,x,y,w,h,r){
 round(ctx,x,y,w,h,r,"#dce9f3");
 if(!im||!im.naturalWidth){ctx.fillStyle="#63819a";ctx.textAlign="center";ctx.font="700 20px Arial";ctx.fillText("KaufMich24 Inserat",x+w/2,y+h/2);ctx.textAlign="left";return}
 var sw=im.naturalWidth,sh=im.naturalHeight,scale=Math.max(w/sw,h/sh),cutW=w/scale,cutH=h/scale;
 ctx.save();ctx.beginPath();round(ctx,x,y,w,h,r);ctx.clip();ctx.drawImage(im,(sw-cutW)/2,(sh-cutH)/2,cutW,cutH,x,y,w,h);ctx.restore();
}
function source(modal){
 var s=one(modal,"#km24SalesSheetNode"),img=one(s||modal,".km24SalesHero img"),logo=one(s||modal,".km24SalesBrand img");
 return {title:label(s||modal,".km24SalesTitle")||"Inserat",price:label(s||modal,".km24SalesPrice")||"Preis auf Anfrage",
  photo:img?img.getAttribute("src")||"":"",logo:logo?logo.getAttribute("src")||"":"/icon.svg?v=blue-20261027",
  loc:label(s||modal,".km24SalesLoc").replace(/^\s*[●•]\s*/,""),url:label(s||modal,".km24SalesUrl")||"https://www.kaufmich24.ch",
  sold:label(s||modal,".km24SalesStatus").indexOf("VERKAUFT")>=0,
  specs:all(s||modal,".km24SalesSpec").map(function(n){return {name:label(n,"span"),value:label(n,"strong")}}).filter(function(n){return n.value&&n.name}).slice(0,3)};
}
function opt(panel,base){
 return {format:val(panel,"[data-ps-size]")||"A5",orient:val(panel,"[data-ps-orientation]")||"portrait",
  theme:val(panel,"[data-ps-theme]")||"classic",price:val(panel,"[data-ps-price]").trim()||base.price,
  badge:val(panel,"[data-ps-sticker]"),seller:checked(panel,"[data-ps-seller]"),
  company:val(panel,"[data-ps-company]").trim(),phone:val(panel,"[data-ps-phone]").trim()};
}
function sizeOf(o){
 if(o.format==="A4")return o.orient==="portrait"?{w:2480,h:3508,mw:210,mh:297}:{w:3508,h:2480,mw:297,mh:210};
 return o.orient==="portrait"?{w:1748,h:2480,mw:148,mh:210}:{w:2480,h:1748,mw:210,mh:148};
}
function header(ctx,w,base,o,brand,h){
 var classic=o.theme==="classic";
 if(classic){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,w,h);ctx.fillStyle="#0b4779";ctx.fillRect(0,h-5,w,5)}
 else{var g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#071c36");g.addColorStop(.7,"#123d6c");g.addColorStop(1,"#0a8ca9");ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
 round(ctx,30,19,72,72,14,"#ffffff","#cbdceb");
 if(brand&&brand.naturalWidth){try{ctx.drawImage(brand,35,24,62,62)}catch(e){}}
 textFit(ctx,"KaufMich",119,64,266,37,22,classic?"#123b64":"#ffffff","900");
 textFit(ctx,"24",313,64,75,37,23,classic?"#078bab":"#55e0f6","900");
 textFit(ctx,"DER SCHWEIZER MARKTPLATZ",120,90,360,15,10,classic?"#496b85":"#c7e8f9","700");
 round(ctx,w-210,34,178,46,22,classic?"#0e497a":"#16a8ca");
 textFit(ctx,"PREISSCHILD",w-192,65,150,19,14,"#ffffff","800");
}
function sticker(ctx,o,x,y){
 if(!o.badge)return;
 var w=226;round(ctx,x,y,w,45,22,o.theme==="classic"?"#eaf6ff":"#ffe29b");
 textFit(ctx,o.badge.toUpperCase(),x+17,y+30,w-34,19,12,o.theme==="classic"?"#0d527c":"#402f06","900");
}
function specs(ctx,base,x,y,w,h){
 var items=base.specs;if(!items.length)return;
 var gap=10,each=(w-gap*(items.length-1))/items.length;
 items.forEach(function(f,i){
  var sx=x+i*(each+gap);round(ctx,sx,y,each,h,12,"#ffffff","#d4e4f0");
  textFit(ctx,f.value,sx+12,y+33,each-24,23,12,"#0c2e51","900");
  textFit(ctx,f.name,sx+12,y+h-14,each-24,15,10,"#557089","700");
 });
}
function drawQR(ctx,qr,x,y,w){
 round(ctx,x-8,y-8,w+16,w+16,11,"#ffffff","#d7e6ef");
 if(qr&&((qr.width||qr.naturalWidth)>0)){
  try{ctx.drawImage(qr,x,y,w,w)}catch(e){}
 }else{
  ctx.fillStyle="#63839c";ctx.textAlign="center";ctx.font="700 12px Arial";ctx.fillText("QR-Code",x+w/2,y+w/2);ctx.textAlign="left";
 }
}
function branding(ctx,logo,x,y){
 if(logo&&logo.naturalWidth){round(ctx,x,y,69,69,9,"#ffffff");try{ctx.drawImage(logo,x+4,y+4,61,61)}catch(e){}}
}
function seller(ctx,o,companyLogo,x,y,w){
 if(!o.seller||(!o.company&&!o.phone&&!companyLogo))return;
 var start=x;
 if(companyLogo&&companyLogo.naturalWidth){branding(ctx,companyLogo,x,y-45);start+=78}
 if(o.company)textFit(ctx,o.company,start,y-19,w-(start-x),20,12,"#0b3256","800");
 if(o.phone)textFit(ctx,o.phone,start,y+9,w-(start-x),17,11,"#44647c","700");
}
function portrait(ctx,base,o,im,brand,qr,companyLogo){
 var w=700,h=990,classic=o.theme==="classic";ctx.fillStyle=classic?"#f8fbfd":"#edf5fc";ctx.fillRect(0,0,w,h);header(ctx,w,base,o,brand,130);
 photo(ctx,im,28,148,644,343,14);
 sticker(ctx,o,43,166);
 multiline(ctx,base.title,36,545,626,38,49,2,"#0a2c4e");
 round(ctx,30,637,640,119,16,classic?"#0a4b7d":"#082c50");
 textFit(ctx,base.sold?"VERKAUFT":"ANGEBOTSPREIS",50,670,600,18,13,"#bee9fb","800");
 textFit(ctx,o.price,49,731,601,53,24,"#ffffff","900");
 specs(ctx,base,30,774,640,78);
 ctx.fillStyle=classic?"#e9f3fb":"#dcecf8";ctx.fillRect(0,869,700,121);
 if(o.seller&&(o.company||o.phone||companyLogo)){
  seller(ctx,o,companyLogo,31,931,470);
  textFit(ctx,"kaufmich24.ch",31,979,435,16,11,"#087899","800");
 }else{
  textFit(ctx,"JETZT ONLINE ANSEHEN",31,921,482,20,13,"#0a385c","900");
  textFit(ctx,base.loc||"Schweiz",31,947,484,18,12,"#486c89","700");
  textFit(ctx,"kaufmich24.ch",31,973,480,16,11,"#087899","800");
 }
 drawQR(ctx,qr,557,873,102);
}
function landscape(ctx,base,o,im,brand,qr,companyLogo){
 var w=990,h=700,classic=o.theme==="classic";ctx.fillStyle=classic?"#f8fbfd":"#edf5fc";ctx.fillRect(0,0,w,h);header(ctx,w,base,o,brand,112);
 photo(ctx,im,26,129,535,369,15);
 sticker(ctx,o,43,147);
 multiline(ctx,base.title,588,174,374,34,44,3,"#0b2e51");
 round(ctx,585,342,376,116,17,classic?"#0a4b7d":"#082c50");
 textFit(ctx,base.sold?"VERKAUFT":"ANGEBOTSPREIS",607,375,333,17,12,"#bfeaf9","800");
 textFit(ctx,o.price,606,432,335,39,19,"#ffffff","900");
 textFit(ctx,base.loc||"Schweiz",588,490,374,17,11,"#496b83","700");
 specs(ctx,base,27,515,736,91);
 ctx.fillStyle=classic?"#e9f3fb":"#dcecf8";ctx.fillRect(0,623,990,77);
 if(o.seller&&(o.company||o.phone||companyLogo))seller(ctx,o,companyLogo,27,673,750);
 else{
  textFit(ctx,"JETZT AUF KAUFMICH24.CH ANSEHEN",28,654,730,19,12,"#0b4268","800");
  textFit(ctx,"Scannen, ansehen & direkt kontaktieren",28,684,730,16,11,"#476981","700");
 }
 drawQR(ctx,qr,846,526,113);
}
function loadScript(src,check){
 if(check())return Promise.resolve();
 return new Promise(function(resolve,reject){
  var scripts=all(document,"script"),found=scripts.find(function(s){return s.src===src}),s=found||document.createElement("script"),complete=false;
  function finish(error){if(complete)return;complete=true;clearTimeout(timer);if(error)reject(error);else if(check())resolve();else reject(new Error("Bibliothek nicht verfügbar"))}
  var timer=setTimeout(function(){finish(new Error("Ladezeit überschritten"))},12000);
  s.addEventListener("load",function(){finish()},{once:true});s.addEventListener("error",function(){finish(new Error("Download-Bibliothek konnte nicht geladen werden"))},{once:true});
  if(!found){s.src=src;s.async=true;document.head.appendChild(s)}
 });
}
function qrCanvas(modal,base){
 var old=one(modal,"#km24SalesQr canvas")||one(modal,"#km24SalesQr img");
 if(typeof window.QRCode==="function"){
  try{
   var holder=document.createElement("div");new window.QRCode(holder,{text:base.url,width:288,height:288,colorDark:"#103b5b",colorLight:"#ffffff"});
   return one(holder,"canvas")||one(holder,"img");
  }catch(e){console.warn("KaufMich24 Preisstudio QR",e)}
 }
 return old&&(old.width||old.naturalWidth)?old:null;
}
function waitQR(modal,base){
 return new Promise(function(resolve){
  var attempts=0;function tick(){
   var qr=qrCanvas(modal,base);if(qr&&(qr.width||qr.naturalWidth)){resolve(qr);return}
   if(++attempts>=15){resolve(null);return}setTimeout(tick,250)
  }tick()
 });
}
function buildCanvas(base,o,assets,qr,quality){
 var dims=sizeOf(o),w=o.orient==="portrait"?700:990,h=o.orient==="portrait"?990:700;
 var c=document.createElement("canvas");c.width=quality?dims.w:w;c.height=quality?dims.h:h;
 var ctx=c.getContext("2d",{alpha:false});if(!ctx)throw new Error("Canvas auf diesem Gerät nicht verfügbar");
 ctx.scale(c.width/w,c.height/h);ctx.textBaseline="alphabetic";
 if(o.orient==="portrait")portrait(ctx,base,o,assets.photo,assets.brand,qr,assets.seller);
 else landscape(ctx,base,o,assets.photo,assets.brand,qr,assets.seller);
 return c;
}
function downloadBlob(blob,name){
 if(!blob)throw new Error("Datei wurde nicht erstellt");
 var a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},30000);
}
function jpegBlob(canvas){
 return new Promise(function(resolve,reject){
  try{canvas.toBlob(function(b){b?resolve(b):reject(new Error("JPG konnte nicht erstellt werden"))},"image/jpeg",.95)}
  catch(e){reject(e)}
 });
}
function safeName(str){return String(str||"Inserat").replace(/[^a-z0-9äöüéèàçß_-]+/gi,"_").slice(0,35)||"Inserat"}
function printCanvas(canvas,dims){
 var image=canvas.toDataURL("image/jpeg",.96);
 var frame=document.createElement("iframe");frame.setAttribute("title","KaufMich24 Preisschild drucken");
 frame.style.cssText="position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;right:0;border:0";
 var page=dims.mw+"mm "+dims.mh+"mm";
 frame.srcdoc='<!doctype html><html><head><meta charset="utf-8"><title>KaufMich24 Preisschild</title><style>@page{size:'+page+';margin:0}html,body{margin:0;padding:0;width:'+dims.mw+'mm;height:'+dims.mh+'mm;overflow:hidden}img{display:block;width:100%;height:100%;object-fit:fill;print-color-adjust:exact;-webkit-print-color-adjust:exact}</style><style id="km24-cross-browser-prepaint-v2">
/* KaufMich24 canonical theme palette: same colours in Chrome, Samsung Internet, Safari and installed web app. */
html[data-km24-theme="light"],html[data-km24-theme="light"] body,html[data-km24-theme="light"] #app,
html.km24SamsungSafe[data-km24-theme="light"],html.km24SamsungSafe[data-km24-theme="light"] body,html.km24SamsungSafe[data-km24-theme="light"] #app{
 --bg:#fff!important;--card:#fff!important;--text:#142033!important;--muted:#53657a!important;
 --km-bg:#fff!important;--km-surface:#fff!important;--km-surface2:#f7f9fd!important;
 --km-text:#142033!important;--km-muted:#53657a!important;--km-line:#dce4f0!important;
 --km-accent:#0b63f6!important;--g:#0b63f6!important;color-scheme:only light!important}
html[data-km24-theme="dark"],html[data-km24-theme="dark"] body,html[data-km24-theme="dark"] #app{
 --bg:#080e18!important;--card:#101925!important;--text:#f3f7ff!important;--muted:#aabbd0!important;
 --km-bg:#080e18!important;--km-surface:#101925!important;--km-surface2:#152131!important;
 --km-text:#f3f7ff!important;--km-muted:#aabbd0!important;--km-line:#30445c!important;
 --km-accent:#1877ff!important;--g:#1877ff!important;color-scheme:dark!important}
html[data-km24-theme="light"] body,html[data-km24-theme="light"] body #app,html[data-km24-theme="light"] body main{background-color:#fff!important;color:#142033!important}
html[data-km24-theme="dark"] body,html[data-km24-theme="dark"] body #app,html[data-km24-theme="dark"] body main{background-color:#080e18!important;color:#f3f7ff!important}
html[data-km24-theme="light"] body header{background:#fff!important;color:#142033!important;border-bottom-color:#dce4f0!important}
html[data-km24-theme="dark"] body header{background:#101925!important;color:#f3f7ff!important;border-bottom-color:#30445c!important}
/* A navy promotional hero with explicitly visible text on both themes, including Android Chrome. */
html[data-km24-theme] body #app .hero.km24WowHero{background:linear-gradient(128deg,#081b43,#081733 53%,#082c4c)!important;border-bottom-color:#244872!important}
html[data-km24-theme] body #app .hero.km24WowHero h1{color:#fff!important;-webkit-text-fill-color:#fff!important;background:none!important;opacity:1!important;visibility:visible!important;text-shadow:none!important}
html[data-km24-theme] body #app .hero.km24WowHero h1>span{color:#75c9ff!important;-webkit-text-fill-color:#75c9ff!important;background:none!important;background-image:none!important;-webkit-background-clip:border-box!important;background-clip:border-box!important;opacity:1!important;visibility:visible!important;text-shadow:none!important}
html[data-km24-theme] body #app .hero.km24WowHero h1>.km24HeroFirstLine{color:#fff!important;-webkit-text-fill-color:#fff!important}
html[data-km24-theme] body #app .hero.km24WowHero .km24HeroText,html[data-km24-theme] body #app .hero.km24WowHero p.season-note{color:#e2edff!important;-webkit-text-fill-color:#e2edff!important;opacity:1!important;visibility:visible!important}
html[data-km24-theme="light"] body #app .hero.km24WowHero .km24HeroEyebrow{background:#e6f0ff!important;border-color:#c7daf5!important;color:#164779!important;-webkit-text-fill-color:#164779!important}
html[data-km24-theme="dark"] body #app .hero.km24WowHero .km24HeroEyebrow{background:#183455!important;border-color:#345d85!important;color:#eef6ff!important;-webkit-text-fill-color:#eef6ff!important}
/* Search field and placeholder use one contrast-safe palette across browsers. */
html[data-km24-theme] body #app .hero.km24WowHero .search{background:#fff!important;border-color:#dce4f0!important}
html[data-km24-theme] body #app .hero.km24WowHero .search input{background:#fff!important;background-image:none!important;color:#182b43!important;-webkit-text-fill-color:#182b43!important;color-scheme:only light!important}
html[data-km24-theme] body #app .hero.km24WowHero .search input::placeholder{color:#53657a!important;-webkit-text-fill-color:#53657a!important;opacity:1!important}
html[data-km24-theme] body #app .hero.km24WowHero .search button,html[data-km24-theme] body #app .hero.km24WowHero .btn.primary,html[data-km24-theme] body #app .km24AreaSwitch button.active{background:#0b63f6!important;background-image:none!important;border-color:#0b63f6!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
html[data-km24-theme] body #app .km24AreaSwitch button.active *,html[data-km24-theme] body #app .hero.km24WowHero .btn.primary *{color:#fff!important;-webkit-text-fill-color:#fff!important}
html[data-km24-theme="light"] body .km24BottomNav{background:#fff!important;background-image:none!important;border-color:#e2e8f0!important}
html[data-km24-theme="dark"] body .km24BottomNav{background:#101925!important;background-image:none!important;border-color:#30445c!important}
html[data-km24-theme="light"] body .km24BottomNav>a:not(.active),html[data-km24-theme="light"] body .km24BottomNav>button:not(.active){color:#48566a!important;-webkit-text-fill-color:#48566a!important}
html[data-km24-theme="dark"] body .km24BottomNav>a:not(.active),html[data-km24-theme="dark"] body .km24BottomNav>button:not(.active){color:#c8d9ef!important;-webkit-text-fill-color:#c8d9ef!important}
html[data-km24-theme] body .km24BottomNav .active{color:#0b63f6!important;-webkit-text-fill-color:#0b63f6!important}
html[data-km24-theme] body .km24BottomSell{background:linear-gradient(145deg,#0b55e8,#0b77f7)!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
html[data-km24-theme="light"] body #app .card,html[data-km24-theme="light"] body #app .cat,html[data-km24-theme="light"] body #app .panel{background-color:#fff!important;color:#142033!important}
html[data-km24-theme="dark"] body #app .card,html[data-km24-theme="dark"] body #app .cat,html[data-km24-theme="dark"] body #app .panel{background-color:#101925!important;color:#f3f7ff!important}
</style>
<style id="km24-video-mobile-contrast-fix-20261107">

/* Exact mobile hero specificity fix for Chrome / Samsung Internet / Safari. */
html:not([data-km24-theme="dark"]) body #app .hero.km24WowHero h1>span:last-child,
html[data-km24-theme="dark"] body #app .hero.km24WowHero h1>span:last-child,
html[data-km24-theme] body.km24AutumnActualV3 #app .hero.km24WowHero h1>span:last-child{
 color:#75c9ff!important;-webkit-text-fill-color:#75c9ff!important;
 background:none!important;background-image:none!important;
 background-clip:border-box!important;-webkit-background-clip:border-box!important;
 opacity:1!important;visibility:visible!important;text-shadow:none!important;
}
html:not([data-km24-theme="dark"]) body #app .hero.km24WowHero h1>.km24HeroFirstLine,
html[data-km24-theme="dark"] body #app .hero.km24WowHero h1>.km24HeroFirstLine{
 color:#fff!important;-webkit-text-fill-color:#fff!important;
}
</style>
</head><body><img src="'+image+'" alt="Preisschild"></body></html>';
 var timer=setTimeout(function(){frame.remove()},120000);
 frame.onload=function(){
  setTimeout(function(){try{frame.contentWindow.focus();frame.contentWindow.print()}catch(e){console.error("Drucken",e)}},250)
 };
 document.body.appendChild(frame);
 if(!window.matchMedia||!window.matchMedia("print").matches){setTimeout(function(){clearTimeout(timer);frame.remove()},120000)}
}
function attach(modal){
 if(one(modal,".km24PriceStudio"))return;
 var actions=one(modal,".km24SalesActions");if(!actions)return;
 var base=source(modal),uid="km24ps"+(++id);
 var sec=document.createElement("section");sec.className="km24PriceStudio";
 sec.innerHTML='<div class="km24PSHead"><div><h3>🏷 Preisschild-Studio</h3><p>Persönlich gestalten, Vorschau ansehen und in Druckqualität exportieren.</p></div></div>'
 +'<div class="km24PSGrid"><div class="km24PSSettings">'
 +'<div class="km24PSPair"><label>Papiergrösse<select data-ps-size><option value="A5">A5 – kompaktes Preisschild</option><option value="A4">A4 – grosses Preisschild</option></select></label><label>Ausrichtung<select data-ps-orientation><option value="portrait">Hochformat</option><option value="landscape">Querformat</option></select></label></div>'
 +'<label>Design<select data-ps-theme><option value="classic">Klassisch – hell und schlicht</option><option value="autohaus">Autohaus – kräftige Preisgestaltung</option></select></label>'
 +'<label>Preis auf dem Schild <small>(ändert nicht den Inseratpreis)</small><input type="text" data-ps-price maxlength="55" placeholder="CHF 12’900.–"></label>'
 +'<label>Hinweis / Aufkleber<select data-ps-sticker><option value="">Kein Hinweis</option><option value="TOP ANGEBOT">TOP ANGEBOT</option><option value="NEU">NEU</option><option value="PREIS REDUZIERT">PREIS REDUZIERT</option><option value="FRISCH AB MFK">FRISCH AB MFK</option></select></label>'
 +'<div class="km24PSSeller"><label class="km24PSCheck"><input type="checkbox" data-ps-seller> Verkäuferdaten auf dem Schild anzeigen</label>'
 +'<div class="km24PSSellerFields"><label>Firma / Verkäufername<input data-ps-company maxlength="90" placeholder="z. B. Muster Autopark"></label><label>Telefonnummer<input data-ps-phone type="tel" maxlength="35" placeholder="z. B. 079 123 45 67"></label><label>Eigenes Firmenlogo <small>(JPG, PNG, WebP, max. 5 MB)</small><input type="file" data-ps-logo accept="image/png,image/jpeg,image/webp"></label><button type="button" data-ps-logo-clear class="km24PSClear">Logo entfernen</button></div></div>'
 +'<div class="km24PSButtons"><button type="button" data-ps-action="jpg">🖼 JPG herunterladen</button><button type="button" data-ps-action="pdf">⬇ PDF herunterladen</button><button type="button" data-ps-action="print">🖨 Direkt drucken</button></div>'
 +'<div class="km24PSState" role="status" aria-live="polite"></div></div>'
 +'<div class="km24PSPreviewWrap"><div class="km24PSPreviewHead"><strong>Live-Vorschau</strong><span data-ps-dim>A5 · Hochformat</span></div><div class="km24PSPreviewArea"><canvas data-ps-preview role="img" aria-label="Vorschau deines Preisschilds"></canvas></div><p>Alle Downloads werden im gewählten Papierformat erstellt. PDF ist zum Drucken geeignet.</p></div></div>';
 actions.insertAdjacentElement("afterend",sec);
 var state={sellerLogo:null,assets:null,qr:null,timer:null,revision:0,loading:false};
 var status=one(sec,".km24PSState"),preview=one(sec,"[data-ps-preview]"),area=one(sec,".km24PSPreviewArea");
 one(sec,"[data-ps-price]").value=base.price;
 function say(s,isError){status.textContent=s||"";status.classList.toggle("km24PSError",!!isError)}
 function sellerState(){one(sec,".km24PSSellerFields").hidden=!checked(sec,"[data-ps-seller]")}
 function updateSize(){var o=opt(sec,base);one(sec,"[data-ps-dim]").textContent=o.format+" · "+(o.orient==="portrait"?"Hochformat":"Querformat");area.classList.toggle("isLandscape",o.orient==="landscape")}
 async function ensureAssets(){
  if(state.assets)return state.assets;
  state.assets=await Promise.all([imageFrom(base.photo),imageFrom(base.logo)]).then(function(x){return {photo:x[0],brand:x[1],seller:null}});
  return state.assets;
 }
 function schedule(){
  state.revision+=1;var current=state.revision;clearTimeout(state.timer);updateSize();
  state.timer=setTimeout(async function(){
   try{
    var assets=await ensureAssets();if(current!==state.revision||!document.body.contains(sec))return;
    if(!state.qr)state.qr=qrCanvas(modal,base);
    var copy={photo:assets.photo,brand:assets.brand,seller:state.sellerLogo};
    var c=buildCanvas(base,opt(sec,base),copy,state.qr,false),ctx=preview.getContext("2d");
    preview.width=c.width;preview.height=c.height;ctx.drawImage(c,0,0);
   }catch(e){say("Vorschau konnte nicht geladen werden.",true);console.error("KaufMich24 Vorschau",e)}
  },170);
 }
 sec.addEventListener("input",function(e){
  if(e.target.matches("[data-ps-logo]"))return;schedule()
 });
 sec.addEventListener("change",async function(e){
  if(e.target.matches("[data-ps-seller]"))sellerState();
  if(e.target.matches("[data-ps-logo]")){
   var f=e.target.files&&e.target.files[0];
   if(!f){state.sellerLogo=null;schedule();return}
   if(!["image/png","image/jpeg","image/webp"].includes(f.type)||f.size>5*1024*1024){say("Bitte JPG, PNG oder WebP bis 5 MB auswählen.",true);e.target.value="";return}
   var r=new FileReader();r.onload=async function(){state.sellerLogo=await imageFrom(r.result);say(state.sellerLogo?"Firmenlogo hinzugefügt.":"Logo konnte nicht geöffnet werden.",!state.sellerLogo);schedule()};
   r.onerror=function(){say("Logo konnte nicht geladen werden.",true)};r.readAsDataURL(f);return;
  }schedule()
 });
 sec.addEventListener("click",async function(e){
  if(e.target.closest("[data-ps-logo-clear]")){state.sellerLogo=null;one(sec,"[data-ps-logo]").value="";say("Firmenlogo entfernt.");schedule();return}
  var button=e.target.closest("[data-ps-action]");if(!button||state.loading)return;
  var what=button.getAttribute("data-ps-action"),o=opt(sec,base),dims=sizeOf(o);
  state.loading=true;all(sec,"[data-ps-action]").forEach(function(b){b.disabled=true});
  say(what==="print"?"Druckansicht wird vorbereitet…":"Preisschild wird erstellt…");
  try{
   var assets=await ensureAssets();if(!state.qr)state.qr=await waitQR(modal,base);
   if(!state.qr)throw new Error("QR-Code nicht bereit. Bitte den Dialog neu öffnen.");
   var copy={photo:assets.photo,brand:assets.brand,seller:state.sellerLogo};
   if(!assets.photo&&base.photo)throw new Error("Inseratfoto konnte nicht geladen werden. Bitte erneut versuchen.");
   if(what==="pdf")await loadScript(PDF_SRC,function(){return !!(window.jspdf&&window.jspdf.jsPDF)});
   var canvas=buildCanvas(base,o,copy,state.qr,true),file="KaufMich24_Preisschild_"+safeName(base.title)+"_"+o.format+"_"+(o.orient==="portrait"?"Hoch":"Quer");
   if(what==="jpg"){downloadBlob(await jpegBlob(canvas),file+".jpg");say("JPG-Download gestartet.")}
   else if(what==="pdf"){
    var pdf=new window.jspdf.jsPDF({orientation:o.orient,unit:"mm",format:[dims.mw,dims.mh],compress:true});
    pdf.addImage(canvas.toDataURL("image/jpeg",.94),"JPEG",0,0,dims.mw,dims.mh,undefined,"FAST");pdf.save(file+".pdf");say("PDF-Download gestartet.");
   }else{printCanvas(canvas,dims);say("Druckansicht geöffnet. Bitte Papiergrösse und Ausrichtung im Druckdialog prüfen.")}
  }catch(err){console.error("KaufMich24 Preisschild",err);say(err.message||"Datei konnte nicht erstellt werden.",true)}
  finally{state.loading=false;all(sec,"[data-ps-action]").forEach(function(b){b.disabled=false})}
 });
 sellerState();schedule();
 setTimeout(function(){if(document.body.contains(sec)){state.qr=qrCanvas(modal,base);schedule()}},1400);
}
function scan(){all(document,".km24SalesOverlay").forEach(attach)}
function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
