
(function(){
  let avatarBusy=false,scheduled=false,lastRoute='';

  function initials(name){
    let s=String(name||'KaufMich24').trim();
    if(!s)return 'KM';
    let parts=s.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0]||'K')+(parts.length>1?(parts[parts.length-1]?.[0]||''):'')).toUpperCase();
  }

  function avatarEl(url,name,size){
    let d=document.createElement('div');
    d.className='km24Avatar '+(size||'');
    d.setAttribute('aria-label','Profilbild');
    if(url){
      let img=document.createElement('img');
      img.src=url;
      img.alt='Profilbild von '+String(name||'Nutzer');
      img.referrerPolicy='no-referrer';
      img.onerror=function(){d.innerHTML='';d.textContent=initials(name)};
      d.appendChild(img);
    }else d.textContent=initials(name);
    return d;
  }

  async function getOwnProfile(){
    if(typeof db==='undefined'||typeof user==='undefined'||!user)return null;
    let r=await db.from('profiles').select('id,display_name,business_name,avatar_url').eq('id',user.id).maybeSingle();
    return r.data||null;
  }

  async function removeOwnAvatarFiles(keepPath){
    let list=await db.storage.from('profile-avatars').list(user.id,{limit:100});
    if(list.error)throw list.error;
    let paths=(list.data||[]).filter(x=>x.id).map(x=>user.id+'/'+x.name).filter(x=>x!==keepPath);
    if(paths.length){
      let rm=await db.storage.from('profile-avatars').remove(paths);
      if(rm.error)throw rm.error;
    }
  }

  async function uploadAvatar(file){
    if(!file)throw new Error('Bitte zuerst ein Bild auswählen.');
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Bitte JPG, PNG oder WebP verwenden.');
    if(file.size>5*1024*1024)throw new Error('Das Profilbild darf maximal 5 MB gross sein.');

    let ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    let path=user.id+'/'+(window.crypto&&typeof crypto.randomUUID==='function'?crypto.randomUUID():('km24_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)))+'.'+ext;
    let up=await db.storage.from('profile-avatars').upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
    if(up.error)throw up.error;

    let pub=db.storage.from('profile-avatars').getPublicUrl(path);
    let url=pub?.data?.publicUrl;
    if(!url){await db.storage.from('profile-avatars').remove([path]);throw new Error('Profilbild-URL konnte nicht erstellt werden.');}

    let save=await db.from('profiles').update({avatar_url:url,updated_at:new Date().toISOString()}).eq('id',user.id);
    if(save.error){await db.storage.from('profile-avatars').remove([path]);throw save.error;}
    try{await removeOwnAvatarFiles(path)}catch(_){}
    return url;
  }
  window.km24UploadAvatar=uploadAvatar;

  async function accountAvatar(){
    if(!location.hash.startsWith('#/me'))return;
    let head=document.querySelector('.accountHead');
    if(!head||document.getElementById('km24AvatarAccountPanel')||typeof user==='undefined'||!user)return;

    let p=await getOwnProfile();
    if(!p||!location.hash.startsWith('#/me'))return;
    let name=p.business_name||p.display_name||'Mein Konto';

    let identity=head.querySelector(':scope > div:first-child');
    if(identity&&!identity.querySelector('.km24Avatar')){
      let wrap=document.createElement('div');
      wrap.className='km24AccountIdentity';
      identity.parentNode.insertBefore(wrap,identity);
      let quick=document.createElement('label');
      quick.className='km24AvatarQuickEdit';
      quick.setAttribute('aria-label','Profilbild ändern');
      quick.title='Profilbild ändern';
      let quickAvatar=avatarEl(p.avatar_url,name,'sm');
      let quickInput=document.createElement('input');
      quickInput.type='file';
      quickInput.accept='image/jpeg,image/png,image/webp';
      quickInput.className='km24AvatarQuickInput';
      let quickBadge=document.createElement('span');
      quickBadge.className='km24AvatarQuickBadge';
      quickBadge.textContent='📷';
      quick.appendChild(quickAvatar);
      quick.appendChild(quickInput);
      quick.appendChild(quickBadge);
      wrap.appendChild(quick);
      wrap.appendChild(identity);
      quickInput.onchange=async function(){
        let file=quickInput.files&&quickInput.files[0];
        if(!file||avatarBusy)return;
        avatarBusy=true;quick.classList.add('busy');quickBadge.textContent='…';
        try{
          await uploadAvatar(file);
          quickBadge.textContent='✓';
          if(typeof loadProfile==='function')await loadProfile();
          setTimeout(function(){if(typeof me==='function')me()},250);
        }catch(e){
          quickBadge.textContent='!';
          alert('Profilbild konnte nicht gespeichert werden: '+String(e.message||e));
          avatarBusy=false;quick.classList.remove('busy');quickInput.value='';
          return;
        }
        avatarBusy=false;quick.classList.remove('busy');
      };
    }

    let section=document.createElement('section');
    section.className='section';
    section.id='km24AvatarAccountPanel';
    section.innerHTML='<div class="panel"><h2>Profilbild <small class="mut">(optional)</small></h2><div class="km24AvatarPanelBody"><div id="km24AvatarPreview"></div><div><p class="mut" style="margin-top:0">Dein Profilbild ist öffentlich sichtbar, z. B. auf deinem Verkäuferprofil und bei deinen Inseraten. Ein quadratisches Bild funktioniert am besten.</p><label><b>Bild auswählen</b><input class="km24AvatarFile" id="km24AvatarFile" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="km24AvatarActions"><button class="btn primary" id="km24AvatarSave" disabled>Profilbild speichern</button>'+(p.avatar_url?'<button class="btn" id="km24AvatarRemove">Profilbild entfernen</button>':'')+'</div><div id="km24AvatarMsg"></div><small class="mut">JPG, PNG oder WebP · maximal 5 MB</small></div></div></div>';
    let slot=document.getElementById('km24AvatarSettingsSlot');if(slot)slot.appendChild(section);else head.insertAdjacentElement('afterend',section);

    document.getElementById('km24AvatarPreview').appendChild(avatarEl(p.avatar_url,name,'lg'));
    let input=document.getElementById('km24AvatarFile'),save=document.getElementById('km24AvatarSave'),msg=document.getElementById('km24AvatarMsg');
    input.onchange=function(){
      save.disabled=!input.files[0];
      if(input.files[0]){
        let u=URL.createObjectURL(input.files[0]);
        let box=document.getElementById('km24AvatarPreview');box.innerHTML='';box.appendChild(avatarEl(u,name,'lg'));
      }
    };
    save.onclick=async function(){
      if(avatarBusy)return;avatarBusy=true;save.disabled=true;msg.innerHTML='<div class="notice">Profilbild wird gespeichert ...</div>';
      try{
        await uploadAvatar(input.files[0]);
        if(typeof loadProfile==='function')await loadProfile();
        msg.innerHTML='<div class="notice">✓ Profilbild gespeichert.</div>';
        setTimeout(function(){if(typeof me==='function')me()},350);
      }catch(e){msg.innerHTML='<div class="notice err">'+String(e.message||e)+'</div>';save.disabled=false}
      finally{avatarBusy=false}
    };
    let rem=document.getElementById('km24AvatarRemove');
    if(rem)rem.onclick=async function(){
      if(avatarBusy||!confirm('Profilbild wirklich entfernen?'))return;avatarBusy=true;rem.disabled=true;
      try{
        let r=await db.from('profiles').update({avatar_url:null,updated_at:new Date().toISOString()}).eq('id',user.id);
        if(r.error)throw r.error;
        try{await removeOwnAvatarFiles()}catch(_){}
        if(typeof loadProfile==='function')await loadProfile();
        if(typeof me==='function')me();
      }catch(e){alert(e.message||e);rem.disabled=false}
      finally{avatarBusy=false}
    };
  }

  async function publicProfileAvatar(){
    let m=location.hash.match(/^#\/profile\/([0-9a-f-]{36})/i);
    if(!m)return;
    let head=document.querySelector('.formPage > .panel .head');
    if(!head||head.dataset.km24Avatar==='1')return;
    head.dataset.km24Avatar='loading';
    let r=await db.rpc('seller_profile_public',{p_seller_id:m[1]});
    let p=(r.data||[])[0];
    if(!p||!location.hash.startsWith('#/profile/'+m[1])){head.dataset.km24Avatar='';return}
    let name=p.business_name||p.display_name||'Profil';
    head.insertBefore(avatarEl(p.avatar_url,name,'lg'),head.firstChild);
    head.dataset.km24Avatar='1';
  }

  async function listingSellerAvatar(){
    let m=location.hash.match(/^#\/listing\/([0-9a-f-]{36})/i);
    if(!m)return;
    let seller=document.querySelector('.detail .side .panel .seller');
    if(!seller||seller.dataset.km24Avatar==='1'||seller.dataset.km24Avatar==='loading')return;
    let currentPanel=seller.closest('.panel');
    if(currentPanel&&currentPanel.querySelector('.km24SellerAvatarRow')){seller.dataset.km24Avatar='1';return}
    seller.dataset.km24Avatar='loading';
    let lr=await db.from('listings').select('seller_id').eq('id',m[1]).maybeSingle();
    if(!lr.data){seller.dataset.km24Avatar='';return}
    let r=await db.rpc('seller_profile_public',{p_seller_id:lr.data.seller_id});
    let p=(r.data||[])[0];
    if(!p||!location.hash.startsWith('#/listing/'+m[1])){seller.dataset.km24Avatar='';return}
    let panel=seller.closest('.panel');
    let small=panel&&panel.querySelector('small.mut');
    let row=document.createElement('div');row.className='km24SellerAvatarRow';
    row.appendChild(avatarEl(p.avatar_url,p.display_name||'Verkäufer','sm'));
    seller.parentNode.insertBefore(row,seller);
    row.appendChild(seller);
    if(small)row.insertBefore(small,seller);
    seller.dataset.km24Avatar='1';
  }

  async function run(){
    scheduled=false;
    if(typeof db==='undefined')return;
    try{
      await accountAvatar();
      await publicProfileAvatar();
      await listingSellerAvatar();
    }catch(e){console.warn('KM24 avatar UI',e)}
  }
  function schedule(){if(scheduled)return;scheduled=true;setTimeout(run,40)}
  let app=document.getElementById('app');
  if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  window.addEventListener('hashchange',schedule);
  schedule();
})();
