
(function(){
  if(window.__km24UiMasterV1)return;window.__km24UiMasterV1=true;
  var timer=0;
  function key(){
    var h=(location.hash||"#/").split("?")[0];
    if(h==="#/")return "home";
    if(h.indexOf("#/listing/")===0)return "listing";
    if(h.indexOf("#/sell")===0||h==="#/create")return "sell";
    if(h.indexOf("#/messages")===0)return "messages";
    if(h==="#/me")return "account";
    if(h==="#/admin")return "admin";
    if(h.indexOf("#/services")===0)return "services";
    if(h==="#/login")return "login";
    return "page";
  }
  function clean(){
    document.body.setAttribute("data-km24-route",key());

document.querySelectorAll("#kmListingAi,#kmListingAie").forEach(function(x){x.remove()});
    document.querySelectorAll(".btn,button,a").forEach(function(x){
      if(!x.getAttribute("aria-label")&&!String(x.textContent||"").trim()&&x.getAttribute("title"))x.setAttribute("aria-label",x.getAttribute("title"));
    });
    var homeFilter=document.querySelector(".km24HomeFilter");
    if(homeFilter&&!homeFilter.dataset.km24Master){
      homeFilter.dataset.km24Master="1";
      if(window.matchMedia&&window.matchMedia("(max-width:700px)").matches)homeFilter.open=false;
    }
    var route=(location.hash||"#/").split("?")[0];
    var titles={
      "#/":"KaufMich24 – Kaufen & Verkaufen",
      "#/create":"Inserat erstellen – KaufMich24",
      "#/me":"Mein Konto – KaufMich24",
      "#/messages":"Nachrichten – KaufMich24",
      "#/services":"Dienstleistungen – KaufMich24",
      "#/fees":"Gebühren – KaufMich24",
      "#/support":"Hilfe & Support – KaufMich24"
    };
    if(titles[route])document.title=titles[route];
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(clean,50)}
  addEventListener("hashchange",function(){try{window.scrollTo({top:0,left:0,behavior:"auto"})}catch(_){window.scrollTo(0,0)}schedule()});
  addEventListener("pageshow",schedule);
  addEventListener("resize",schedule);
  
  setTimeout(clean,80);
})();
