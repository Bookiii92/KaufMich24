
(function(){
  if(window.__km24IOSAuctionDaysFixV1)return;
  var ua=navigator.userAgent||"";
  var ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  if(!ios)return;
  window.__km24IOSAuctionDaysFixV1=true;

  function currentDay(sel){
    var m=/^d(\d{1,2})$/.exec(String(sel.value||""));
    var n=m?Number(m[1]):Number(sel.value)||7;
    return Math.max(1,Math.min(14,n));
  }
  function text(n){return n===1?"1 Tag":n+" Tage"}
  function enhance(id){
    var sel=document.getElementById(id);
    if(!sel||sel.dataset.km24IosDaysFix==="1"||sel.disabled)return;
    sel.dataset.km24IosDaysFix="1";
    sel.classList.add("km24IosAuctionDaysNative");

    var wrap=document.createElement("div");
    wrap.className="km24IosAuctionDaysWrap";
    wrap.setAttribute("role","group");
    wrap.setAttribute("aria-label","Auktionsdauer ändern");
    var minus=document.createElement("button");
    minus.type="button";
    minus.className="km24IosAuctionDayBtn";
    minus.setAttribute("aria-label","Einen Tag weniger");
    minus.textContent="−";
    var value=document.createElement("div");
    value.className="km24IosAuctionDayValue";
    var plus=document.createElement("button");
    plus.type="button";
    plus.className="km24IosAuctionDayBtn";
    plus.setAttribute("aria-label","Einen Tag mehr");
    plus.textContent="+";
    wrap.append(minus,value,plus);
    sel.insertAdjacentElement("afterend",wrap);

    function render(){
      var n=currentDay(sel);
      value.textContent=text(n);
      minus.disabled=n<=1;
      plus.disabled=n>=14;
    }
    function setDay(n){
      n=Math.max(1,Math.min(14,n));
      sel.value="d"+n;
      sel.dispatchEvent(new Event("input",{bubbles:true}));
      sel.dispatchEvent(new Event("change",{bubbles:true}));
      render();
    }
    minus.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();setDay(currentDay(sel)-1)});
    plus.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();setDay(currentDay(sel)+1)});
    sel.addEventListener("change",render);
    render();
  }
  function install(){enhance("days");enhance("edays")}
  addEventListener("hashchange",function(){setTimeout(install,20)});
  addEventListener("pageshow",function(){setTimeout(install,20)});
  document.addEventListener("click",function(){setTimeout(install,0)},true);
  setTimeout(install,0);
  setTimeout(install,250);
})();
