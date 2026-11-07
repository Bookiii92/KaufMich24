
(function(){
  if(window.__km24CompactPersonalV1)return;
  window.__km24CompactPersonalV1=true;

  function makeCompact(id,label,icon){
    var sec=document.getElementById(id);
    if(!sec || sec.dataset.km24CompactReady==='1') return;
    var wrap=sec.querySelector(':scope > .wrap') || sec;
    if(!wrap) return;

    var existing=[].slice.call(wrap.childNodes);
    if(!existing.length) return;

    var btn=document.createElement('button');
    btn.type='button';
    btn.className='km24CompactToggle';
    btn.setAttribute('aria-expanded','false');
    btn.innerHTML=
      '<span class="km24CompactToggleLeft">'+
        '<span class="km24CompactToggleIcon">'+icon+'</span>'+
        '<span>'+label+'</span>'+
      '</span>'+
      '<span class="km24CompactToggleArrow" aria-hidden="true">›</span>';

    var body=document.createElement('div');
    body.className='km24CompactBody';
    existing.forEach(function(node){ body.appendChild(node); });

    wrap.appendChild(btn);
    wrap.appendChild(body);
    sec.classList.add('km24CompactPersonalItem');
    sec.classList.remove('km24CompactOpen');
    sec.dataset.km24CompactReady='1';

    btn.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var open=sec.classList.toggle('km24CompactOpen');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  }

  function apply(){
    makeCompact('kmForYouSection','Für dich','✨');
    makeCompact('kmRecentSection','Zuletzt angesehen','🕘');
  }

  var timer=0;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(apply,80);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();

  window.addEventListener('hashchange',schedule);
  setTimeout(apply,250);
  setTimeout(apply,800);
  setTimeout(apply,1600);

  var app=document.getElementById('app');
  
})();
