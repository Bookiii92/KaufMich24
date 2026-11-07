
(function(){
 if(window.__km24AvatarQuickSamsungFixV1)return;window.__km24AvatarQuickSamsungFixV1=true;
 document.addEventListener("click",function(e){
   try{
     if(!document.documentElement.classList.contains("km24SamsungSafe"))return;
     var input=e.target&&e.target.closest&&e.target.closest(".km24AvatarQuickInput");
     if(input)return;
     var label=e.target&&e.target.closest&&e.target.closest(".km24AvatarQuickEdit");
     if(!label)return;
     var f=label.querySelector("input[type=file]");
     if(!f)return;
     e.preventDefault();
     f.click();
   }catch(_){}
 },true);
})();
