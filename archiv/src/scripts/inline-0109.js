
(function(){
 if(window.__km24FeesCleanV2)return;window.__km24FeesCleanV2=true;
 const C={
  de:{title:'Gebühren & Preise',intro:'Einfach, transparent und ohne versteckte Kosten. Die späteren Tarife bleiben sichtbar, obwohl die Startphase aktuell kostenlos ist.',priv:'Für Privatpersonen',privsub:'Keine Monatsgebühr',dealer:'Für Händler',dealersub:'Mehr Inserate und tiefere Verkaufsprovision',bill:'Abrechnung kleiner Gebühren',billsub:'Wie kleine Verkaufsgebühren gesammelt werden',reward:'Punkte pro Verkauf',rewardsub:'Bonus nach Kategorie',terms:'Regeln zu KaufMich24 Punkten',termssub:'Gültigkeit, Einlösung und Bedingungen'},
  fr:{title:'Frais & tarifs',intro:'Simple, transparent et sans frais cachés. Les tarifs futurs restent visibles même pendant la phase de lancement gratuite.',priv:'Pour les particuliers',privsub:'Aucun abonnement mensuel',dealer:'Pour les professionnels',dealersub:'Plus d’annonces et commissions réduites',bill:'Facturation des petits frais',billsub:'Comment les petits frais sont regroupés',reward:'Points par vente',rewardsub:'Bonus selon la catégorie',terms:'Règles des points KaufMich24',termssub:'Validité, utilisation et conditions'},
  it:{title:'Commissioni & prezzi',intro:'Semplice, trasparente e senza costi nascosti. I prezzi futuri restano visibili anche durante la fase iniziale gratuita.',priv:'Per privati',privsub:'Nessun canone mensile',dealer:'Per commercianti',dealersub:'Più annunci e commissioni ridotte',bill:'Addebito delle piccole commissioni',billsub:'Come vengono raggruppati i piccoli importi',reward:'Punti per vendita',rewardsub:'Bonus in base alla categoria',terms:'Regole dei punti KaufMich24',termssub:'Validità, utilizzo e condizioni'},
  en:{title:'Fees & pricing',intro:'Simple, transparent and without hidden costs. Future prices remain visible even during the free launch phase.',priv:'For private sellers',privsub:'No monthly fee',dealer:'For dealers',dealersub:'More listings and lower sales commission',bill:'Small-fee billing',billsub:'How small sales fees are grouped',reward:'Points per sale',rewardsub:'Bonus by category',terms:'KaufMich24 points rules',termssub:'Validity, redemption and conditions'}
 };
 function lang(){try{return typeof km24Language==='function'?km24Language():(document.documentElement.lang||'de').slice(0,2)}catch(_){return 'de'}}
 function head(cls,title,sub){let d=document.createElement('div');d.className='km24FeesGroupHead '+cls;d.innerHTML='<strong>'+title+'</strong><span>'+sub+'</span>';return d}
 function detail(panel,kind,t){
   if(!panel)return;
   let existing=panel.closest('details.km24FeesDetail');
   if(existing){let s=existing.querySelector('summary');if(s){s.querySelector('span').textContent=t[kind];s.querySelector('small').textContent=t[kind+'sub']}return}
   let d=document.createElement('details');d.className='km24FeesDetail km24FeesDetail-'+kind;
   let s=document.createElement('summary');s.innerHTML='<span></span><small></small><b>⌄</b>';s.querySelector('span').textContent=t[kind];s.querySelector('small').textContent=t[kind+'sub'];
   panel.parentNode.insertBefore(d,panel);d.appendChild(s);d.appendChild(panel);panel.classList.add('km24FeesInnerPanel');
 }
 function tidy(){
  try{
   if((location.hash||'').split('?')[0]!=='#/fees')return;
   let page=document.querySelector('.km24FeesPage');if(!page)return;
   let t=C[lang()]||C.de,first=page.dataset.km24FeesClean!=='1';
   let hero=page.querySelector(':scope>.panel');
   if(hero){hero.classList.add('km24FeesHero');let h=hero.querySelector('h1');if(h)h.textContent=t.title;let p=hero.querySelector('p.mut');if(p)p.textContent=t.intro}
   let section=page.querySelector(':scope>section.section'),grid=section&&section.querySelector('.planGrid');
   if(grid){
     grid.classList.add('km24FeesPlanGrid');
     if(first){
       let plans=[...grid.querySelectorAll('.plan')],priv=plans.find(x=>!x.querySelector('.badge.dealer')),dealer=plans.find(x=>x.querySelector('.badge.dealer'));
       if(priv){priv.classList.add('km24PlanPrivate');grid.insertBefore(head('km24FeesPrivateHead',t.priv,t.privsub),priv)}
       if(dealer)grid.insertBefore(head('km24FeesDealerHead',t.dealer,t.dealersub),dealer);
       if(hero&&section)hero.after(section);
     }
     let ph=grid.querySelector('.km24FeesPrivateHead'),dh=grid.querySelector('.km24FeesDealerHead');if(ph){ph.querySelector('strong').textContent=t.priv;ph.querySelector('span').textContent=t.privsub}if(dh){dh.querySelector('strong').textContent=t.dealer;dh.querySelector('span').textContent=t.dealersub}
   }
   let panels=[...page.querySelectorAll(':scope>.panel')];
   let promo=page.querySelector('.km24PromoPrices')?.closest('.panel');if(promo)promo.classList.add('km24PromoPanel');
   detail(page.querySelector('.km24BillingPolicy'),'bill',t);
   detail(page.querySelector('.km24RewardPanel'),'reward',t);
   detail(page.querySelector('.km24PointTerms'),'terms',t);
   page.dataset.km24FeesClean='1';
  }catch(_){}
 }
 let timer=0;function queue(){clearTimeout(timer);timer=setTimeout(tidy,50)}
 addEventListener('hashchange',queue);addEventListener('pageshow',queue);addEventListener('km24:language',queue);
 let app=document.getElementById('app');if(app)new MutationObserver(queue).observe(app,{childList:true,subtree:false});queue();
})();
