
(function(){
 if(window.__km24JobUnifiedV1)return;window.__km24JobUnifiedV1=true;
 var scheduled=false,revealTimer=0;
 function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}
 function low(s){return norm(s).toLowerCase()}
 function listingRoute(){var h=(location.hash||'').split('?')[0];return /^#\/listing\/[0-9a-f-]{36}$/i.test(h)||/^\/listing\/[0-9a-f-]{36}/i.test(location.pathname||'')}
 function boot(){if(listingRoute())document.documentElement.classList.add('km24ListingBoot')}
 function reveal(){clearTimeout(revealTimer);requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.remove('km24ListingBoot')})})}
 function getSpecs(main){return [].slice.call(main.querySelectorAll('.km24DetailSpecs .km24DetailSpec,.km24DetailSpecs .spec'))}
 function specInfo(el){var s=el.querySelector('small'),b=el.querySelector('b');return {el:el,label:low(s&&s.textContent),small:s,bold:b,value:norm(b&&b.textContent)}}
 function isJob(main){var rows=getSpecs(main).map(specInfo);for(var i=0;i<rows.length;i++){if((rows[i].label==='kategorie'||rows[i].label==='bereich'||rows[i].label==='category')&&/^(jobs?|stellen|stellenangebot)$/i.test(rows[i].value))return true}var badges=main.querySelectorAll('.km24DetailBadges .badge');for(var j=0;j<badges.length;j++)if(/stellenangebot/i.test(badges[j].textContent||''))return true;return false}
 function parseDescription(raw){raw=String(raw||'').replace(/\r/g,'').trim();var meta={},body=raw;if(raw.indexOf('💼 Jobdetails\n')===0){var lines=raw.split('\n'),i=1;for(;i<lines.length;i++){var line=lines[i];if(/^Beschreibung:\s*$/i.test(line)){i++;break}if(!line.trim())continue;var p=line.indexOf(':');if(p>0)meta[line.slice(0,p).trim()]=line.slice(p+1).trim()}body=lines.slice(i).join('\n').trim()}return {meta:meta,body:body}}
 function addSpec(grid,label,value){if(!value)return;var exists=[].slice.call(grid.querySelectorAll('small')).some(function(s){return low(s.textContent)===low(label)});if(exists)return;var d=document.createElement('div');d.className='spec km24DetailSpec';d.innerHTML='<small></small><b></b>';d.querySelector('small').textContent=label;d.querySelector('b').textContent=value;grid.appendChild(d)}
 function sellerPanel(){var seller=document.querySelector('.side .seller,.km24SellerTrustPanel .seller');return seller&&seller.closest('.panel')}
 function sellerName(){var p=sellerPanel(),s=p&&p.querySelector('.seller');return norm(s&&s.textContent)}
 function transformMain(main){
  var rows=getSpecs(main).map(specInfo),place='';
  for(var i=rows.length-1;i>=0;i--){var r=rows[i];if(r.label==='ort'||r.label==='arbeitsort'||r.label==='standort'){place=r.value;if(r.small)r.small.textContent='Arbeitsort';continue}if(r.label==='zustand'||r.label==='condition'||r.label==='übergabe'||r.label==='ubergabe'||r.label==='handover'||r.label==='bereich'||r.label==='kategorie'||r.label==='category'){r.el.remove()}}
  var badges=main.querySelector('.km24DetailBadges');if(badges){var privateEmployer=/privat/i.test(badges.textContent||'');badges.innerHTML='';var a=document.createElement('span');a.className='badge km24JobTypeBadge';a.textContent='💼 Stellenangebot';badges.appendChild(a);var b=document.createElement('span');b.className='badge';b.textContent=privateEmployer?'Privater Arbeitgeber':'Arbeitgeber';badges.appendChild(b)}
  var h1=main.querySelector('h1');if(h1){var meta=main.querySelector('.km24JobHeroMeta');if(!meta){meta=document.createElement('div');meta.className='km24JobHeroMeta';h1.insertAdjacentElement('afterend',meta)}var name=sellerName();meta.innerHTML='';if(name){var strong=document.createElement('b');strong.textContent=name;meta.appendChild(strong)}if(name&&place){var dot=document.createElement('span');dot.textContent='·';meta.appendChild(dot)}if(place){var loc=document.createElement('span');loc.textContent='📍 '+place;meta.appendChild(loc)}}
  var price=main.querySelector('.detailprice');if(price)price.style.display='none';
  var grid=main.querySelector('.km24DetailSpecs');if(grid){var title=main.querySelector('.km24JobOverviewTitle');if(!title){title=document.createElement('div');title.className='km24JobOverviewTitle';title.textContent='Auf einen Blick';grid.insertAdjacentElement('beforebegin',title)}var desc=main.querySelector('.km24DetailDescription'),parsed=parseDescription(desc&&desc.textContent);addSpec(grid,'Pensum',parsed.meta.Pensum||parsed.meta.Pensum);addSpec(grid,'Anstellungsart',parsed.meta.Anstellungsart);addSpec(grid,'Eintritt',parsed.meta.Eintritt);addSpec(grid,'Lohn',parsed.meta.Lohn||'Nach Vereinbarung')}
  var descTitle=main.querySelector('.km24DetailSectionTitle'),desc=main.querySelector('.km24DetailDescription');if(descTitle)descTitle.textContent='Stellenbeschreibung';if(desc){var parsed2=parseDescription(desc.textContent);if(parsed2.body&& !/^Keine (Beschreibung|weiteren Angaben)\.?$/i.test(parsed2.body)){desc.textContent=parsed2.body;desc.classList.remove('km24JobEmptyDesc')}else{desc.textContent='Der Arbeitgeber hat noch keine detaillierte Stellenbeschreibung hinterlegt.';desc.classList.add('km24JobEmptyDesc')}}
 }
 function transformSide(){
  var side=document.querySelector('.detail .side');if(!side)return;
  var sp=sellerPanel();if(sp){sp.classList.add('km24JobEmployerPanel');var sm=sp.querySelector(':scope > small.mut');if(sm)sm.textContent='Arbeitgeber';var badge=[].slice.call(sp.querySelectorAll('.badge')).find(function(x){return /privatperson|händler|unternehmen|privat/i.test(x.textContent||'')});if(badge)badge.textContent=/händler|unternehmen/i.test(badge.textContent||'')?'🏢 Unternehmen':'🏢 Privater Arbeitgeber'}
  var nativeChat=document.getElementById('chatBtn');
  var action=side.querySelector('.km24JobActionPanel');if(!action){var first=side.querySelector(':scope > .panel');action=document.createElement('div');action.className='panel km24JobActionPanel';if(first)side.insertBefore(action,first);else side.insertBefore(action,side.firstChild)}
  action.innerHTML='<div class="km24JobKicker">💼 STELLENANGEBOT</div><h3>Interesse an dieser Stelle?</h3><p>Bewirb dich direkt über KaufMich24 oder stelle dem Arbeitgeber zuerst eine Frage.</p><div class="km24JobActionBtns"><button type="button" class="btn primary km24ApplyBtn">Jetzt bewerben</button><button type="button" class="btn km24AskBtn">💬 Frage zur Stelle</button></div>';
  function contact(){var b=document.getElementById('chatBtn');if(b)b.click()}
  var ap=action.querySelector('.km24ApplyBtn'),aq=action.querySelector('.km24AskBtn');if(ap)ap.onclick=contact;if(aq)aq.onclick=contact;
  [].slice.call(side.querySelectorAll(':scope > .panel')).forEach(function(p){if(p!==action&&p!==sp){var t=low(p.textContent);if(t.indexOf('preis vorschlagen')>=0||t.indexOf('sofortkauf')>=0||t.indexOf('aktuelles gebot')>=0)p.remove()}})
  if(nativeChat)nativeChat.style.setProperty('display','none','important')
 }
 function apply(){scheduled=false;if(!listingRoute()){document.body&&document.body.classList.remove('km24JobUnified');document.documentElement.classList.remove('km24ListingBoot');return}var main=document.querySelector('.km24DetailMainPanel');if(!main)return;if(!isJob(main)){document.body&&document.body.classList.remove('km24JobUnified');reveal();return}document.body.classList.add('km24JobUnified');transformMain(main);transformSide();reveal()}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
 boot();
 addEventListener('hashchange',function(){boot();schedule();revealTimer=setTimeout(reveal,1400)});
 addEventListener('pageshow',function(){boot();schedule()});
 document.addEventListener('DOMContentLoaded',schedule,{once:true});
 new MutationObserver(function(){if(!document.body||!document.body.classList.contains('km24JobUnified'))schedule()}).observe(document.documentElement,{subtree:true,childList:true});
 schedule();revealTimer=setTimeout(reveal,1600);
})();
