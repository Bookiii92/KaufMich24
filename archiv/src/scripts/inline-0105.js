
(function(){
 if(window.__km24MobileRepairV4)return;window.__km24MobileRepairV4=true;
 function cleanLiteralBreaks(){
   try{
     var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
     var remove=[],n;
     while((n=w.nextNode())){
       var p=n.parentNode,tag=p&&p.nodeName;
       if(!p||/^(SCRIPT|STYLE|TEXTAREA|PRE)$/i.test(tag||''))continue;
       var t=String(n.nodeValue||'').trim();
       if(t&&/^(?:\\n\s*)+$/.test(t))remove.push(n);
     }
     remove.forEach(function(x){try{x.remove()}catch(_){if(x.parentNode)x.parentNode.removeChild(x)}});
   }catch(_){}
 }
 function homeFix(){
   try{
     var home=((location.hash||'#/').split('?')[0]||'#/')==='#/';
     if(!home)return;
     var h=document.querySelector('.hero.km24WowHero h1');if(h)h.innerHTML='Dein Leben.<br><span>Deine Deals.</span>';
     var p=document.querySelector('.hero.km24WowHero .km24HeroText');if(p)p.textContent='Kaufen, verkaufen, Jobs entdecken und Dienstleistungen finden. Alles an einem Ort.';
     var q=document.getElementById('q');if(q)q.placeholder='Was suchst du?';
   }catch(_){}
 }
 function run(){cleanLiteralBreaks();homeFix()}
 addEventListener('hashchange',function(){setTimeout(run,80)});
 addEventListener('pageshow',function(){setTimeout(run,80)});
 run();setTimeout(run,250);setTimeout(run,900);
})();
