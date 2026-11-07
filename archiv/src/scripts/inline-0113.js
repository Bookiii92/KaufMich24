
(function(){
 if(window.__km24AvatarCenteringV2)return;window.__km24AvatarCenteringV2=true;
 let busy=false;
 const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
 function controls(){return {input:document.getElementById('km24AvatarFile'),save:document.getElementById('km24AvatarSave'),x:document.getElementById('km24AvatarPosX'),y:document.getElementById('km24AvatarPosY'),img:document.querySelector('#km24AvatarPreview .km24Avatar img'),msg:document.getElementById('km24AvatarMsg')}}
 function paint(){const c=controls();if(!c.x||!c.y||!c.img)return;c.img.style.setProperty('object-position',clamp(c.x.value)+'% '+clamp(c.y.value)+'%','important')}
 async function crop(file,xPct,yPct){
   let img=null,bitmap=null,url=null;
   try{
     if('createImageBitmap' in window){try{bitmap=await createImageBitmap(file);img=bitmap}catch(_){}}
     if(!img){url=URL.createObjectURL(file);img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Bild konnte nicht geladen werden.'));im.src=url})}
     const w=img.width||img.naturalWidth,h=img.height||img.naturalHeight;
     if(!w||!h)throw new Error('Bildgrösse konnte nicht gelesen werden.');
     const side=Math.min(w,h),left=(w-side)*(clamp(xPct)/100),top=(h-side)*(clamp(yPct)/100),out=Math.min(1400,side);
     const canvas=document.createElement('canvas');canvas.width=out;canvas.height=out;
     const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw new Error('Bildbearbeitung wird auf diesem Gerät nicht unterstützt.');
     ctx.drawImage(img,left,top,side,side,0,0,out,out);
     const type=file.type==='image/png'?'image/png':file.type==='image/webp'?'image/webp':'image/jpeg';
     const blob=await new Promise(resolve=>canvas.toBlob(resolve,type,type==='image/png'?undefined:.92));
     if(!blob)throw new Error('Profilbild konnte nicht zugeschnitten werden.');
     const ext=type==='image/png'?'png':type==='image/webp'?'webp':'jpg';
     return new File([blob],'profilbild-zentriert.'+ext,{type,lastModified:Date.now()});
   }finally{try{bitmap&&bitmap.close&&bitmap.close()}catch(_){}if(url)URL.revokeObjectURL(url)}
 }
 document.addEventListener('input',function(e){if(e.target&&((e.target.id==='km24AvatarPosX')||(e.target.id==='km24AvatarPosY')))paint()},true);
 document.addEventListener('change',function(e){if(e.target&&e.target.id==='km24AvatarFile'){setTimeout(function(){const c=controls();if(c.x)c.x.value='50';if(c.y)c.y.value='50';paint()},0)}},true);
 document.addEventListener('click',async function(e){
   const reset=e.target&&e.target.closest&&e.target.closest('#km24AvatarCenterReset');
   if(reset){e.preventDefault();e.stopImmediatePropagation();const c=controls();if(c.x)c.x.value='50';if(c.y)c.y.value='50';paint();return}
   const save=e.target&&e.target.closest&&e.target.closest('#km24AvatarSave');
   if(!save)return;
   const c=controls(),file=c.input&&c.input.files&&c.input.files[0];
   if(!file||busy)return;
   e.preventDefault();e.stopImmediatePropagation();busy=true;save.disabled=true;
   if(c.msg)c.msg.innerHTML='<div class="notice">Bild wird zentriert und gespeichert ...</div>';
   try{
     const cropped=await crop(file,c.x?c.x.value:50,c.y?c.y.value:50);
     if(typeof window.km24UploadAvatar!=='function')throw new Error('Profilbild-Funktion konnte nicht geladen werden. Bitte Seite neu laden.');
     await window.km24UploadAvatar(cropped);
     if(c.msg)c.msg.innerHTML='<div class="notice">✓ Profilbild gespeichert.</div>';
     if(typeof loadProfile==='function')await loadProfile();
     setTimeout(function(){if(typeof me==='function')me()},300);
   }catch(err){if(c.msg)c.msg.innerHTML='<div class="notice err">'+String(err&&err.message||err)+'</div>';save.disabled=false}
   finally{busy=false}
 },true);
 function enhance(){paint()}
 addEventListener('hashchange',()=>setTimeout(enhance,80));addEventListener('pageshow',()=>setTimeout(enhance,80));setTimeout(enhance,120);
})();
