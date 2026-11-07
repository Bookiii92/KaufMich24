
(function(){
 if(window.__km24SearchUxV1)return;window.__km24SearchUxV1=true;
 const ids=["scat","ssub","slocation","scanton","smin","smax","scond","sseller","sprice","ssort","sverified"];
 function el(id){return document.getElementById(id)}
 function activeCount(){
   let n=0;
   ["scat","ssub","slocation","scanton","smin","smax","scond","sseller","sprice"].forEach(id=>{let x=el(id);if(x&&String(x.value||"").trim())n++});
   if(el("sverified")?.checked)n++;
   if(el("ssort")&&el("ssort").value&&el("ssort").value!=="newest")n++;
   return n
 }
 function selectedLabel(id){
   let x=el(id);if(!x)return "";
   if(id==="sverified")return x.checked?"✓ Verifiziert":"";
   if(id==="smin")return x.value?"ab CHF "+x.value:"";
   if(id==="smax")return x.value?"bis CHF "+x.value:"";
   if(id==="slocation")return x.value?"📍 "+x.value:"";
   if(id==="ssort"&&(!x.value||x.value==="newest"))return "";
   if(!x.value)return "";
   if(x.tagName==="SELECT")return x.options[x.selectedIndex]?.text||x.value;
   return x.value
 }
 function clearOne(id){
   let x=el(id);if(!x)return;
   if(id==="sverified")x.checked=false;
   else if(id==="ssort")x.value="newest";
   else x.value="";
   if(id==="scat"&&typeof marketFillSubcategories==="function")marketFillSubcategories();
   refresh();
   if(typeof runMarketplaceSearch==="function")runMarketplaceSearch()
 }
 function refresh(){
   let panel=document.querySelector(".marketSearchPanel");if(!panel)return;
   let bar=document.querySelector(".km24QuickFilterBar");
   if(bar){
     let price=el("sprice")?.value||"",ver=!!el("sverified")?.checked;
     bar.querySelectorAll("[data-km24-qf]").forEach(b=>{
       let v=b.dataset.km24Qf;
       b.classList.toggle("active",
         (v==="all"&&!price&&!ver)||
         (v==="verified"&&ver)||
         (["fixed","negotiable","auction","free"].includes(v)&&price===v)
       )
     })
   }
   let toggle=document.querySelector(".marketFilterToggle"),n=activeCount();
   if(toggle){
     let first=toggle.querySelector("span:first-child");
     if(first&&!panel.classList.contains("marketMobileOpen")){
       const html="⚙️ Filter"+(n?' <span class="km24FilterCount">'+n+"</span>":"");
       if(first.innerHTML!==html)first.innerHTML=html
     }
     let hint=toggle.querySelector(".marketFilterHint");
     const hintText=n?n+" aktiv":"optional";
     if(hint&&hint.textContent!==hintText)hint.textContent=hintText
   }
   let mount=document.querySelector(".km24ActiveFilters");
   if(mount){
     let chips=[];
     ids.forEach(id=>{let t=selectedLabel(id);if(t)chips.push([id,t])});
     const html=chips.map(([id,t])=>'<span class="km24ActiveFilter">'+E(t)+'<button type="button" data-clear-filter="'+id+'" aria-label="Filter entfernen">×</button></span>').join("");
     if(mount.innerHTML!==html)mount.innerHTML=html;
     mount.style.display=chips.length?"flex":"none";
     mount.querySelectorAll("[data-clear-filter]").forEach(b=>b.onclick=()=>clearOne(b.dataset.clearFilter))
   }
 }
 function enhance(){
   let panel=document.querySelector(".marketSearchPanel");if(!panel)return;
   let head=panel.previousElementSibling;
   if(!document.querySelector(".km24QuickFilterBar")){
     let bar=document.createElement("div");bar.className="km24QuickFilterBar";
     bar.innerHTML='<button type="button" class="km24QuickFilter" data-km24-qf="all">Alle</button><button type="button" class="km24QuickFilter" data-km24-qf="free">🎁 Gratis</button><button type="button" class="km24QuickFilter" data-km24-qf="auction">🔨 Auktion</button><button type="button" class="km24QuickFilter" data-km24-qf="fixed">🏷️ Fixpreis</button><button type="button" class="km24QuickFilter" data-km24-qf="negotiable">🤝 Verhandelbar</button>';
     (head&&head.classList.contains("marketFilterToggle")?head:panel).insertAdjacentElement("beforebegin",bar);
     bar.querySelectorAll("[data-km24-qf]").forEach(b=>b.onclick=()=>{
       let v=b.dataset.km24Qf,p=el("sprice"),verified=el("sverified");
       if(v==="all"){
         document.getElementById("resetSearch")?.click();return
       }
       if(v==="verified"){if(verified)verified.checked=!verified.checked}
       else if(p)p.value=p.value===v?"":v;
       if(v==="auction"&&el("ssort"))el("ssort").value="ending_soon";
       else if(v!=="auction"&&el("ssort")?.value==="ending_soon")el("ssort").value="newest";
       refresh();
       if(typeof runMarketplaceSearch==="function")runMarketplaceSearch()
     })
   }
   let result=document.querySelector(".searchResultHead");
   if(result&&!document.querySelector(".km24ActiveFilters")){
     let chips=document.createElement("div");chips.className="km24ActiveFilters";chips.style.display="none";
     result.insertAdjacentElement("beforebegin",chips)
   }
   ids.forEach(id=>{
     let x=el(id);if(x&&!x.dataset.km24UxBound){
       x.dataset.km24UxBound="1";x.addEventListener("change",refresh);x.addEventListener("input",()=>{if(id==="slocation"||id==="smin"||id==="smax")refresh()})
     }
   });
   refresh()
 }
 const oldRun=window.runMarketplaceSearch;
 if(typeof oldRun==="function"){
   window.runMarketplaceSearch=async function(){let r=await oldRun.apply(this,arguments);setTimeout(refresh,0);return r}
 }
 new MutationObserver(()=>setTimeout(enhance,40)).observe(document.getElementById("app")||document.body,{childList:true});
 addEventListener("hashchange",()=>setTimeout(enhance,80));
 setTimeout(enhance,180)
})();
