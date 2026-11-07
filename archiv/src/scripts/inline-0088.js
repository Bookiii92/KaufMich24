
(function(){
  function lock(img){
    if(!img)return;
    img.style.setProperty("object-fit","contain","important");
    img.style.setProperty("object-position","50% 50%","important");
    img.style.setProperty("transform","none","important");
    img.style.setProperty("-webkit-transform","none","important");
  }
  window.km24ApplyCardFocal=function(img){lock(img)};
  function scan(root){
    if(root&&root.matches&&root.matches(".km24ListingCard .km24CardMainImg,.km24AuctionCard .km24CardMainImg,.km24ListingCard .km24CardPic>img,.km24AuctionCard .km24AuctionPic>img"))lock(root);
    if(root&&root.querySelectorAll)root.querySelectorAll(".km24ListingCard .km24CardMainImg,.km24AuctionCard .km24CardMainImg,.km24ListingCard .km24CardPic>img,.km24AuctionCard .km24AuctionPic>img").forEach(lock);
  }
  scan(document);
  document.addEventListener("click",function(e){
    if(e.target&&e.target.closest&&e.target.closest(".km24ThumbBtn"))setTimeout(function(){scan(document)},0);
  },true);
  new MutationObserver(function(ms){
    ms.forEach(function(m){m.addedNodes&&m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})});
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
