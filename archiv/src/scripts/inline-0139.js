
(function(){
  if(window.__km24HomePriorityV8)return;
  window.__km24HomePriorityV8=true;
  var timer=0;
  function isHome(){var h=((location.hash||"#/").split("?")[0]||"#/");return h==="#/"||h==="#"}
  function isMarket(){return !document.body.classList.contains("km24AreaJobs")}
  function apply(){
    if(!isHome()||!isMarket())return;
    try{
      var hero=document.querySelector(".km24HomeHero,.hero.km24WowHero");
      var cats=document.querySelector(".km24CategorySection")||(document.getElementById("cats")&&document.getElementById("cats").closest("section"));
      var latest=document.querySelector(".km24LatestSection")||document.getElementById("latestSection");
      var explore=document.getElementById("km24ExploreV5");
      var perks=document.getElementById("km24HomePerks")||document.querySelector(".km24FounderSpotlight,.km24FounderHomeBand");
      if(hero&&cats&&latest&&hero.parentNode===cats.parentNode){
        if(cats.previousElementSibling!==hero)hero.insertAdjacentElement("afterend",cats);
        if(latest.previousElementSibling!==cats)cats.insertAdjacentElement("afterend",latest);
        var anchor=latest;
        if(explore&&explore.parentNode===anchor.parentNode){if(explore.previousElementSibling!==anchor)anchor.insertAdjacentElement("afterend",explore);anchor=explore}
        if(perks&&perks.parentNode===anchor.parentNode&&perks!==explore){if(perks.previousElementSibling!==anchor)anchor.insertAdjacentElement("afterend",perks)}
      }
      var title=latest&&latest.querySelector("h2");
      var term=(document.getElementById("q")&&document.getElementById("q").value||"").trim();if(title)title.textContent=term?"Suchergebnisse":"Verkaufsinserate";
      var kick=latest&&latest.querySelector(".km24SectionKicker");
      if(kick)kick.textContent="MARKTPLATZ";
      var desc=latest&&latest.querySelector(".km24HomeSectionHead p,.head p.mut");
      if(desc)desc.textContent=term?("Passende Inserate für „"+term+"“."):"Aktuelle Verkaufsangebote aus der ganzen Schweiz.";
      var more=document.getElementById("km24LatestMoreV7");
      if(more)more.textContent="Alle Verkaufsinserate anzeigen";
    }catch(e){console.warn("KM24 home priority",e)}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(apply,70)}
  addEventListener("hashchange",function(){setTimeout(apply,40);setTimeout(apply,220)});
  addEventListener("pageshow",function(){setTimeout(apply,40);setTimeout(apply,220)});
  try{new MutationObserver(schedule).observe(document.getElementById("app")||document.body,{childList:true,subtree:true})}catch(_){}
  apply();setTimeout(apply,150);setTimeout(apply,650);setTimeout(apply,1400);
})();
