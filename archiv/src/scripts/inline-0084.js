
(function(){
 if(window.__km24SellRedesignV3)return;window.__km24SellRedesignV3=true;
 function step(){var a=document.querySelector('#sf .km24SellStepActive');return a?Number(a.dataset.step||1):1}
 function paint(){
  if(((location.hash||'').split('?')[0])!=='#/sell')return;
  var h=document.querySelector('.km24SellWizardHead');if(!h)return;
  if(!h.querySelector('.km24WizardHero')){
   h.innerHTML='<div class="km24WizardHero"><div class="km24WizardHeroCopy"><small>✨ SCHNELL & EINFACH INSERIEREN</small><h1>Inserat erstellen</h1><p>In drei kurzen Schritten online – ohne unnötige Felder.</p></div><div class="km24WizardHeroBadge">＋</div></div><div class="km24WizardFancySteps"><div class="km24WizardFancyStep" data-fancy-step="1"><span class="n">1</span><div><b>Kategorie & Fotos</b><small>Grundlage wählen</small></div></div><div class="km24WizardFancyStep" data-fancy-step="2"><span class="n">2</span><div><b>Angaben & Preis</b><small>Details ergänzen</small></div></div><div class="km24WizardFancyStep" data-fancy-step="3"><span class="n">3</span><div><b>Prüfen & online</b><small>Fertigstellen</small></div></div><div id="km24SellWizardSaved" class="km24SellWizardSaved">Entwurf aktiv</div></div>';
  }
  var plus=document.querySelector(".km24WizardHeroBadge");
  if(plus&&!plus.dataset.km24Bound){
   plus.dataset.km24Bound="1";plus.setAttribute("role","button");plus.setAttribute("tabindex","0");plus.setAttribute("aria-label","Inserat erstellen – zu Kategorie und Fotos");
   var openStart=function(ev){if(ev){try{ev.preventDefault();ev.stopPropagation()}catch(_){}}var target=document.getElementById("catRoot")||document.querySelector("#sf .km24SellStepActive .panel");if(target){try{target.scrollIntoView({behavior:"smooth",block:"center"})}catch(_){try{target.scrollIntoView()}catch(__){}}setTimeout(function(){try{target.focus({preventScroll:true})}catch(_){try{target.focus()}catch(__){}}},220)}};
   plus.onclick=openStart;plus.onkeydown=function(e){if(e.key==="Enter"||e.key===" ")openStart(e)};
  }
  var s=step();document.querySelectorAll('.km24WizardFancyStep').forEach(function(x){var n=Number(x.dataset.fancyStep);x.classList.toggle('active',n===s);x.classList.toggle('done',n<s)});
  var next=document.getElementById('km24SellWizardNext'),pub=document.getElementById('km24SellWizardPublish');
  if(next)next.textContent=s===1?'Weiter zu Angaben →':'Weiter zur Vorschau →';
  if(pub)pub.textContent='✓ Inserat veröffentlichen';
 }
 addEventListener('hashchange',function(){setTimeout(paint,40);setTimeout(paint,220)});
 addEventListener('pageshow',function(){setTimeout(paint,60)});
 document.addEventListener('click',function(){setTimeout(paint,0);setTimeout(paint,160)},true);
 var mo=new MutationObserver(function(){setTimeout(paint,0)});if(document.documentElement)mo.observe(document.documentElement,{childList:true,subtree:true,class:true});
 paint();setTimeout(paint,250);setTimeout(paint,700);
})();
