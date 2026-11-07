
(function(){
  if(window.__km24FeesBoxContrastRuntimeV3)return;
  window.__km24FeesBoxContrastRuntimeV3=true;
  var css=`
html[data-km24-theme="light"] .km24FeesPage .notice,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline,
html[data-km24-theme="light"] #km24LaunchDeadlineFees{
  opacity:1!important;filter:none!important;mix-blend-mode:normal!important;
  background:#e8f5ed!important;background-image:none!important;
  border-color:#a9d3ba!important;color:#1f2937!important;
  -webkit-text-fill-color:#1f2937!important;text-shadow:none!important
}
html[data-km24-theme="light"] .km24FeesPage .notice *,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline *,
html[data-km24-theme="light"] #km24LaunchDeadlineFees *{
  opacity:1!important;filter:none!important;mix-blend-mode:normal!important;text-shadow:none!important
}
html[data-km24-theme="light"] .km24FeesPage .notice p,
html[data-km24-theme="light"] .km24FeesPage .notice span,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline p,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline span,
html[data-km24-theme="light"] #km24LaunchDeadlineFees p,
html[data-km24-theme="light"] #km24LaunchDeadlineFees span{
  color:#475569!important;-webkit-text-fill-color:#475569!important
}
html[data-km24-theme="light"] .km24FeesPage .notice b,
html[data-km24-theme="light"] .km24FeesPage .notice strong,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline b,
html[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline strong,
html[data-km24-theme="light"] #km24LaunchDeadlineFees b,
html[data-km24-theme="light"] #km24LaunchDeadlineFees strong{
  color:#111827!important;-webkit-text-fill-color:#111827!important
}

html[data-km24-theme="light"] .km24FounderStatus.candidate,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate{
  opacity:1!important;filter:none!important;mix-blend-mode:normal!important;
  background:#f7e7da!important;background-image:none!important;
  border-color:#e2b995!important;color:#1f2937!important;
  -webkit-text-fill-color:#1f2937!important;text-shadow:none!important
}
html[data-km24-theme="light"] .km24FounderStatus.candidate *,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate *{
  opacity:1!important;filter:none!important;mix-blend-mode:normal!important;text-shadow:none!important
}
html[data-km24-theme="light"] .km24FounderStatus.candidate span,
html[data-km24-theme="light"] .km24FounderStatus.candidate p,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate span,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate p{
  color:#6b4f3a!important;-webkit-text-fill-color:#6b4f3a!important
}
html[data-km24-theme="light"] .km24FounderStatus.candidate b,
html[data-km24-theme="light"] .km24FounderStatus.candidate strong,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate b,
html[data-km24-theme="light"] .km24FounderFeeCard .km24FounderStatus.candidate strong{
  color:#111827!important;-webkit-text-fill-color:#111827!important
}
@supports (-webkit-touch-callout:none){
  html.km24IOS[data-km24-theme="light"] .km24FeesPage .notice,
  html.km24IOS[data-km24-theme="light"] .km24FeesPage .notice *,
  html.km24IOS[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline,
  html.km24IOS[data-km24-theme="light"] .km24FeesPage .km24LaunchDeadline *,
  html.km24IOS[data-km24-theme="light"] #km24LaunchDeadlineFees,
  html.km24IOS[data-km24-theme="light"] #km24LaunchDeadlineFees *,
  html.km24IOS[data-km24-theme="light"] .km24FounderStatus.candidate,
  html.km24IOS[data-km24-theme="light"] .km24FounderStatus.candidate *{
    opacity:1!important;text-shadow:none!important
  }
}
`;
  var style=document.createElement('style');
  style.id='km24-fees-box-contrast-v3-style';
  style.textContent=css;
  function last(){
    try{
      var s=document.getElementById('km24-fees-box-contrast-v3-style');
      if(!s){s=style;document.head.appendChild(s)}
      else if(document.head.lastElementChild!==s)document.head.appendChild(s);
    }catch(_){}
  }
  var timer=0;function queue(){clearTimeout(timer);timer=setTimeout(last,20)}
  last();
  try{new MutationObserver(queue).observe(document.head,{childList:true})}catch(_){}
  try{var app=document.getElementById('app');if(app)new MutationObserver(queue).observe(app,{childList:true,subtree:true})}catch(_){}
  try{new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['data-km24-theme']})}catch(_){}
  addEventListener('hashchange',queue,{passive:true});
  addEventListener('pageshow',queue,{passive:true});
  setTimeout(last,80);setTimeout(last,350);
})();
