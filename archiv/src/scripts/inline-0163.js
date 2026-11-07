
(function(){
  function redirectEndedCampaign(){
    try {if(/^#\/giveaway(?:[/?]|$)/i.test(location.hash||'')){location.replace(location.pathname+location.search+'#/');}}catch(_){}
  }
  redirectEndedCampaign();
  addEventListener('hashchange',redirectEndedCampaign);
})();
