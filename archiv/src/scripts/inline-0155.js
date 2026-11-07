
(function(){
 if(window.__km24AdminSalesSheetV1)return;window.__km24AdminSalesSheetV1=true;
 let timer=0;
 function listingId(){let h=(location.hash||'').split('?')[0],m=h.match(/^#\/listing\/([0-9a-f-]{36})$/i);if(!m)m=(location.pathname||'').match(/\/listing\/([0-9a-f-]{36})\/?$/i);return m?m[1]:''}
 async function apply(){
  const id=listingId();if(!id)return;
  if(typeof user==='undefined'||!user)return;
  try{if((typeof profile==='undefined'||!profile)&&typeof loadProfile==='function')await loadProfile()}catch(_){}
  if(typeof profile==='undefined'||!profile||!profile.is_admin)return;
  const side=document.querySelector('.detail .side');if(!side)return;
  let panel=side.querySelector('.km24AdminSalesPanel');
  if(panel){let b=panel.querySelector('[data-sales-sheet]');if(b)b.setAttribute('data-sales-sheet',id);return}
  panel=document.createElement('div');panel.className='panel km24AdminSalesPanel';
  panel.innerHTML='<b>🛠 Admin-Werkzeug</b><small class="mut">Verkaufsbild dieses Inserats als PDF oder JPG herunterladen.</small><button type="button" class="btn primary" style="margin-top:10px" data-sales-sheet="'+id+'">🖨 Verkaufsbild / PDF</button>';
  side.appendChild(panel);
 }
 function schedule(ms=60){clearTimeout(timer);timer=setTimeout(apply,ms)}
 addEventListener('hashchange',()=>schedule(80));addEventListener('pageshow',()=>schedule(80));
 document.addEventListener('DOMContentLoaded',()=>schedule(20),{once:true});
 try{new MutationObserver(()=>schedule(80)).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true})}catch(_){}
 schedule(20);setTimeout(()=>schedule(0),300);setTimeout(()=>schedule(0),1000);
})();
