
(function(){
 if(window.__km24MarketFilterGhostFixV1)return;window.__km24MarketFilterGhostFixV1=true;
 function home(){var h=((location.hash||'#/').split('?')[0]||'#/');return h==='#/'||h==='#'}
 function area(){try{var q=(location.hash||'').split('?')[1]||'';var a=new URLSearchParams(q).get('area');if(a==='market'||a==='jobs')return a;var k=sessionStorage.getItem('km24HomeAreaV1')||localStorage.getItem('km24HomeAreaV1');return k==='jobs'?'jobs':'market'}catch(_){return 'market'}}
 function forceMarketClean(){
  if(!document.body||!home()||area()!=='market')return;
  document.body.classList.add('km24AreaMarket');
  document.body.classList.remove('km24AreaJobs');
  document.querySelectorAll('.km24HomeFilter,.marketSearchPanel,.compactFilterGroups').forEach(function(el){
    if(el.tagName==='DETAILS')el.open=false;
    el.setAttribute('aria-hidden','true');
  });
 }
 document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest&&e.target.closest('[data-km24-area="market"]');
  if(!b)return;
  try{sessionStorage.setItem('km24HomeAreaV1','market');localStorage.setItem('km24HomeAreaV1','market')}catch(_){}
  if(document.body){document.body.classList.add('km24AreaMarket');document.body.classList.remove('km24AreaJobs')}
  requestAnimationFrame(forceMarketClean);
 },true);
 addEventListener('hashchange',function(){forceMarketClean();setTimeout(forceMarketClean,0);setTimeout(forceMarketClean,40);setTimeout(forceMarketClean,160)});
 addEventListener('pageshow',forceMarketClean);
 try{new MutationObserver(function(){forceMarketClean()}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}catch(_){}
 forceMarketClean();setTimeout(forceMarketClean,80);setTimeout(forceMarketClean,300);
})();
