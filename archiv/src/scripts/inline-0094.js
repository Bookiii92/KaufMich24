
(function(){
 if(window.km24CompatDate)return;
 window.km24CompatDate=function(v,style){
  if(!v)return '–';
  var locale=(window.km24Locale?window.km24Locale():'de-CH');
  try{return new Date(v).toLocaleString(locale,{dateStyle:style||'medium',timeStyle:'short'})}catch(_){}
  try{return new Intl.DateTimeFormat(locale,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(_){}
  try{return new Date(v).toLocaleString()}catch(_){return String(v)}
 };
})();
