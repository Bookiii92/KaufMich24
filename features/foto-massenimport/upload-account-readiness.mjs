// Display-only account prerequisites; the database RLS remains authoritative.
// Never trust these browser checks for authorization.
export function inspectBusinessUploadReadiness(authUser, profile){
  const missing=[];
  if(!authUser?.id || !profile || profile.id!==authUser.id)
    return {ready:false,missing:["Bitte erneut anmelden."]};
  if(!["business","dealer"].includes(profile.account_type))
    missing.push("Firmen- oder Händlerkonto erforderlich");
  if(!authUser.email_confirmed_at)missing.push("E-Mail-Adresse bestätigen");
  if(!/^\+[1-9][0-9]{7,14}$/.test(String(profile.phone||"")))
    missing.push("Telefonnummer im internationalen Format eintragen");
  if(!String(profile.street_address||"").trim())missing.push("Strasse und Hausnummer ergänzen");
  if(!String(profile.postal_code||"").trim())missing.push("Postleitzahl ergänzen");
  if(!String(profile.city||"").trim())missing.push("Ort ergänzen");
  if(!profile.address_confirmed_at)missing.push("Adresse bestätigen");
  return {ready:missing.length===0,missing};
}
