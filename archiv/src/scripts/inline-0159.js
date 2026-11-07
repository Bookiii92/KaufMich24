
(function(){
  "use strict";
  if(window.__km24ServicesGrowthV2)return;
  window.__km24ServicesGrowthV2=true;
  var root=document.getElementById("app");
  var categories=[
    ["reinigung","🧹 Reinigung"],
    ["handwerk","🔧 Handwerk"],
    ["transport","🚚 Transport"],
    ["garten","🌿 Garten"],
    ["tierbetreuung","🐾 Tiere"],
    ["kinderbetreuung","🧸 Betreuung"]
  ];
  function current(){return location.hash||"#/"}
  function selectCategory(slug){
    var sel=document.getElementById("svcCat");
    if(!sel||!Array.prototype.some.call(sel.options,function(o){return o.value===slug}))return;
    sel.value=slug;
    sel.dispatchEvent(new Event("change",{bubbles:true}));
    sel.scrollIntoView({behavior:"smooth",block:"center"});
  }
  function quickCategories(){
    var bar=document.querySelector("#app .km24SvcHero .km24SvcActions");
    if(!bar||document.getElementById("km24SvcQuickCatsV2"))return;
    var row=document.createElement("div");
    row.id="km24SvcQuickCatsV2";
    row.className="km24SvcQuickCatsV2";
    row.setAttribute("aria-label","Dienstleistungskategorien");
    categories.forEach(function(c){
      var button=document.createElement("button");
      button.type="button";
      button.textContent=c[1];
      button.addEventListener("click",function(){selectCategory(c[0])});
      row.appendChild(button);
    });
    bar.insertAdjacentElement("afterend",row);
    var preset=new URLSearchParams((current().split("?")[1]||"")).get("category");
    if(preset)selectCategory(preset);
  }
  async function providerLink(){
    var m=current().match(/^#\/services\/post\/([0-9a-f-]{36})(?:\?|$)/i);
    if(!m)return;
    var panel=document.querySelector("#app .km24SvcDetailGrid aside.side > section.panel");
    if(!panel||panel.dataset.km24ProviderLinkFor===m[1])return;
    panel.dataset.km24ProviderLinkFor=m[1];
    try{
      var res=await db.from("service_posts").select("user_id,post_type").eq("id",m[1]).maybeSingle();
      if(!res.data||!panel.isConnected||current().indexOf("#/services/post/"+m[1])!==0)return;
      var a=document.createElement("a");
      a.href="#/profile/"+res.data.user_id;
      a.className="btn km24SvcProviderLinkV2";
      a.textContent=res.data.post_type==="offer"?"👤 Anbieterprofil ansehen":"👤 Auftraggeberprofil ansehen";
      panel.appendChild(a);
    }catch(e){console.warn("Service-Anbieterprofil konnte nicht verlinkt werden",e)}
  }
  function servicePrice(p){
    if(p.price_model==="on_request"||p.price_chf==null)return "Preis auf Anfrage";
    var n="CHF "+new Intl.NumberFormat("de-CH",{maximumFractionDigits:2}).format(Number(p.price_chf));
    if(p.price_model==="hourly")return n+" / Std.";
    if(p.price_model==="from")return "ab "+n;
    return n;
  }
  async function providerServices(){
    var m=current().match(/^#\/profile\/([0-9a-f-]{36})(?:\?|$)/i);
    if(!m)return;
    var host=document.querySelector("#app .wrap.formPage");
    if(!host||host.dataset.km24ProviderServicesFor===m[1])return;
    host.dataset.km24ProviderServicesFor=m[1];
    try{
      var res=await db.from("service_posts")
        .select("id,title,category_slug,city,postal_code,price_model,price_chf,availability")
        .eq("user_id",m[1]).eq("post_type","offer").eq("status","active")
        .order("created_at",{ascending:false}).limit(12);
      var rows=res.data||[];
      if(res.error||!rows.length||!host.isConnected||current().indexOf("#/profile/"+m[1])!==0)return;
      var sec=document.createElement("section");
      sec.className="section km24ProviderServicesV2";
      var h=document.createElement("h2");
      h.textContent="🛠️ Dienstleistungen dieses Anbieters";
      var lead=document.createElement("p");
      lead.textContent="Aktive Angebote, Einsatzorte und Preise auf einen Blick.";
      var grid=document.createElement("div");
      grid.className="km24ProviderServiceGridV2";
      rows.forEach(function(p){
        var card=document.createElement("a");
        card.className="km24ProviderServiceCardV2";
        card.href="#/services/post/"+p.id;
        var title=document.createElement("b");
        title.textContent=p.title;
        var location=document.createElement("small");
        location.textContent="📍 "+[p.postal_code,p.city].filter(Boolean).join(" ");
        var amount=document.createElement("strong");
        amount.textContent=servicePrice(p);
        card.appendChild(title);
        card.appendChild(location);
        if(p.availability){
          var av=document.createElement("small");
          av.textContent="🕒 "+p.availability;
          card.appendChild(av);
        }
        card.appendChild(amount);
        grid.appendChild(card);
      });
      sec.appendChild(h);
      sec.appendChild(lead);
      sec.appendChild(grid);
      var first=host.querySelector("section.section");
      if(first)host.insertBefore(sec,first);else host.appendChild(sec);
    }catch(e){console.warn("Service-Angebote im Profil konnten nicht geladen werden",e)}
  }
  function run(){
    if(current().indexOf("#/services")===0){
      quickCategories();
      providerLink();
    }else if(current().indexOf("#/profile/")===0){
      providerServices();
    }
  }
  if(root)new MutationObserver(run).observe(root,{childList:true});
  addEventListener("hashchange",function(){setTimeout(run,100)});
  addEventListener("pageshow",function(){setTimeout(run,100)});
  setTimeout(run,250);
})();
