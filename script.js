(function(){
  'use strict';
  function getConfig(){return window.SITE_CONFIG || {};}
  function clean(s){return String(s == null ? '' : s).trim();}
  function text(id,value){var el=document.getElementById(id);if(el)el.textContent=value;}
  function validHttpsUrl(raw){try{var u=new URL(raw);return u.protocol==='https:'&&!!u.hostname&&u.hostname.indexOf('.')>0;}catch(e){return false;}}
  function consent(){return localStorage.getItem('mahakal_analytics_consent')==='yes';}
  function loadGoogleTag(cfg){
    if(!cfg.googleAdsId||!/^AW-\d+$/.test(clean(cfg.googleAdsId))||cfg.analyticsConsentRequired!==false&&!consent())return;
    if(window._adsInitialized)return;window._adsInitialized=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());window.gtag('config',cfg.googleAdsId);
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(cfg.googleAdsId);document.head.appendChild(s);
  }
  function showToast(msg){var e=document.getElementById('toast');if(!e)return;e.textContent=msg;e.hidden=false;clearTimeout(window._toastTimer);window._toastTimer=setTimeout(function(){e.hidden=true;},4600);}
  function tri(v){return v===true?'YES':v===false?'NO':'NOT VERIFIED';}
  function prepareWa(cfg){
    // Prefer the operator-supplied WhatsApp redirect as-is. Do not change the query,
    // because the redirect provider determines its final WhatsApp URL and message.
    var link=clean(cfg.whatsappUrl);
    if(link){
      try{var u=new URL(link);if(u.protocol==='https:'&&u.hostname.toLowerCase()==='promediawa.co.in'&&u.pathname==='/r/electornic'&&!u.username&&!u.password)return u.href;}catch(e){}
      return null;
    }
    var num=clean(cfg.whatsappNumber);
    if(!/^\d{10,15}$/.test(num))return null;
    var msg='Hello, I would like information about '+clean(cfg.brandName||'the game')+' cricket/mini-games and account registration. Please share the game rules and virtual coin terms.';
    return 'https://wa.me/'+num+'?text='+encodeURIComponent(msg);
  }
  function verifiedDetails(cfg){return !!(clean(cfg.operatorName)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(cfg.supportEmail))&&validHttpsUrl(clean(cfg.gameWebsite))&&clean(cfg.coinRules)&&typeof cfg.coinsCanBePurchased==='boolean'&&typeof cfg.realMoneyOrPrizes==='boolean'&&typeof cfg.stakingOrWagering==='boolean'&&typeof cfg.adCertificationRequired==='boolean'&&(cfg.adCertificationRequired!==true||cfg.adCertificationObtained===true));}
  function configure(){
    var cfg=getConfig(),name=clean(cfg.brandName)||'Mahakal Play', pieces=name.split(' ');document.querySelectorAll('[data-brand]').forEach(function(el){if(el.classList.contains('brand-word')){el.textContent='';el.appendChild(document.createTextNode(name.toUpperCase().replace(/\s+\S+$/,'' )+' '));var em=document.createElement('em');em.textContent=pieces[pieces.length-1].toUpperCase();el.appendChild(em);}else{el.textContent=name;}});
    document.title=name+' | Cricket & Mini-Games';
    text('year',new Date().getFullYear());
    text('operatorName',clean(cfg.operatorName)||'Operator details pending verification');
    text('supportEmail',clean(cfg.supportEmail)||'Support email pending verification');
    text('gameWebsite',clean(cfg.gameWebsite)||'Game website pending verification');
    text('coinRulesText',clean(cfg.coinRules)||'Coin rules pending: the platform operator must disclose how coins are obtained and used before publishing ads.');
    text('coinRulesFAQ',clean(cfg.coinRules)||'Before promotion, the operator must publish accurate information on how coins are acquired, used and whether any rewards have real-world value.');
    text('purchasesValue',tri(cfg.coinsCanBePurchased));text('prizesValue',tri(cfg.realMoneyOrPrizes));text('wagerValue',tri(cfg.stakingOrWagering));
    var wa=prepareWa(cfg),ready=!!wa&&verifiedDetails(cfg);
    var banner=document.getElementById('launchNote');if(banner)banner.hidden=ready;
    document.querySelectorAll('.js-wa').forEach(function(btn){btn.disabled=!wa;btn.setAttribute('aria-label',wa?'Contact '+name+' via WhatsApp':'WhatsApp link not configured');btn.onclick=function(){if(!wa){showToast('WhatsApp contact link is not configured.');return;}var evt={event:'whatsapp_click',cta:btn.innerText.trim()};window.dataLayer=window.dataLayer||[];window.dataLayer.push(evt);
      if(window.gtag&&/^(AW-\d+)\/[\w-]+$/.test(clean(cfg.whatsappClickLabel))){window.gtag('event','conversion',{send_to:cfg.whatsappClickLabel,value:1.0,currency:'INR'});}
      window.open(wa,'_blank','noopener,noreferrer');};});
    var consentBox=document.getElementById('consentBox');
    if(consentBox){
      var needsChoice=!!clean(cfg.googleAdsId)&&cfg.analyticsConsentRequired!==false&&!localStorage.getItem('mahakal_analytics_consent');
      consentBox.hidden=!needsChoice;
      var reject=document.getElementById('consentReject'), accept=document.getElementById('consentAccept');
      reject.onclick=function(){localStorage.setItem('mahakal_analytics_consent','no');consentBox.hidden=true;};
      accept.onclick=function(){localStorage.setItem('mahakal_analytics_consent','yes');consentBox.hidden=true;loadGoogleTag(cfg);};
    }
    loadGoogleTag(cfg);
    return {ready:ready,whatsappEnabled:!!wa,detailsVerified:verifiedDetails(cfg)};
  }
  window.refreshSite=configure;window.siteReadiness=function(){var cfg=getConfig();return{ready:!!prepareWa(cfg)&&verifiedDetails(cfg),detailsVerified:verifiedDetails(cfg),whatsappEnabled:!!prepareWa(cfg)};};
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',configure);}else{configure();}
})();
