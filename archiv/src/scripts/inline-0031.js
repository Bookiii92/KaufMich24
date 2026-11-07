
(function(){
 if(window.__km24AuctionClarityV1)return;window.__km24AuctionClarityV1=true;

 function enhanceHomeCards(){
   document.querySelectorAll(".km24AuctionCard").forEach(card=>{
     if(card.dataset.km24AuctionClear==="1")return;
     card.dataset.km24AuctionClear="1";
     let meta=card.querySelector(".km24AuctionMeta small"),
         price=card.querySelector(".km24AuctionPrice"),
         timer=card.querySelector(".km24AuctionTimer");
     if(price&&!card.querySelector(".km24AuctionPriceLabel")){
       let bids=Number((meta?.textContent||"").match(/\d+/)?.[0]||0);
       let label=document.createElement("div");
       label.className="km24AuctionPriceLabel";
       label.textContent=bids>0?"Aktuelles Gebot":"Startpreis";
       price.before(label);
       if(bids===0)price.textContent=price.textContent.replace(/^ab\s+/i,"")
     }
     if(timer){
       let t=timer.textContent||"";
       timer.classList.toggle("km24Urgent",/\b\d+\s*Min\b/.test(t)&&!/Std|T\b/.test(t));
       timer.classList.toggle("km24Soon",!timer.classList.contains("km24Urgent")&&!/\b\d+\s*T\b/.test(t))
     }
   })
 }

 function enhanceDetail(){
   let box=document.querySelector(".auctionbox");if(!box)return;
   box.classList.add("km24AuctionDetailBox");
   if(!box.querySelector(".km24AuctionDetailHead")){
     let txt=box.textContent||"",m=txt.match(/(\d+)\s+Gebot/i),n=Number(m?.[1]||0);
     let head=document.createElement("div");head.className="km24AuctionDetailHead";
     head.innerHTML='<span>🔨 Auktion</span><span class="km24AuctionDetailBidCount">'+n+' Gebot'+(n===1?'':'e')+'</span>';
     box.prepend(head)
   }
   let big=box.querySelector(".big");if(big)big.classList.add("km24AuctionDetailPrice");
   let lead=[...box.querySelectorAll(".notice")].find(x=>/Du führst/i.test(x.textContent||""));
   if(lead)lead.classList.add("km24LeadingNotice");
   let form=document.getElementById("bidf");
   if(form&&!box.querySelector(".km24BidPrompt")){
     let input=form.querySelector("#bid"),min=input?.getAttribute("min")||input?.value||"";
     let p=document.createElement("div");p.className="km24BidPrompt";
     p.innerHTML='<b>Dein Gebot</b><small>'+ (min?'Mindestens CHF '+E(min):'Betrag in CHF') +'</small>';
     form.before(p);
     let btn=form.querySelector(".btn.primary");
     if(btn&&/^Bieten$/i.test((btn.textContent||"").trim()))btn.textContent="Jetzt bieten"
   }
   let cd=document.getElementById("countdown");
   if(cd){
     let t=cd.textContent||"",m=t.match(/Restzeit:\s*(\d+)T\s*(\d+)Std\s*(\d+)Min/i);
     if(m){
       let mins=Number(m[1])*1440+Number(m[2])*60+Number(m[3]);
       cd.classList.toggle("km24UrgentCountdown",mins<60)
     }
   }
 }

 function run(){enhanceHomeCards();enhanceDetail()}
 let app=document.getElementById("app");
 if(app)new MutationObserver(()=>setTimeout(run,35)).observe(app,{childList:true,subtree:true,characterData:true});
 addEventListener("hashchange",()=>setTimeout(run,80));
 setInterval(()=>{let cd=document.getElementById("countdown");if(cd)enhanceDetail()},1000);
 setTimeout(run,160)
})();
