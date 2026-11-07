
(function(){
  if(window.__km24EgressOptV1)return;
  window.__km24EgressOptV1=true;

  function tuneImageMarkup(s){
    if(typeof s!=="string")return s;
    if(s.indexOf("listing-images")<0 && s.indexOf("km24CardMainImg")<0 && s.indexOf("km24ConvThumb")<0 && s.indexOf("km24ChatListingThumb")<0)return s;
    return s.replace(/<img(?![^>]*\bloading=)/gi,'<img loading="lazy" decoding="async"');
  }

  try{
    var d=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");
    if(d&&d.get&&d.set){
      Object.defineProperty(Element.prototype,"innerHTML",{
        configurable:true,
        enumerable:d.enumerable,
        get:d.get,
        set:function(v){return d.set.call(this,tuneImageMarkup(v))}
      });
    }
    var ia=Element.prototype.insertAdjacentHTML;
    if(ia)Element.prototype.insertAdjacentHTML=function(pos,text){return ia.call(this,pos,tuneImageMarkup(text))};
  }catch(_){}

  try{
    var sd=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,"src");
    if(sd&&sd.get&&sd.set){
      Object.defineProperty(HTMLImageElement.prototype,"src",{
        configurable:true,
        enumerable:sd.enumerable,
        get:sd.get,
        set:function(v){
          try{
            if(typeof v==="string"&&v.indexOf("/listing-images/")>=0){
              if(!this.hasAttribute("loading"))this.setAttribute("loading","lazy");
              if(!this.hasAttribute("decoding"))this.setAttribute("decoding","async");
            }
          }catch(_){}
          return sd.set.call(this,v);
        }
      });
    }
  }catch(_){}

  window.km24CompressUploadImage=async function(file){
    try{
      if(!file||!file.type||file.type.indexOf("image/")!==0||/gif|svg/i.test(file.type)||file.size<350*1024)return file;
      var source=null,objectUrl="";
      try{
        if(window.createImageBitmap)source=await createImageBitmap(file,{imageOrientation:"from-image"});
      }catch(_){}
      if(!source){
        objectUrl=URL.createObjectURL(file);
        source=await new Promise(function(resolve,reject){
          var im=new Image();
          im.onload=function(){resolve(im)};
          im.onerror=reject;
          im.src=objectUrl;
        });
      }
      var w=source.width||source.naturalWidth||0,h=source.height||source.naturalHeight||0;
      if(!w||!h){if(objectUrl)URL.revokeObjectURL(objectUrl);return file}
      var scale=Math.min(1,1600/Math.max(w,h));
      var c=document.createElement("canvas");
      c.width=Math.max(1,Math.round(w*scale));
      c.height=Math.max(1,Math.round(h*scale));
      var ctx=c.getContext("2d");
      if(!ctx){if(objectUrl)URL.revokeObjectURL(objectUrl);return file}
      ctx.drawImage(source,0,0,c.width,c.height);
      try{if(source.close)source.close()}catch(_){}
      if(objectUrl)URL.revokeObjectURL(objectUrl);
      var blob=await new Promise(function(resolve){c.toBlob(resolve,"image/webp",0.76)});
      var ext="webp";
      if(!blob){
        blob=await new Promise(function(resolve){c.toBlob(resolve,"image/jpeg",0.78)});
        ext="jpg";
      }
      if(!blob||blob.size>=file.size*0.92)return file;
      var base=(file.name||"bild").replace(/\.[^.]+$/,"")||"bild";
      return new File([blob],base+"."+ext,{type:blob.type,lastModified:Date.now()});
    }catch(_){return file}
  };
})();
