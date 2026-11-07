
(function(){
 if(window.km24DialogOpen)return;
 window.km24DialogOpen=function(d){
  if(!d)return;
  try{if(typeof d.showModal==='function'){d.showModal();return}}catch(_){}
  try{
   d.setAttribute('open','');
   d.style.display='block';
   d.style.position='fixed';
   d.style.zIndex='17000';
   d.style.left='50%';
   d.style.top='50%';
   d.style.transform='translate(-50%,-50%)';
   d.style.maxWidth='min(92vw,620px)';
   d.style.maxHeight='88vh';
   d.style.overflow='auto';
  }catch(_){}
 };
 window.km24DialogClose=function(d){
  if(!d)return;
  try{if(typeof d.close==='function'){d.close();return}}catch(_){}
  try{d.removeAttribute('open');d.style.display='none'}catch(_){}
  try{var e;try{e=new Event('close')}catch(_){e=document.createEvent('Event');e.initEvent('close',false,false)}d.dispatchEvent(e)}catch(_){}
 };
})();
