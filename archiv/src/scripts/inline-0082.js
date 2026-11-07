
(function(){
if(window.__km24MiniV3)return;window.__km24MiniV3=1;
function go(){
 document.querySelectorAll('#km24PersonalizedHome .km24PersonalSection').forEach(function(s){
  if(s.dataset.mini)return;
  var h=s.querySelector('h2');if(!h)return;
  var t=(h.textContent||'').trim();
  if(!(/Zuletzt|Für dich|Recently viewed|Vu récemment|Visti di recente|Pour vous|Per te/i.test(t)))return;
  var b=s.querySelector('.km24PersonalBox');if(!b)return;
  var q=document.createElement('button');q.type='button';q.className='km24MiniBtn';
  q.innerHTML='<span>'+( /Zuletzt|recent|Visti|Vu /i.test(t)?'🕘 ':'✨ ')+t+'</span><span class="km24MiniArrow">›</span>';
  q.onclick=function(){s.classList.toggle('km24Open')};
  b.insertBefore(q,b.firstChild);s.classList.add('km24MiniSec');s.dataset.mini='1';
 });
}
go();setTimeout(go,300);setTimeout(go,900);
new MutationObserver(function(){setTimeout(go,50)}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
