
(function(){
  function labelFor(id){
    var el=document.getElementById(id);
    return el ? el.closest('label') : null;
  }
  function makeGroup(title,hint,open){
    var d=document.createElement('details');
    d.className='filterGroup';
    if(open)d.open=true;
    var s=document.createElement('summary');
    s.innerHTML='<span class="filterGroupTitle">'+title+'</span><span class="filterGroupHint">'+hint+'</span>';
    var b=document.createElement('div');
    b.className='filterGroupBody';
    d.appendChild(s); d.appendChild(b);
    return {details:d,body:b};
  }
  function enhance(){
    var panel=document.querySelector('.marketSearchPanel');
    var grid=panel && panel.querySelector('.marketSearchGrid');
    if(!panel || !grid || panel.dataset.km24Compact==='1')return;
    var scat=labelFor('scat'),ssub=labelFor('ssub'),slocation=labelFor('slocation'),smin=labelFor('smin'),smax=labelFor('smax'),
        scond=labelFor('scond'),scanton=labelFor('scanton'),sseller=labelFor('sseller'),
        sprice=labelFor('sprice'),ssort=labelFor('ssort'),sverified=labelFor('sverified');
    if(!(scat&&ssub&&slocation&&smin&&smax&&scond&&scanton&&sseller&&sprice&&ssort&&sverified))return;

    var wrap=document.createElement('div');
    wrap.className='compactFilterGroups';

    var g1=makeGroup('📂 Kategorie','Haupt- & Unterkategorie',true);
    g1.body.append(scat,ssub);

    var g2=makeGroup('💰 Preis & Verkaufsart','Preisbereich und Art',false);
    var price=document.createElement('div');
    price.className='priceRangeRow';
    price.append(smin,smax);
    g2.body.append(price,sprice);

    var g3=makeGroup('📍 Ort & Zustand','Ort, Kanton und Zustand',false);
    g3.body.append(slocation,scanton,scond);

    var g4=makeGroup('👤 Verkäufer & Vertrauen','Privat oder Händler',false);
    g4.body.append(sseller);

    var g5=makeGroup('↕ Sortierung','Reihenfolge der Treffer',false);
    g5.body.append(ssort);

    wrap.append(g1.details,g2.details,g3.details,g4.details,g5.details);
    grid.replaceWith(wrap);
    panel.dataset.km24Compact='1';
  }

  var app=document.getElementById('app');
  if(app){
    var mo=new MutationObserver(enhance);
    mo.observe(app,{childList:true,subtree:true});
  }
  enhance();
})();