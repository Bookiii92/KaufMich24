
(function(){
 const ids=["attachments","eattachments"];
 const types={mp4:1,mov:1,webm:1,pdf:1,doc:1,docx:1,xls:1,xlsx:1,txt:1};
 document.addEventListener("change",function(event){
  const input=event.target;
  if(!input||!ids.includes(input.id))return;
  const files=Array.from(input.files||[]),el=document.getElementById(input.id==="attachments"?"attachmentMsg":"eattachmentMsg");
  if(!el)return;
  if(!files.length){el.textContent="";return;}
  const allowedMime=["video/mp4","video/webm","video/quicktime","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/plain"];
  const invalid=files.filter(f=>!types[(f.name.split(".").pop()||"").toLowerCase()]&&!allowedMime.includes(f.type));
  const big=files.filter(f=>f.size>52428800);
  const notes=[];
  if(files.length>4)notes.push("Maximal 4 Dateien möglich.");
  if(big.length)notes.push(big.map(f=>f.name+" ist "+(f.size/1048576).toFixed(1)+" MB gross (maximal 50 MB).").join(" "));
  if(invalid.length)notes.push("Nicht unterstützte Datei: "+invalid.map(f=>f.name).join(", "));
  el.textContent=notes.length?notes.join(" "):("✓ "+files.length+" Datei(en) ausgewählt: "+files.map(f=>f.name+" ("+(f.size/1048576).toFixed(1)+" MB)").join(", ")+". Upload beim "+(input.id==="attachments"?"Veröffentlichen":"Speichern")+".");
  el.style.color=notes.length?"#ffb4ab":"#47d6a5";
  el.setAttribute("role","status");el.setAttribute("aria-live","polite");
 },true);
})();
