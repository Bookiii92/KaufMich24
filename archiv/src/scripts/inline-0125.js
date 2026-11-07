
(function(){
  if(window.__km24AreaSwitchHardV4)return;
  window.__km24AreaSwitchHardV4=true;
  var switchSeq=0;
  function onHome(){var b=((location.hash||'#/').split('?')[0]||'#/');return b==='#/'||b==='#'}
  function currentArea(){
    try{var q=new URLSearchParams((location.hash||'').split('?')[1]||'').get('area');if(q==='jobs'||q==='market')return q}catch(_){}
    if(document.body.classList.contains('km24AreaJobs'))return 'jobs';
    try{return localStorage.getItem('km24HomeAreaV1')==='jobs'?'jobs':'market'}catch(_){return'market'}
  }
  function persist(area){
    try{sessionStorage.setItem('km24HomeAreaV1',area);localStorage.setItem('km24HomeAreaV1',area)}catch(_){}
    try{
      var raw=location.hash||'#/';var parts=raw.split('?');var base=parts[0]||'#/';var p=new URLSearchParams(parts[1]||'');p.set('area',area);
      history.replaceState(null,'',location.pathname+location.search+base+'?'+p.toString());
    }catch(_){}
  }
  function paintLoading(area){
    var g=document.getElementById('grid'),st=document.getElementById('resultStatus');
    if(st)st.textContent=area==='jobs'?'Jobs werden geladen …':'Marktplatz wird geladen …';
    if(g)g.innerHTML='<div class="empty" style="grid-column:1/-1">'+(area==='jobs'?'Jobs werden geladen …':'Marktplatz wird geladen …')+'</div>';
  }
  async function hardSwitch(area){
    if(!onHome())return;
    area=area==='jobs'?'jobs':'market';
    var same=currentArea()===area && document.body.classList.contains(area==='jobs'?'km24AreaJobs':'km24AreaMarket');
    persist(area);
    document.body.classList.toggle('km24AreaJobs',area==='jobs');
    document.body.classList.toggle('km24AreaMarket',area==='market');
    if(same)return;
    var my=++switchSeq;
    window.__km24SearchSeq=(window.__km24SearchSeq||0)+1;
    paintLoading(area);
    document.body.classList.add('km24AreaTransition');
    try{
      if(typeof home==='function'){
        await home();
      }else if(area==='jobs'&&typeof window.km24RunJobsSearch==='function'){
        await window.km24RunJobsSearch();
      }else if(area==='market'&&typeof runMarketplaceSearch==='function'){
        await runMarketplaceSearch();
      }
    }catch(e){
      console.warn('KM24 area switch',e);
      if(my===switchSeq){
        try{
          if(area==='jobs'&&typeof window.km24RunJobsSearch==='function')await window.km24RunJobsSearch();
          else if(area==='market'&&typeof runMarketplaceSearch==='function')await runMarketplaceSearch();
        }catch(_){}
      }
    }finally{
      if(my===switchSeq)document.body.classList.remove('km24AreaTransition');
    }
  }
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('[data-km24-area]');
    if(!b||!onHome())return;
    var area=b.getAttribute('data-km24-area');if(area!=='jobs'&&area!=='market')return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    hardSwitch(area);
  },true);
  window.km24HardSwitchArea=hardSwitch;
})();
