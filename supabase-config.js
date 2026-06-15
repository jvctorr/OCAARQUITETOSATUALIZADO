// OCA Arquitetos — Supabase config
// Chave pública do projeto. Pode ficar no front-end.
window.OCA_SUPABASE_URL = "https://bsqeypqphziivrojvfry.supabase.co";
window.OCA_SUPABASE_ANON_KEY = "sb_publishable_xKvncy8fBXaHLrYBggaUrQ_nvQLF3t6";

window.ocaSupabase = window.supabase.createClient(
  window.OCA_SUPABASE_URL,
  window.OCA_SUPABASE_ANON_KEY
);

// Login simples para o dono: ele pode digitar ADMIN no campo usuário.
window.OCA_ADMIN_EMAIL = "admin@ocaarquitetos.com";
