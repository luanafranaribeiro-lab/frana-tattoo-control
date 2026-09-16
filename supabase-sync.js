// Frana Tattoo Control — autenticação + sincronização Supabase
const FRANA_SUPABASE_URL='https://gjiauoqyabczeagixuyb.supabase.co';
const FRANA_SUPABASE_KEY='sb_publishable_Wur1qmb01gF90cZoo-oJQg_rnZBcOdv';

window.franaCloud={client:null,user:null,ready:false,starting:false,
 async init(){
  if(this.starting||this.ready)return;
  this.starting=true;
  try{
   if(!window.supabase)throw new Error('Supabase SDK não carregou.');
   this.client=window.supabase.createClient(FRANA_SUPABASE_URL,FRANA_SUPABASE_KEY);
   const {data,error}=await this.client.auth.getSession();
   if(error)throw error;
   this.user=data.session?.user||null;
   this.ready=true;
   if(this.user){await this.pull();this.showApp()}else this.showLogin();
   this.client.auth.onAuthStateChange((event,session)=>{
    this.user=session?.user||null;
    if(event==='SIGNED_OUT'){this.showLogin();return}
    if(event==='SIGNED_IN'&&this.user){setTimeout(async()=>{await this.pull();this.showApp()},0)}
   });
  }catch(err){console.error('Erro ao iniciar nuvem:',err);this.ready=true;this.showLogin('Não foi possível conectar. Atualize a página e tente novamente.');}
  finally{this.starting=false}
 },
 showLogin(message=''){
  const app=document.getElementById('app'),nav=document.getElementById('nav'),modal=document.getElementById('modal');
  if(!app)return;
  if(nav)nav.style.display='none';if(modal)modal.classList.add('hidden');
  app.innerHTML=`<div style="min-height:78vh;display:flex;align-items:center;justify-content:center;padding:24px"><div class="card" style="width:min(100%,420px);padding:28px"><div class="brand" style="text-align:center;margin-bottom:6px">Frana Tattoo Control</div><div class="sub" style="text-align:center;margin-bottom:24px">Entre para acessar seus dados sincronizados</div><label>E-mail</label><input id="cloudEmail" type="email" autocomplete="email" placeholder="seu@email.com"><label>Senha</label><input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Sua senha"><div id="cloudMsg" class="tiny red" style="min-height:24px;margin-top:8px">${message}</div><button id="cloudLogin" class="btn full">Entrar</button></div></div>`;
  document.getElementById('cloudLogin').onclick=()=>this.loginFromScreen();
  document.getElementById('cloudPassword').onkeydown=e=>{if(e.key==='Enter')this.loginFromScreen()};
 },
 async loginFromScreen(){
  const email=document.getElementById('cloudEmail')?.value.trim(),password=document.getElementById('cloudPassword')?.value,msg=document.getElementById('cloudMsg'),btn=document.getElementById('cloudLogin');
  if(!email||!password){if(msg)msg.textContent='Preencha e-mail e senha.';return}
  btn.disabled=true;btn.textContent='Entrando...';msg.textContent='';
  const {data,error}=await this.client.auth.signInWithPassword({email,password});
  if(error){btn.disabled=false;btn.textContent='Entrar';msg.textContent='E-mail ou senha incorretos.';return}
  this.user=data.user;
  await this.pull();
  this.showApp();
 },
 showApp(){const nav=document.getElementById('nav');if(nav)nav.style.display='';if(typeof render==='function')render()},
 async pull(){
  if(!this.user)return false;
  const {data,error}=await this.client.from('app_state').select('data,updated_at').eq('user_id',this.user.id).maybeSingle();
  if(error){console.error('Erro ao carregar dados:',error);return false}
  if(data?.data){db=data.data;db.moves=db.moves||[];db.tattoos=db.tattoos||[];db.stock=db.stock||[];db.events=db.events||[];db.expenses=db.expenses||[];db.settings=db.settings||{};localStorage.setItem('franaDB',JSON.stringify(db));return true}
  return await this.push();
 },
 async push(){
  if(!this.user)return false;
  const {error}=await this.client.from('app_state').upsert({user_id:this.user.id,data:db,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error){console.error('Erro ao salvar dados:',error);return false}return true
 },
 async signOut(){if(this.client)await this.client.auth.signOut()}
};

const franaLocalSave=save;
save=function(){franaLocalSave();if(window.franaCloud?.user)window.franaCloud.push()};
// Este script é carregado no fim do body; iniciar diretamente evita perder o DOMContentLoaded.
window.franaCloud.init();
