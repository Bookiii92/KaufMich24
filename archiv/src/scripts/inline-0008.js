
(function(){
 const CANON='https://www.kaufmich24.ch';
 function norm(u){
   if(!u)return u;
   try{
     let x=new URL(u,location.href);
     if(x.hostname==='kaufmich24.ch'||x.hostname==='www.kaufmich24.ch'||x.hostname.endsWith('.up.railway.app')){
       return CANON+x.pathname+x.search+x.hash;
     }
     return x.href;
   }catch(e){ return u; }
 }
 window.KMCanonicalUrl=function(u){return norm(u||location.href)};
 try{
   if(navigator.share){
     const original=navigator.share.bind(navigator);
     navigator.share=function(data){
       data=Object.assign({},data||{});
       data.url=norm(data.url||location.href);
       return original(data);
     };
   }
 }catch(e){}
 try{
   if(navigator.clipboard&&navigator.clipboard.writeText){
     const ow=navigator.clipboard.writeText.bind(navigator.clipboard);
     navigator.clipboard.writeText=function(t){
       if(typeof t==='string'){
         t=t.replace(/https?:\/\/(?:www\.)?kaufmich24\.ch/gi,CANON)
            .replace(/https?:\/\/kaufmich-web-production\.up\.railway\.app/gi,CANON);
       }
       return ow(t);
     };
   }
 }catch(e){}
})();
