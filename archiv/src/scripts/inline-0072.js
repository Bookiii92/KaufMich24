
(function(){
  if(true)return;/* km24 sell wizard disabled by simple-v3 */
  window.__km24SellWizardV1=true;
  var retry=0,saveTimer=0,currentStep=1,activeForm=null,wasSell=false;
  function isSell(){return ((location.hash||'').split('?')[0]==='#/sell')}
  function byId(id){return document.getElementById(id)}
  function ev(name){return new Event(name,{bubbles:true})}
  function uid(){try{return (typeof user!=='undefined'&&user&&user.id)?user.id:'signed-user'}catch(_){return 'signed-user'}}
  function draftKey(){return 'km24-sell-wizard-draft-v1-'+uid()}
  function textForStep(n){return n===1?'Kategorie & Fotos':n===2?'Angaben & Preis':'Standort & Prüfen'}
  function intro(n){
    var d=document.createElement('div');d.className='km24WizardStepIntro';
    var title=n===1?'Was möchtest du verkaufen?':n===2?'Beschreibe dein Inserat':'Standort & Vorschau';
    var sub=n===1?'Kategorie wählen und Fotos hochladen. Die KI kann danach Titel und Beschreibung vorbereiten.':n===2?'Nur die wichtigsten Angaben und deine gewünschte Verkaufsart.':'Zum Schluss Übergabe prüfen und veröffentlichen.';
    d.innerHTML='<span class="km24WizardStepNo">'+n+'</span><div><h2>'+title+'</h2><p>'+sub+'</p></div>';
    return d;
  }
  function showMsg(msg,focusEl){
    var box=byId('km24SellWizardMsg');if(box){box.textContent=msg||'';box.classList.toggle('show',!!msg)}
    if(focusEl){focusEl.classList.add('km24WizardInvalid');try{focusEl.focus({preventScroll:true})}catch(_){try{focusEl.focus()}catch(__){}}try{focusEl.scrollIntoView({behavior:'smooth',block:'center'})}catch(_){}}
  }
  function clearInvalid(form){form.querySelectorAll('.km24WizardInvalid').forEach(function(x){x.classList.remove('km24WizardInvalid')});showMsg('')}
  function saleType(form){var b=form.querySelector('#saleChoices [data-s].on');return b&&b.dataset?b.dataset.s:'fixed'}
  function validate(form,step){
    clearInvalid(form);
    if(step===1){
      var root=byId('catRoot'),cat=byId('cat');
      if(!root||!root.value){showMsg('Bitte zuerst eine Hauptkategorie wählen.',root);return false}
      if(!cat||!cat.value){showMsg('Bitte eine Unterkategorie wählen.',cat);return false}
      return true;
    }
    if(step===2){
      var title=byId('title');if(!title||title.value.trim().length<3){showMsg('Bitte einen Titel mit mindestens 3 Zeichen eingeben.',title);return false}
      var sale=saleType(form);
      if(sale==='fixed'||sale==='negotiable'){
        var p=byId('price');if(!p||p.value===''||Number(p.value)<0){showMsg('Bitte einen gültigen Preis eingeben.',p);return false}
      }
      if(sale==='auction'){
        var start=byId('start');if(!start||start.value===''||Number(start.value)<0){showMsg('Bitte einen gültigen Startpreis eingeben.',start);return false}
        var time=byId('auctionTime');if(time&&!time.value){showMsg('Bitte eine Endzeit für die Auktion wählen.',time);return false}
      }
      return true;
    }
    var zip=byId('zip'),city=byId('city');
    if(!zip||!/^[0-9]{4}$/.test(zip.value.trim())){showMsg('Bitte eine gültige 4-stellige PLZ eingeben.',zip);return false}
    if(!city||!city.value.trim()){showMsg('Bitte den Ort eingeben.',city);return false}
    return true;
  }
  function saveDraft(form,quiet){
    if(!form)return;
    try{
      var fields={},nodes=form.querySelectorAll('input[id],select[id],textarea[id]');
      nodes.forEach(function(x){if(x.type==='file'||x.type==='submit'||x.type==='button')return;fields[x.id]=(x.type==='checkbox'||x.type==='radio')?!!x.checked:x.value});
      fields.__sale=saleType(form);
      localStorage.setItem(draftKey(),JSON.stringify({step:currentStep,fields:fields,savedAt:Date.now()}));
      if(!quiet){var s=byId('km24SellWizardSaved');if(s){s.textContent='Entwurf gespeichert';setTimeout(function(){if(s)s.textContent='Entwurf aktiv'},900)}}
    }catch(_){}
  }
  function queueSave(form){clearTimeout(saveTimer);saveTimer=setTimeout(function(){saveDraft(form,false)},260)}
  function restoreDraft(form){
    var raw=null,data=null;try{raw=localStorage.getItem(draftKey());if(raw)data=JSON.parse(raw)}catch(_){}
    if(!data||!data.fields)return;
    var f=data.fields;
    try{
      if(f.__sale){var sb=form.querySelector('#saleChoices [data-s="'+String(f.__sale).replace(/"/g,'')+'"]');if(sb)sb.click()}
      var root=byId('catRoot');if(root&&f.catRoot){root.value=f.catRoot;root.dispatchEvent(ev('change'))}
      setTimeout(function(){
        Object.keys(f).forEach(function(id){if(id==='__sale'||id==='catRoot')return;var x=byId(id);if(!x||x.type==='file')return;if((id==='zip'||id==='city')&&(f[id]===null||f[id]===''))return;if(x.type==='checkbox'||x.type==='radio')x.checked=!!f[id];else x.value=f[id]==null?'':String(f[id]);try{x.dispatchEvent(ev(x.tagName==='SELECT'?'change':'input'))}catch(_){} });
        var requestedStep=Math.max(1,Math.min(3,Number(data.step)||1)),safeStep=1;
        var rootNow=byId('catRoot'),catNow=byId('cat');
        if(rootNow&&rootNow.value&&catNow&&catNow.value){
          safeStep=2;
          var titleNow=byId('title'),saleNow=saleType(form),detailsOk=!!(titleNow&&titleNow.value.trim().length>=3);
          if(detailsOk&&(saleNow==='fixed'||saleNow==='negotiable')){var priceNow=byId('price');detailsOk=!!(priceNow&&priceNow.value!==''&&Number(priceNow.value)>=0)}
          if(detailsOk&&saleNow==='auction'){var startNow=byId('start'),timeNow=byId('auctionTime');detailsOk=!!(startNow&&startNow.value!==''&&Number(startNow.value)>=0&&(!timeNow||timeNow.value))}
          if(detailsOk)safeStep=3;
        }
        currentStep=Math.min(requestedStep,safeStep);setStep(currentStep,false);saveDraft(form,true);
      },60);
    }catch(_){}
  }
  function setStep(n,scroll){
    currentStep=Math.max(1,Math.min(3,n));
    document.querySelectorAll('#sf .km24SellStep').forEach(function(x){x.classList.toggle('km24SellStepActive',Number(x.dataset.step)===currentStep)});
    var fill=byId('km24SellWizardFill');if(fill)fill.style.width=(currentStep*33.333)+'%';
    var meta=byId('km24SellWizardStepMeta');if(meta)meta.textContent='Schritt '+currentStep+' von 3';
    var title=byId('km24SellWizardStepTitle');if(title)title.textContent=textForStep(currentStep);
    var back=byId('km24SellWizardBack'),next=byId('km24SellWizardNext'),pub=byId('km24SellWizardPublish');
    if(back)back.classList.toggle('km24WizardHidden',currentStep===1);if(next)next.style.display=currentStep<3?'':'none';if(pub)pub.style.display=currentStep===3?'':'none';
    clearInvalid(activeForm||byId('sf'));if(activeForm)saveDraft(activeForm,true);
    if(scroll){var h=document.querySelector('.km24SellWizardHead')||document.querySelector('.formPage');try{h.scrollIntoView({behavior:'smooth',block:'start'})}catch(_){window.scrollTo(0,0)}}
  }
  function makeStep(n){var d=document.createElement('div');d.className='km24SellStep';d.dataset.step=String(n);d.appendChild(intro(n));return d}
  function enhance(){
    if(!isSell()){document.body&&document.body.classList.remove('km24SellWizardPage');document.querySelectorAll('.km24SellWizardNav,.km24SellWizardHead').forEach(function(x){try{x.remove()}catch(_){}});activeForm=null;currentStep=1;return}
    wasSell=true;
    var form=byId('sf');if(!form){if(retry++<14)setTimeout(enhance,160);return}
    retry=0;if(form.dataset.km24Wizard==='1'){activeForm=form;return}
    activeForm=form;form.dataset.km24Wizard='1';form.classList.add('km24SellWizardActive');document.body&&document.body.classList.add('km24SellWizardPage');
    var main=form.querySelector('.main'),side=form.querySelector('.side');if(!main)return;
    var original=Array.prototype.slice.call(main.children);
    var article=main.querySelector('[data-sell-section="article"]'),photos=main.querySelector('[data-sell-section="photos"]'),sale=main.querySelector('[data-sell-section="sale"]'),price=main.querySelector('[data-sell-section="price"]'),locationPanel=main.querySelector('[data-sell-section="location"]'),attachments=main.querySelector('[data-sell-section="attachments"]'),pro=main.querySelector('.km24ProOptions');
    var step1=makeStep(1),step2=makeStep(2),step3=makeStep(3);main.appendChild(step1);main.appendChild(step2);main.appendChild(step3);
    if(article){
      var row=article.querySelector('.two'),hint=article.querySelector('#catHint'),cp=document.createElement('section');cp.className='panel stack km24WizardCategoryPanel';cp.innerHTML='<h3>Kategorie</h3>';if(row)cp.appendChild(row);if(hint)cp.appendChild(hint);step1.appendChild(cp);step2.appendChild(article);
    }
    if(photos)step1.appendChild(photos);
    original.forEach(function(x){if(x.parentElement!==main)return;if(x===sale||x===price||x===pro||x.classList.contains('catDetails'))step2.appendChild(x)});
    if(sale&&sale.parentElement===main)step2.appendChild(sale);if(price&&price.parentElement===main)step2.appendChild(price);if(pro&&pro.parentElement===main)step2.appendChild(pro);
    if(locationPanel)step3.appendChild(locationPanel);
    var preview=side&&side.querySelector('.livePreview');if(preview)step3.appendChild(preview);
    if(attachments){attachments.classList.add('km24WizardOptional');step3.appendChild(attachments)}
    original.forEach(function(x){if(x.parentElement===main)step2.appendChild(x)});
    if(side)side.style.display='none';
    var head=document.createElement('div');head.className='km24SellWizardHead';head.innerHTML='<div class="km24SellWizardMeta"><span id="km24SellWizardStepMeta">Schritt 1 von 3</span><strong id="km24SellWizardStepTitle">Kategorie & Fotos</strong></div><div class="km24SellWizardTrack"><div id="km24SellWizardFill" class="km24SellWizardFill"></div></div><div id="km24SellWizardSaved" class="km24SellWizardSaved">Entwurf aktiv</div>';form.parentNode.insertBefore(head,form);
    var nav=document.createElement('div');nav.className='km24SellWizardNav';nav.innerHTML='<div class="km24SellWizardNavInner"><div id="km24SellWizardMsg" class="km24SellWizardMsg"></div><button id="km24SellWizardBack" type="button" class="btn km24SellWizardBack km24WizardHidden">← Zurück</button><button id="km24SellWizardNext" type="button" class="btn primary">Weiter →</button><button id="km24SellWizardPublish" type="submit" class="btn primary" style="display:none">✓ Inserat veröffentlichen</button></div>';form.appendChild(nav);
    byId('km24SellWizardBack').onclick=function(){setStep(currentStep-1,true)};
    byId('km24SellWizardNext').onclick=function(){if(validate(form,currentStep))setStep(currentStep+1,true)};
    form.addEventListener('submit',function(e){if(currentStep<3){e.preventDefault();e.stopImmediatePropagation();if(validate(form,currentStep))setStep(currentStep+1,true);return}if(!validate(form,3)){e.preventDefault();e.stopImmediatePropagation()}},true);
    form.addEventListener('input',function(e){if(e.target&&e.target.classList)e.target.classList.remove('km24WizardInvalid');queueSave(form)},true);
    form.addEventListener('change',function(e){if(e.target&&e.target.classList)e.target.classList.remove('km24WizardInvalid');queueSave(form)},true);
    restoreDraft(form);setStep(currentStep,false);
  }
  function schedule(){retry=0;setTimeout(enhance,20);setTimeout(enhance,180);setTimeout(enhance,650)}
  addEventListener('hashchange',function(){
    var now=isSell();
    if(!now&&wasSell){try{if(sessionStorage.getItem('km24PromoAfterCreateV1'))localStorage.removeItem(draftKey())}catch(_){}activeForm=null;currentStep=1;document.body&&document.body.classList.remove('km24SellWizardPage')}
    wasSell=now;schedule();
  });
  addEventListener('pageshow',schedule);
  document.addEventListener('click',function(){if(isSell())setTimeout(enhance,80)},true);
  schedule();
})();
