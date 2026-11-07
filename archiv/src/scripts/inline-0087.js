
(function(){
 if(window.__km24PushMessagePromptV1)return;window.__km24PushMessagePromptV1=true;
 var KEY='km24PushPromptLaterUntil';
 function laterUntil(){try{return Number(localStorage.getItem(KEY)||0)}catch(_){return 0}}
 function setLater(days){try{localStorage.setItem(KEY,String(Date.now()+days*86400000))}catch(_){}}
 function remove(){document.getElementById('km24PushPrompt')?.remove()}
 async function eligible(){
  try{
   if(typeof user==='undefined'||!user)return false;
   if(!window.km24PushState||!window.km24EnablePush)return false;
   if(Date.now()<laterUntil())return false;
   var s=await window.km24PushState();
   if(!s||!s.supported||s.installRequired||s.permission==='denied')return false;
   if(s.permission==='granted'&&s.sub)return false;
   return true;
  }catch(_){return false}
 }
 async function show(){
  if(!(await eligible()))return remove();
  if(document.getElementById('km24PushPrompt'))return;
  var box=document.createElement('div');box.id='km24PushPrompt';box.setAttribute('role','dialog');box.setAttribute('aria-label','Push-Benachrichtigungen aktivieren');
  box.innerHTML='<div class="km24PushPromptRow"><div class="km24PushPromptIcon">🔔</div><div class="km24PushPromptCopy"><b>Neue Nachrichten sofort sehen</b><span>Aktiviere Push und KaufMich24 informiert dich direkt auf dem Handy, wenn Käufer oder Verkäufer dir schreiben.</span></div><button class="km24PushPromptClose" type="button" aria-label="Schliessen">×</button></div><div class="km24PushPromptActions"><button class="km24PushPromptEnable" type="button">Push aktivieren</button><button class="km24PushPromptLater" type="button">Später</button></div>';
  document.body.appendChild(box);requestAnimationFrame(function(){box.classList.add('show')});
  box.querySelector('.km24PushPromptClose').onclick=function(){setLater(7);remove()};
  box.querySelector('.km24PushPromptLater').onclick=function(){setLater(7);remove()};
  box.querySelector('.km24PushPromptEnable').onclick=async function(){
    var b=this;b.disabled=true;b.textContent='Wird aktiviert …';
    try{
      var r=await window.km24EnablePush(true);
      if(r&&r.permission==='granted'){remove();return}
      b.textContent='Nicht erlaubt';setLater(30);setTimeout(remove,900)
    }catch(e){b.disabled=false;b.textContent='Erneut versuchen'}
  };
 }
 function schedule(){setTimeout(show,1200)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 addEventListener('hashchange',function(){setTimeout(show,900)});
 addEventListener('pageshow',function(){setTimeout(show,600)});
})();
