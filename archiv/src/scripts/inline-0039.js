
(function(){
  if(window.__km24NotificationServicesV1)return;
  window.__km24NotificationServicesV1=true;

  const oldIcon=window.notificationIcon;
  window.notificationIcon=function(t){
    const m={
      service_message:'💬',
      service_quote:'🧾',
      service_quote_accepted:'✅',
      service_quote_declined:'↩️',
      service_match:'🛠️',
      service_completed:'✓',
      service_review_available:'⭐',
      service_review:'⭐'
    };
    return m[t]||(typeof oldIcon==='function'?oldIcon(t):'🔔')
  };

  const oldCategory=window.notificationCategory;
  window.notificationCategory=function(t){
    if(t==='service_message')return 'messages';
    if(['service_quote','service_quote_accepted','service_quote_declined'].includes(t))return 'offers';
    if(t==='service_match')return 'search';
    if(t==='service_completed')return 'sales';
    if(['service_review_available','service_review'].includes(t))return 'other';
    return typeof oldCategory==='function'?oldCategory(t):'other'
  };

  const oldTarget=window.notificationTarget;
  window.notificationTarget=function(n){
    if(n&&n.service_thread_id)return '#/services/thread/'+n.service_thread_id;
    if(n&&n.service_post_id)return '#/services/post/'+n.service_post_id;
    return typeof oldTarget==='function'?oldTarget(n):'#/me'
  };

  document.documentElement.dataset.km24ProductionSource='supabase-edge-kaufmich-app';
  window.__KM24_PRODUCTION_SOURCE__='supabase-edge:kaufmich-app';
})();
