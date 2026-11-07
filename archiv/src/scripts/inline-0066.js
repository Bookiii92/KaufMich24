
(function(){
  if(window.__km24VerificationUxV2)return;
  window.__km24VerificationUxV2=true;
  let timer=0;

  function sizeText(bytes){
    const n=Number(bytes||0);
    if(!n)return "";
    if(n<1024*1024)return Math.max(1,Math.round(n/1024))+" KB";
    return (n/1024/1024).toFixed(n<10*1024*1024?1:0)+" MB";
  }

  function enhanceInput(id,title,emptyText){
    const input=document.getElementById(id);
    if(!input||input.dataset.km24Enhanced==="1")return;
    const label=input.closest("label");
    if(!label)return;
    input.dataset.km24Enhanced="1";
    input.classList.add("km24DocInput");
    input.setAttribute("accept","image/*,.pdf,application/pdf");
    label.classList.add("km24DocField");

    const picker=document.createElement("span");
    picker.className="km24DocPicker";
    picker.innerHTML=
      '<span class="km24DocPickerIcon" aria-hidden="true">📷</span>'+
      '<span class="km24DocPickerText">'+
        '<span class="km24DocPickerTitle">'+title+'</span>'+
        '<span class="km24DocStatus">'+emptyText+'</span>'+
      '</span>';
    label.insertBefore(picker,input);

    const update=function(){
      const file=input.files&&input.files[0];
      label.classList.toggle("hasFile",!!file);
      const status=picker.querySelector(".km24DocStatus");
      if(!status)return;
      if(file){
        const n=String(file.name||"Datei").replace(/[<>]/g,"");
        status.textContent="✓ "+n+(file.size?" · "+sizeText(file.size):"");
      }else{
        status.textContent=emptyText;
      }
    };
    input.addEventListener("change",update);
    update();
  }

  function syncBackHint(){
    const doc=document.getElementById("docType");
    const back=document.getElementById("idBack");
    if(!doc||!back)return;
    const label=back.closest("label");
    const status=label&&label.querySelector(".km24DocStatus");
    if(!status||back.files?.length)return;
    status.textContent=doc.value==="passport"
      ?"Beim Reisepass nicht erforderlich"
      :"Foto oder Datei der Rückseite auswählen";
  }

  function run(){
    const active=(location.hash||"").startsWith("#/verification");
    document.body.classList.toggle("km24VerificationRoute",active);
    if(!active)return;
    const root=document.querySelector(".formPage");
    if(root)root.classList.add("km24VerificationV2");

    enhanceInput("idFront","Vorderseite / Datenseite auswählen","Foto oder Datei auswählen · max. 20 MB");
    enhanceInput("idBack","Rückseite auswählen","Foto oder Datei der Rückseite auswählen");

    const doc=document.getElementById("docType");
    if(doc&&!doc.dataset.km24BackSync){
      doc.dataset.km24BackSync="1";
      doc.addEventListener("change",syncBackHint);
    }
    syncBackHint();

  }

  window.addEventListener("hashchange",function(){setTimeout(run,30)});
  const root=document.getElementById("app")||document.body;
  new MutationObserver(function(){
    clearTimeout(timer);
    timer=setTimeout(run,45);
  }).observe(root,{childList:true,subtree:true});
  setTimeout(run,50);
})();
