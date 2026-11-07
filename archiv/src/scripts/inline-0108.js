
(function(){
 if(window.__km24CategoryFeedProV1)return;window.__km24CategoryFeedProV1=true;
 var titles=['Neu in deinen Kategorien','Nouveau dans vos catégories','Novità nelle tue categorie','New in your categories'];
 function apply(){
  try{
   document.querySelectorAll('#app h1,#app h2,#app h3').forEach(function(h){
    var txt=(h.textContent||'').trim();
    if(!titles.includes(txt))return;
    var section=h.closest('.km24PersonalV5,.section,section')||h.parentElement;
    if(section)section.classList.add('km24CategoryFeedPro');
   });
  }catch(_){}
 }
 function schedule(){setTimeout(apply,80)}
 addEventListener('hashchange',schedule);addEventListener('pageshow',schedule);addEventListener('km24:language',schedule);
 document.addEventListener('click',function(){setTimeout(apply,120)},true);
 apply();setTimeout(apply,250);setTimeout(apply,900);
})();
