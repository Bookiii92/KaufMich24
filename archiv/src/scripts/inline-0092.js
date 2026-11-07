
(function(){
 if(window.km24RequestSubmit)return;
 window.km24RequestSubmit=function(form){
  if(!form)return;
  try{if(typeof form.requestSubmit==='function'){form.requestSubmit();return}}catch(_){}
  try{
   if(typeof form.checkValidity==='function'&&!form.checkValidity()){
    try{if(typeof form.reportValidity==='function')form.reportValidity()}catch(_){}
    return;
   }
   var ev;
   try{ev=new Event('submit',{bubbles:true,cancelable:true})}
   catch(_){ev=document.createEvent('Event');ev.initEvent('submit',true,true)}
   var allowed=form.dispatchEvent(ev);
   if(allowed&&!ev.defaultPrevented){
    try{HTMLFormElement.prototype.submit.call(form)}catch(_){}
   }
  }catch(_){}
 };
})();
