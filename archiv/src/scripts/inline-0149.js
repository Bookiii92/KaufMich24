
(function(){
 if(window.__km24AvatarIosHardFixV3)return;window.__km24AvatarIosHardFixV3=true;
 document.addEventListener("click",function(e){
   try{
     var wrap=e.target&&e.target.closest&&e.target.closest(".km24AvatarQuickEdit");
     if(!wrap)return;
     var input=wrap.querySelector("input.km24AvatarQuickInput[type=file]");
     if(!input)return;
     e.preventDefault();e.stopPropagation();
     input.click();
   }catch(_){}
 },true);
})();
