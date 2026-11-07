
(function(){
 if(window.__km24SellerFollowV1)return;window.__km24SellerFollowV1=true;

 const C={
  de:{follow:'＋ Folgen',following:'✓ Gefolgt',followers:'Follower',login:'Anmelden zum Folgen',my:'Gefolgte Verkäufer',mySub:'Verkäufer, deren neue Inserate du automatisch mitbekommst.',empty:'Du folgst noch keinem Verkäufer.',discover:'Verkäufer entdecken',profile:'Profil ansehen',unfollow:'Entfolgen',active:'aktive Inserate',accountSub:'Neue Inserate automatisch mitbekommen'},
  fr:{follow:'＋ Suivre',following:'✓ Suivi',followers:'abonnés',login:'Se connecter pour suivre',my:'Vendeurs suivis',mySub:'Les vendeurs dont vous recevez automatiquement les nouvelles annonces.',empty:'Vous ne suivez encore aucun vendeur.',discover:'Découvrir des vendeurs',profile:'Voir le profil',unfollow:'Ne plus suivre',active:'annonces actives',accountSub:'Recevoir automatiquement les nouvelles annonces'},
  it:{follow:'＋ Segui',following:'✓ Seguito',followers:'follower',login:'Accedi per seguire',my:'Venditori seguiti',mySub:'Venditori di cui ricevi automaticamente i nuovi annunci.',empty:'Non segui ancora nessun venditore.',discover:'Scopri venditori',profile:'Vedi profilo',unfollow:'Non seguire più',active:'annunci attivi',accountSub:'Ricevi automaticamente i nuovi annunci'},
  en:{follow:'＋ Follow',following:'✓ Following',followers:'followers',login:'Sign in to follow',my:'Followed sellers',mySub:'Sellers whose new listings you receive automatically.',empty:'You are not following any sellers yet.',discover:'Discover sellers',profile:'View profile',unfollow:'Unfollow',active:'active listings',accountSub:'Automatically get new listings'}
 };
 function c(){let l='de';try{l=window.km24Language?window.km24Language():'de'}catch(_){}return C[l]||C.de}
 async function stats(sellerId){
  const cr=await db.from('seller_follow_counts').select('follower_count').eq('seller_id',sellerId).maybeSingle();
  const count=Number(cr.data?.follower_count||0);
  if(!user)return {follower_count:count,is_following:false};
  const fr=await db.from('seller_follows').select('seller_id').eq('follower_id',user.id).eq('seller_id',sellerId).maybeSingle();
  return {follower_count:count,is_following:!!fr.data}
 }
 async function setFollow(sellerId,on,sourceListingId){
  if(!user){go('#/login');return {ok:false}}
  let r;
  if(on)r=await db.from('seller_follows').insert({follower_id:user.id,seller_id:sellerId,source_listing_id:sourceListingId||null});
  else r=await db.from('seller_follows').delete().eq('follower_id',user.id).eq('seller_id',sellerId);
  if(r.error){alert(r.error.message);return {ok:false}}
  return {ok:true}
 }
 function buttonText(s){
  const x=c();
  return (s.is_following?x.following:x.follow)+(s.follower_count!=null?' · '+s.follower_count:'')
 }
 async function mountProfileFollow(sellerId){
  const h=(location.hash||'').split('?')[0];
  if(h!=='#/profile/'+sellerId)return;
  const head=document.querySelector('.formPage > .panel .head');
  if(!head||head.querySelector('[data-km24-follow-profile]'))return;
  const x=c(),own=user&&user.id===sellerId;
  if(!user){
    const box=document.createElement('div');box.className='km24FollowProfileAction';box.dataset.km24FollowProfile='1';
    box.innerHTML='<button type="button" class="btn">'+x.login+'</button>';
    box.querySelector('button').onclick=()=>go('#/login');
    head.appendChild(box);return
  }
  const s=await stats(sellerId);
  if((location.hash||'').split('?')[0]!==h)return;
  const box=document.createElement('div');box.className='km24FollowProfileAction';box.dataset.km24FollowProfile='1';
  if(own){
    box.innerHTML='<span class="km24FollowCount">👥 '+Number(s.follower_count||0)+' '+x.followers+'</span>';
  }else{
    box.innerHTML='<button type="button" class="btn '+(s.is_following?'isFollowing':'')+'">'+buttonText(s)+'</button>';
    const b=box.querySelector('button');
    b.onclick=async()=>{
      b.disabled=true;
      const r=await setFollow(sellerId,!s.is_following);
      if(!r.ok){b.disabled=false;return}
      s.is_following=!s.is_following;s.follower_count=Math.max(0,Number(s.follower_count||0)+(s.is_following?1:-1));
      b.classList.toggle('isFollowing',s.is_following);b.textContent=buttonText(s);b.disabled=false
    };
  }
  head.appendChild(box)
 }
 async function mountListingFollow(listingId){
  const h=(location.hash||'').split('?')[0];if(h!=='#/listing/'+listingId)return;
  const lr=await db.from('listings').select('seller_id').eq('id',listingId).maybeSingle();
  const sellerId=lr.data?.seller_id;if(!sellerId||(user&&user.id===sellerId))return;
  const seller=document.querySelector('.detail .side .seller'),panel=seller?.closest('.panel');if(!panel||panel.querySelector('[data-km24-follow-listing]'))return;
  const x=c(),b=document.createElement('button');b.type='button';b.className='btn km24FollowSellerBtn';b.dataset.km24FollowListing='1';;
  if(!user){b.textContent='👥 '+x.login;b.onclick=()=>go('#/login')}
  else{
    const s=await stats(sellerId);if((location.hash||'').split('?')[0]!==h)return;
    b.classList.toggle('isFollowing',s.is_following);b.textContent='👥 '+buttonText(s);
    b.onclick=async()=>{
      b.disabled=true;const r=await setFollow(sellerId,!s.is_following,listingId);if(!r.ok){b.disabled=false;return}
      s.is_following=!s.is_following;s.follower_count=Math.max(0,Number(s.follower_count||0)+(s.is_following?1:-1));
      b.classList.toggle('isFollowing',s.is_following);b.textContent='👥 '+buttonText(s);b.disabled=false
    }
  }
  
 }

 async function followingPage(){
  if(!user)return go('#/login');
  const x=c();app.innerHTML='<div class="wrap km24FollowingPage"><div class="km24FollowingHero"><div><span class="km24SectionKicker">👥 FOLLOWING</span><h1>'+x.my+'</h1><p>'+x.mySub+'</p></div><a class="btn" href="#/">'+x.discover+'</a></div><div id="km24FollowingList" class="km24FollowingList"><div class="empty">Wird geladen ...</div></div></div>';
  const fr=await db.from('seller_follows').select('seller_id,created_at').eq('follower_id',user.id).order('created_at',{ascending:false});
  if(fr.error){document.getElementById('km24FollowingList').innerHTML='<div class="empty">'+E(fr.error.message)+'</div>';return}
  const follows=fr.data||[],ids=follows.map(v=>v.seller_id),list=document.getElementById('km24FollowingList');
  if(!ids.length){list.innerHTML='<div class="km24FollowingEmpty">👥<br><br>'+x.empty+'<br><br><a class="btn primary" href="#/">'+x.discover+'</a></div>';return}
  const [pr,lr]=await Promise.all([
    db.rpc('seller_cards_public',{p_seller_ids:ids}),
    db.from('listings').select('id,seller_id').in('seller_id',ids).eq('status','active').eq('listing_intent','offer')
  ]);
  const pm={};(pr.data||[]).forEach(p=>pm[p.seller_id]=p);const ac={};(lr.data||[]).forEach(l=>ac[l.seller_id]=(ac[l.seller_id]||0)+1);
  list.innerHTML=ids.map(id=>{
    const p=pm[id]||{},name=p.business_name||p.display_name||'Verkäufer',loc=[p.postal_code,p.city,p.canton].filter(Boolean).join(' '),icon=(p.account_type==='dealer'||p.account_type==='business')?'🏪':'👤';
    return '<div class="km24FollowingCard" data-follow-card="'+E(id)+'"><div class="km24FollowingAvatar">'+icon+'</div><div><h3>'+E(name)+'</h3><div class="km24FollowingMeta">'+E(loc||'Schweiz')+' · '+Number(ac[id]||0)+' '+x.active+'</div></div><div class="km24FollowingActions"><a class="btn" href="#/profile/'+E(id)+'">'+x.profile+'</a><button type="button" class="btn" data-unfollow="'+E(id)+'">✓ '+x.unfollow+'</button></div></div>'
  }).join('');
  list.querySelectorAll('[data-unfollow]').forEach(b=>b.onclick=async()=>{
    const id=b.dataset.unfollow;if(!confirm(x.unfollow+'?'))return;b.disabled=true;
    const r=await setFollow(id,false);if(!r.ok){b.disabled=false;return}
    b.closest('[data-follow-card]')?.remove();
    if(!list.querySelector('[data-follow-card]'))list.innerHTML='<div class="km24FollowingEmpty">👥<br><br>'+x.empty+'<br><br><a class="btn primary" href="#/">'+x.discover+'</a></div>'
  })
 }
 window.km24FollowingPage=followingPage;

 function enhanceAccount(){
  const grid=document.querySelector('.km24AccountQuickGrid');if(!grid||grid.querySelector('[data-km24-following-link]'))return;
  const x=c(),a=document.createElement('a');a.href='#/following';a.dataset.km24FollowingLink='1';
  a.innerHTML='<span>👥</span><div><b>'+x.my+'</b><small>'+x.accountSub+'</small></div><i>›</i>';grid.appendChild(a)
 }

 try{
  const oldProfile=publicProfile;
  publicProfile=async function(id){await oldProfile(id);await mountProfileFollow(id)}
 }catch(_){}
 try{
  const oldDetail=detail;
  detail=async function(id){await oldDetail(id);await mountListingFollow(id)}
 }catch(_){}
 try{
  const oldMe=me;
  me=async function(){await oldMe();enhanceAccount()}
 }catch(_){}
 try{
  const oldRoute=route;
  route=function(){const h=(location.hash||'').split('?')[0];if(h==='#/following')return followingPage();return oldRoute()}
 }catch(_){}

 try{
  const oi=window.notificationIcon||notificationIcon;
  window.notificationIcon=function(t){return t==='seller_new_listing'?'🏪':oi(t)};notificationIcon=window.notificationIcon;
  const oc=window.notificationCategory||notificationCategory;
  window.notificationCategory=function(t){return t==='seller_new_listing'?'search':oc(t)};notificationCategory=window.notificationCategory
 }catch(_){}

 addEventListener('hashchange',()=>setTimeout(()=>{
  const h=(location.hash||'').split('?')[0];
  if(h==='#/following')followingPage();
  else if(h==='#/me')enhanceAccount();
  else if(h.startsWith('#/profile/'))mountProfileFollow(h.split('/')[2]);
  else if(h.startsWith('#/listing/'))mountListingFollow(h.split('/')[2])
 },120));
 setTimeout(()=>{const h=(location.hash||'').split('?')[0];if(h==='#/me')enhanceAccount();else if(h.startsWith('#/profile/'))mountProfileFollow(h.split('/')[2]);else if(h.startsWith('#/listing/'))mountListingFollow(h.split('/')[2])},250)
})();
