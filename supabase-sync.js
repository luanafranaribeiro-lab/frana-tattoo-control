// Frana Tattoo Control — camada de sincronização Supabase
// Mantém o localStorage como cache local e sincroniza o objeto franaDB por usuário.

const FRANA_SUPABASE_URL = 'https://gjiauoqyabczeagixuyb.supabase.co';
const FRANA_SUPABASE_KEY = 'sb_publishable_Wur1qmb01gF90cZoo-oJQg_rnZBcOdv';

window.franaCloud = {
  client: null,
  user: null,
  ready: false,

  async init() {
    if (!window.supabase) {
      console.error('Supabase SDK não carregou.');
      return;
    }
    this.client = window.supabase.createClient(FRANA_SUPABASE_URL, FRANA_SUPABASE_KEY);
    const { data } = await this.client.auth.getSession();
    this.user = data.session?.user || null;
    this.ready = true;

    if (this.user) await this.pull();
    this.client.auth.onAuthStateChange(async (_event, session) => {
      this.user = session?.user || null;
      if (this.user) await this.pull();
    });
  },

  async signIn(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.user = data.user;
    await this.pull();
    return data.user;
  },

  async signOut() {
    await this.client.auth.signOut();
    this.user = null;
  },

  async pull() {
    if (!this.user) return false;
    const { data, error } = await this.client
      .from('app_state')
      .select('data, updated_at')
      .eq('user_id', this.user.id)
      .maybeSingle();
    if (error) {
      console.error('Erro ao carregar dados do Supabase:', error);
      return false;
    }
    if (data?.data) {
      db = data.data;
      db.moves = db.moves || [];
      db.tattoos = db.tattoos || [];
      localStorage.setItem('franaDB', JSON.stringify(db));
      if (typeof render === 'function') render();
      return true;
    }
    await this.push();
    return true;
  },

  async push() {
    if (!this.user) return false;
    const { error } = await this.client.from('app_state').upsert({
      user_id: this.user.id,
      data: db,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) {
      console.error('Erro ao salvar dados no Supabase:', error);
      return false;
    }
    return true;
  }
};

// Intercepta o save existente sem quebrar o funcionamento offline.
const franaLocalSave = save;
save = function () {
  franaLocalSave();
  if (window.franaCloud?.user) window.franaCloud.push();
};

window.addEventListener('DOMContentLoaded', () => window.franaCloud.init());
