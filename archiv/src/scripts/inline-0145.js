
(function(){
if(window.__km24IOSSafariCleanV7)return;
var ua=navigator.userAgent||"",ios=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
if(!ios)return;
window.__km24IOSSafariCleanV7=true;document.documentElement.classList.add("km24IOS");
var root=document.documentElement,lastHeight=0,overlaySelector=".buyOverlay,.imageLightbox,.km24PromoChoiceOverlay,.km24ReportOverlay,.km24PurposeOverlay,.km24ContactOverlay,.km24OfferOverlay,.km24PostCreatePromoOverlay";
function viewport(){try{var vv=window.visualViewport,h=Math.round(vv?vv.height:window.innerHeight);if(h>0&&h!==lastHeight){lastHeight=h;root.style.setProperty("--km24-vvh",h+"px")}var base=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);if(document.body)document.body.classList.toggle("km24KeyboardOpen",!!vv&&(base-h)>120)}catch(_){}}
function visible(el){if(!el||!el.isConnected)return false;var s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=="none"&&s.visibility!=="hidden"&&Number(s.opacity||1)!==0&&el.getAttribute("aria-hidden")!=="true"&&r.width>0&&r.height>0}
function overlays(){try{var a=document.querySelectorAll(overlaySelector),any=false;for(var i=0;i<a.length;i++){if(visible(a[i]))any=true;else a[i].style.pointerEvents="none"}if(document.body&&!any)document.body.classList.remove("km24ModalOpen")}catch(_){}}
function sync(){try{if(document.body)document.body.classList.toggle("km24CategoryRoute",(location.hash||"").indexOf("#/category/")===0)}catch(_){}viewport();overlays()}
function frame(fn){if(typeof requestAnimationFrame==="function")requestAnimationFrame(fn);else setTimeout(fn,16)}
sync();addEventListener("hashchange",function(){frame(sync)},{passive:true});addEventListener("pageshow",function(){frame(sync)},{passive:true});addEventListener("resize",viewport,{passive:true});addEventListener("orientationchange",function(){setTimeout(viewport,120)},{passive:true});
if(window.visualViewport){visualViewport.addEventListener("resize",viewport,{passive:true});visualViewport.addEventListener("scroll",viewport,{passive:true})}
document.addEventListener("click",function(){frame(overlays)},true);
})();
