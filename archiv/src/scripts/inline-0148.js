
(function(){
 if(window.__km24AvatarQuickMobileFixV2)return;window.__km24AvatarQuickMobileFixV2=true;
 document.addEventListener("click",function(e){
   try{
     if(!window.matchMedia || !window.matchMedia("(max-width:700px)").matches)return;
     if(e.target&&e.target.closest&&e.target.closest(".km24AvatarQuickInput"))return;
     var wrap=e.target&&e.target.closest&&e.target.closest(".km24AvatarQuickEdit");
     if(!wrap)return;
     var input=wrap.querySelector(".km24AvatarQuickInput[type=file]");
     if(!input)return;
     e.preventDefault();
     input.click();
   }catch(_){}
 },true);
})();
