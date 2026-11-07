
(function(){
  function enhanceGallery(){
    document.querySelectorAll('.gallery').forEach(function(gallery){
      if(gallery.dataset.km24GalleryEnhanced==='1') return;
      var thumbs=Array.from(gallery.querySelectorAll('.thumbs .thumb'));
      if(thumbs.length<2) return;

      var main=gallery.querySelector('.mainpic');
      if(!main) return;

      gallery.dataset.km24GalleryEnhanced='1';
      gallery.classList.add('km24MultiGallery');

      var current=0;
      var count=document.createElement('div');
      count.className='km24GalleryCount';

      var prev=document.createElement('button');
      prev.type='button';
      prev.className='km24GalleryNav km24GalleryPrev';
      prev.setAttribute('aria-label','Vorheriges Bild');
      prev.textContent='‹';

      var next=document.createElement('button');
      next.type='button';
      next.className='km24GalleryNav km24GalleryNext';
      next.setAttribute('aria-label','Nächstes Bild');
      next.textContent='›';

      var hint=document.createElement('div');
      hint.className='km24GalleryHint';
      hint.textContent=thumbs.length+' Bilder · antippen oder wischen';

      function show(index){
        current=(index+thumbs.length)%thumbs.length;
        var src=thumbs[current].getAttribute('src');
        var img=main.querySelector('img');
        if(img) img.src=src;
        else {
          img=document.createElement('img');
          img.style.cssText='object-fit:contain!important;object-position:center!important';
          img.src=src;
          main.insertBefore(img,main.firstChild);
        }
        main.onclick=function(e){
          if(e.target.closest && e.target.closest('.km24GalleryNav')) return;
          if(typeof window.openImageLightbox==='function') window.openImageLightbox(src);
        };
        thumbs.forEach(function(t,i){t.classList.toggle('km24ActiveThumb',i===current)});
        count.textContent=(current+1)+' / '+thumbs.length;
      }

      thumbs.forEach(function(t,i){
        t.onclick=null;
        t.removeAttribute('onclick');
        t.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(i)});
      });
      prev.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(current-1)});
      next.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(current+1)});

      var startX=null;
      main.addEventListener('pointerdown',function(e){startX=e.clientX});
      main.addEventListener('pointerup',function(e){
        if(startX===null)return;
        var dx=e.clientX-startX;startX=null;
        if(Math.abs(dx)>45) show(current+(dx<0?1:-1));
      });

      main.appendChild(prev);
      main.appendChild(next);
      main.appendChild(count);

      var thumbsWrap=gallery.querySelector('.thumbs');
      if(thumbsWrap) thumbsWrap.insertAdjacentElement('afterend',hint);

      show(0);
    });
  }

  var app=document.getElementById('app');
  if(app){
    new MutationObserver(enhanceGallery).observe(app,{childList:true,subtree:true});
  }
  enhanceGallery();
})();
