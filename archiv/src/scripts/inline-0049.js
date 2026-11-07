
(function(){
 if(window.__km24AdminMarketingV1)return;window.__km24AdminMarketingV1=true;
 const links=[
  ['Facebook','https://www.kaufmich24.ch/?utm_source=facebook&utm_medium=paid_social&utm_campaign=seller_launch_2026&utm_content=seller_landing#/verkaufen'],
  ['Instagram','https://www.kaufmich24.ch/?utm_source=instagram&utm_medium=paid_social&utm_campaign=seller_launch_2026&utm_content=seller_landing#/verkaufen'],
  ['TikTok','https://www.kaufmich24.ch/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=seller_launch_2026&utm_content=seller_landing#/verkaufen']
 ];
 function esc(v){return typeof E==='function'?E(v):String(v||'')}
 async function render(){
   if((location.hash||'').split('?')[0]!=='#/admin'||!window.user||!window.profile?.is_admin)return;
   const host=document.querySelector('#app .formPage')||document.querySelector('#app .wrap');if(!host)return;
   let box=document.getElementById('km24MarketingPanel');
   if(!box){box=document.createElement('section');box.id='km24MarketingPanel';box.className='panel km24MarketingPanel';const head=host.querySelector(':scope > .head');head?head.insertAdjacentElement('afterend',box):host.prepend(box)}
   box.innerHTML='<div class="head"><div><span class="km24SectionKicker">📈 WERBE-TRACKING</span><h2 style="margin:5px 0">Marketing-Funnel · 30 Tage</h2><p class="mut">Landingpage → Registrierung → erstes Inserat. Datenschutzfreundlich über eigene UTM-Zuordnung.</p></div><span class="badge">Laden …</span></div>';
   const [fr,cr]=await Promise.all([db.rpc('admin_marketing_funnel',{p_days:30}),db.rpc('admin_marketing_campaigns',{p_days:30})]);
   if(fr.error||cr.error){box.insertAdjacentHTML('beforeend','<div class="notice err">'+esc(fr.error?.message||cr.error?.message||'Tracking konnte nicht geladen werden.')+'</div>');return}
   const x=fr.data||{},rows=cr.data||[];
   const campaignRows=rows.length?rows.map(r=>'<tr><td>'+esc(r.source)+'</td><td>'+esc(r.medium)+'</td><td>'+esc(r.campaign)+'</td><td>'+Number(r.registrations||0)+'</td><td>'+Number(r.seller_users||0)+'</td><td>'+Number(r.listings||0)+'</td></tr>').join(''):'<tr><td colspan="6" class="mut">Noch keine Kampagnendaten. Die Messung beginnt ab jetzt.</td></tr>';
   box.innerHTML=
    '<div class="head"><div><span class="km24SectionKicker">📈 WERBE-TRACKING</span><h2 style="margin:5px 0">Marketing-Funnel · 30 Tage</h2><p class="mut">Landingpage → Registrierung → erstes Inserat. Datenschutzfreundlich über eigene UTM-Zuordnung.</p></div><span class="badge">Live</span></div>'+
    '<div class="km24MarketingKpis"><div><b>'+Number(x.landing_sessions||0)+'</b><small>Landing-Besucher</small></div><div><b>'+Number(x.signup_starts||0)+'</b><small>Registrierung gestartet</small></div><div><b>'+Number(x.registrations||0)+'</b><small>Registrierungen</small></div><div><b>'+Number(x.seller_users||0)+'</b><small>Nutzer mit Inserat</small></div><div><b>'+Number(x.listings||0)+'</b><small>Erstellte Inserate</small></div></div>'+
    '<div class="km24MarketingRates"><span>Besuch → Registrierung: '+Number(x.landing_to_registration_pct||0).toFixed(1)+' %</span><span>Registrierung → Verkäufer: '+Number(x.registration_to_seller_pct||0).toFixed(1)+' %</span></div>'+
    '<h3 style="margin:16px 0 4px">Fertige Werbelinks</h3><p class="mut" style="font-size:11px">Benutze pro Plattform den passenden Link. Dadurch wird die Quelle automatisch erkannt.</p>'+
    '<div class="km24CampaignLinks">'+links.map((x,i)=>'<div class="km24CampaignLink"><b>'+x[0]+'</b><code>'+esc(x[1])+'</code><button class="btn" type="button" data-copy-campaign="'+i+'">Kopieren</button></div>').join('')+'</div>'+
    '<div class="km24MarketingTable"><table><thead><tr><th>Quelle</th><th>Medium</th><th>Kampagne</th><th>Registrierungen</th><th>Mit Inserat</th><th>Inserate</th></tr></thead><tbody>'+campaignRows+'</tbody></table></div>';
   box.querySelectorAll('[data-copy-campaign]').forEach(b=>b.onclick=async()=>{const u=links[Number(b.dataset.copyCampaign)]?.[1];if(!u)return;try{await navigator.clipboard.writeText(u);const old=b.textContent;b.textContent='✓ Kopiert';setTimeout(()=>b.textContent=old,1200)}catch(_){prompt('Link kopieren:',u)}})
 }
 let t=0;function schedule(){clearTimeout(t);t=setTimeout(render,120)}
 addEventListener('hashchange',schedule);
 const a=document.getElementById('app');if(a)new MutationObserver(schedule).observe(a,{childList:true});
 setTimeout(render,250)
})();
