// KaufMich24 SPA bridge. Integration review only, not yet installed in the
// 2.2 MB public frontend snapshot. No publication of listings.
export const PHOTO_IMPORT_ROUTE = "#/foto-massenimport";
export function eligibleFirmAccount(user,profile) {
  return Boolean(user?.id && profile?.id === user.id &&
    (profile.account_type === "dealer" || profile.account_type === "business"));
}
export async function openPhotoBulkRoute({
  root,client,user,profile,navigate,
  isRouteActive=()=>true,
  loadPanel=()=>import("./secure-drafts-page.mjs")
}) {
  if(!root || typeof root.replaceChildren!=="function")throw new Error("App-Container fehlt.");
  if(!client || typeof client.auth?.getUser!=="function")throw new Error("KaufMich24-Datenbankverbindung fehlt.");
  if(!user?.id){
    navigate?.("#/login");
    return {mounted:false,reason:"login_required"};
  }
  if(!eligibleFirmAccount(user,profile)){
    navigate?.("#/business");
    return {mounted:false,reason:"business_required"};
  }
  const verified=await client.auth.getUser();
  if(verified.error || verified.data?.user?.id!==user.id){
    navigate?.("#/login");
    return {mounted:false,reason:"session_expired"};
  }
  if(!isRouteActive())return {mounted:false,reason:"route_changed"};
  const {mountPhotoDraftPanel}=await loadPanel();
  if(typeof mountPhotoDraftPanel!=="function")throw new Error("Foto-Import-Modul fehlt.");
  if(!isRouteActive())return {mounted:false,reason:"route_changed"};
  await mountPhotoDraftPanel({root,supabaseClient:client});
  return {mounted:true,reason:null};
}
