
(function(){
 if(window.__km24ManualCropV1)return;window.__km24ManualCropV1=true;
 function lang(){try{return typeof km24Language==='function'?km24Language():'de'}catch(_){return'de'}}
 var TX={
  de:{button:'✂️ Zuschneiden',title:'Bild zuschneiden & zentrieren',hint:'Bild mit Finger oder Maus verschieben. Mit zwei Fingern oder dem Regler zoomen.',zoom:'Zoom',reset:'Zurücksetzen',cancel:'Abbrechen',save:'Übernehmen',loading:'Bild wird geladen …',error:'Bild konnte nicht geöffnet werden.'},
  fr:{button:'✂️ Recadrer',title:'Recadrer et centrer l’image',hint:'Déplacez l’image au doigt ou à la souris. Zoomez avec deux doigts ou le curseur.',zoom:'Zoom',reset:'Réinitialiser',cancel:'Annuler',save:'Appliquer',loading:'Chargement de l’image …',error:'Impossible d’ouvrir l’image.'},
  it:{button:'✂️ Ritaglia',title:'Ritaglia e centra l’immagine',hint:'Sposta l’immagine con il dito o il mouse. Usa due dita o il cursore per lo zoom.',zoom:'Zoom',reset:'Ripristina',cancel:'Annulla',save:'Applica',loading:'Caricamento immagine …',error:'Impossibile aprire l’immagine.'},
  en:{button:'✂️ Crop',title:'Crop & center image',hint:'Drag the image with your finger or mouse. Pinch or use the slider to zoom.',zoom:'Zoom',reset:'Reset',cancel:'Cancel',save:'Apply',loading:'Loading image …',error:'Could not open image.'}
 };
 function text(){return TX[lang()]||TX.de}
 function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
 function blobFromCanvas(c,type,q){return new Promise(function(resolve){c.toBlob(resolve,type,q)})}
 async function getSource(item){
  if(item&&item._replacementFile instanceof Blob)return item._replacementFile;
  if(item&&item.file instanceof Blob)return item.file;
  if(item&&item.url){var r=await fetch(item.url,{cache:'no-store'});if(!r.ok)throw new Error('image '+r.status);return await r.blob()}
  throw new Error('image source')
 }
 function openEditor(item,onChange){
  var t=text(),o=document.createElement('div');o.className='km24CropOverlay';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.innerHTML='<div class="km24CropModal"><div class="km24CropHead"><b>'+t.title+'</b><button type="button" class="btn km24CropClose" aria-label="Close">×</button></div><div class="km24CropStage"><img draggable="false" alt=""><div class="km24CropGrid"></div></div><div class="km24CropControl"><label><span>'+t.zoom+'</span><input class="km24CropZoom" type="range" min="1" max="4" value="1" step="0.01"></label><small class="km24CropHint">'+t.hint+'</small></div><div class="km24CropActions"><button type="button" class="btn km24CropReset">'+t.reset+'</button><button type="button" class="btn km24CropCancel">'+t.cancel+'</button><button type="button" class="btn primary km24CropSave">'+t.save+'</button></div></div>';
  document.body.appendChild(o);document.body.classList.add('km24ModalOpen');
  var stage=o.querySelector('.km24CropStage'),img=o.querySelector('img'),slider=o.querySelector('.km24CropZoom'),save=o.querySelector('.km24CropSave');
  var nw=0,nh=0,fit=1,zoom=1,left=0,top=0,tempUrl='',closed=false,pointers=new Map(),pinch=null;
  function dims(){return{w:stage.clientWidth||1,h:stage.clientHeight||1}}
  function scale(){return fit*zoom}
  function limit(){var d=dims(),s=scale(),dw=nw*s,dh=nh*s;left=clamp(left,d.w-dw,0);top=clamp(top,d.h-dh,0)}
  function paint(){var s=scale();img.style.width=(nw*s)+'px';img.style.height=(nh*s)+'px';img.style.left=left+'px';img.style.top=top+'px'}
  function center(){var d=dims();fit=Math.max(d.w/nw,d.h/nh);zoom=1;slider.value='1';left=(d.w-nw*fit)/2;top=(d.h-nh*fit)/2;limit();paint()}
  function zoomAt(z,cx,cy){var old=scale(),sx=(cx-left)/old,sy=(cy-top)/old;zoom=clamp(z,1,4);slider.value=String(zoom);var ns=scale();left=cx-sx*ns;top=cy-sy*ns;limit();paint()}
  function close(){if(closed)return;closed=true;try{if(tempUrl)URL.revokeObjectURL(tempUrl)}catch(_){}o.remove();if(!document.querySelector('.km24CropOverlay'))document.body.classList.remove('km24ModalOpen')}
  o.querySelector('.km24CropClose').onclick=close;o.querySelector('.km24CropCancel').onclick=close;o.addEventListener('click',function(e){if(e.target===o)close()});
  o.querySelector('.km24CropReset').onclick=function(){if(nw&&nh)center()};
  slider.addEventListener('input',function(){var d=dims();zoomAt(Number(slider.value)||1,d.w/2,d.h/2)});
  stage.addEventListener('wheel',function(e){if(!nw)return;e.preventDefault();var r=stage.getBoundingClientRect();zoomAt(zoom*(e.deltaY<0?1.08:.92),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  stage.addEventListener('pointerdown',function(e){if(!nw)return;try{stage.setPointerCapture(e.pointerId)}catch(_){}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY});if(pointers.size===2){var a=[...pointers.values()],dx=a[0].x-a[1].x,dy=a[0].y-a[1].y,rr=stage.getBoundingClientRect();pinch={dist:Math.hypot(dx,dy)||1,zoom:zoom,cx:(a[0].x+a[1].x)/2-rr.left,cy:(a[0].y+a[1].y)/2-rr.top}}});
  stage.addEventListener('pointermove',function(e){if(!pointers.has(e.pointerId)||!nw)return;var p=pointers.get(e.pointerId);p.px=p.x;p.py=p.y;p.x=e.clientX;p.y=e.clientY;pointers.set(e.pointerId,p);if(pointers.size===1){left+=p.x-p.px;top+=p.y-p.py;limit();paint()}else if(pointers.size>=2){var a=[...pointers.values()].slice(0,2),dx=a[0].x-a[1].x,dy=a[0].y-a[1].y,dist=Math.hypot(dx,dy)||1;if(!pinch){pinch={dist:dist,zoom:zoom,cx:dims().w/2,cy:dims().h/2}}zoomAt(pinch.zoom*(dist/pinch.dist),pinch.cx,pinch.cy)}});
  function endPointer(e){pointers.delete(e.pointerId);if(pointers.size<2)pinch=null}stage.addEventListener('pointerup',endPointer);stage.addEventListener('pointercancel',endPointer);
  save.onclick=async function(){if(!nw||!nh||save.disabled)return;save.disabled=true;try{var d=dims(),s=scale(),sx=clamp(-left/s,0,nw),sy=clamp(-top/s,0,nh),sw=Math.min(nw-sx,d.w/s),sh=Math.min(nh-sy,d.h/s),ow=Math.max(1,Math.min(1600,Math.round(sw))),oh=Math.max(1,Math.round(ow*d.h/d.w)),c=document.createElement('canvas');c.width=ow;c.height=oh;var ctx=c.getContext('2d');ctx.drawImage(img,sx,sy,sw,sh,0,0,ow,oh);var b=await blobFromCanvas(c,'image/webp',.90),ext='webp';if(!b){b=await blobFromCanvas(c,'image/jpeg',.92);ext='jpg'}if(!b)throw new Error('canvas');var sourceName=(item&&item.file&&item.file.name)||(item&&item._replacementFile&&item._replacementFile.name)||(item&&item.path?item.path.split('/').pop():'bild.jpg')||'bild.jpg',base=sourceName.replace(/\.[^.]+$/,'')||'bild',f=new File([b],base+'-crop.'+ext,{type:b.type||('image/'+ext),lastModified:Date.now()});if(item.kind==='existing')item._replacementFile=f;else item.file=f;try{if(item.url&&String(item.url).startsWith('blob:'))URL.revokeObjectURL(item.url)}catch(_){}item.url=URL.createObjectURL(f);item.focal_x=50;item.focal_y=50;item.fit_mode='cover';item.auto_focus=false;item._manualCrop=true;close();onChange()}catch(e){console.warn('KM24 crop save',e);save.disabled=false;alert(t.error)}};
  (async function(){try{save.disabled=true;var b=await getSource(item);tempUrl=URL.createObjectURL(b);img.onload=function(){nw=img.naturalWidth||1;nh=img.naturalHeight||1;requestAnimationFrame(function(){center();save.disabled=false})};img.onerror=function(){save.disabled=false;alert(t.error);close()};img.src=tempUrl}catch(e){console.warn('KM24 crop load',e);alert(t.error);close()}})();
 }
 window.km24EnhancePhotoManager=function(el,items,onChange){
  if(!el||!Array.isArray(items))return;var t=text();
  el.querySelectorAll('.photoTile').forEach(function(tile,i){if(tile.querySelector('[data-km24-crop]'))return;var x=items[i];if(!x)return;var b=document.createElement('button');b.type='button';b.className='km24CropBtn';b.dataset.km24Crop=String(i);b.textContent=t.button;b.onclick=function(e){e.preventDefault();e.stopPropagation();openEditor(x,onChange)};var a=tile.querySelector('.photoActions');if(a)a.parentNode.insertBefore(b,a);else tile.appendChild(b)});
 };
})();
