// ============================================================
// BATALHA DO SABER v2 — script.js
// Modos: Quiz, Velocidade, Forca, Memória
// ============================================================

// ---- EMOJIS ----
const EMOJIS = [
  '😎','🔥','👑','🐱','⚡','🦊','🐸','🌟','🎮','💎',
  '🦁','🐯','🐺','🦅','🦋','🌈','🎯','🚀','🏆','💜',
  '😈','🤖','👾','🎭','🧠','🦄','🐉','🌊','⚔️','🛡️',
  '🍎','🎸','🎵','🌙','☀️','❄️','🌺','🍀','🎩','🔮'
];

const LETRAS = ['A','B','C','D'];
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const NOMES_PROIBIDOS = ['eipstein','eipsten','diddy','p.diddy','p diddy','adolf','hitler'];
const SENHA_PROFESSOR = '2054';

const MATERIA_NOMES = {
  portugues:'📖 Português', matematica:'🔢 Matemática',
  ciencias:'🔬 Ciências',   historia:'🏛️ História',
  ingles:'🇬🇧 Inglês',      geografia:'🌍 Geografia'
};
const MATERIA_CORES = {
  portugues:'#7c3aed', matematica:'#0891b2', ciencias:'#d97706',
  historia:'#dc2626',  ingles:'#2563eb',     geografia:'#16a34a'
};
const MODO_NOMES = { quiz:'🧠 Quiz', velocidade:'⚡ Velocidade', forca:'🔤 Forca', memoria:'🃏 Memória' };

// ---- ESTADO ----
let meuId = null, meuNome = '', meuEmoji = '', emojiSelecionado = '';
let materiaSelecionada = 'portugues', modoSelecionado = 'quiz';
let timerLocal = null, segundosRestantes = 10, tempoPerguntaTotal = 10;
let jaRespondeu = false, respondeuAudio = false;
let modoProfsDesbloqueado = false;
let modoJogoAtual = 'quiz';

// ---- ÁUDIO ----
let audioCtx = null;
function getAudio(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }

function tocarSom(tipo){
  try{
    const ctx=getAudio(), osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const t=ctx.currentTime;
    const cfg={
      acerto:()=>{ osc.type='sine';[523,659,784].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.1)); gain.gain.setValueAtTime(.3,t); gain.gain.exponentialRampToValueAtTime(.001,t+.5); osc.start(t);osc.stop(t+.5); },
      erro:  ()=>{ osc.type='sawtooth';[200,100].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.15)); gain.gain.setValueAtTime(.2,t); gain.gain.exponentialRampToValueAtTime(.001,t+.3); osc.start(t);osc.stop(t+.3); },
      tick:  ()=>{ osc.type='square';osc.frequency.setValueAtTime(800,t); gain.gain.setValueAtTime(.05,t); gain.gain.exponentialRampToValueAtTime(.001,t+.05); osc.start(t);osc.stop(t+.05); },
      inicio:()=>{ osc.type='sine';[440,550,660].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.15)); gain.gain.setValueAtTime(.3,t); gain.gain.exponentialRampToValueAtTime(.001,t+.6); osc.start(t);osc.stop(t+.6); },
      fim:   ()=>{ osc.type='sine';[784,659,523].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.2)); gain.gain.setValueAtTime(.3,t); gain.gain.exponentialRampToValueAtTime(.001,t+.8); osc.start(t);osc.stop(t+.8); },
      carta: ()=>{ osc.type='sine';osc.frequency.setValueAtTime(660,t);osc.frequency.setValueAtTime(880,t+.05); gain.gain.setValueAtTime(.15,t); gain.gain.exponentialRampToValueAtTime(.001,t+.15); osc.start(t);osc.stop(t+.15); },
      par:   ()=>{ osc.type='sine';[523,659,784,1047].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.08)); gain.gain.setValueAtTime(.25,t); gain.gain.exponentialRampToValueAtTime(.001,t+.5); osc.start(t);osc.stop(t+.5); },
      vitoria:()=>{ osc.type='sine';[523,659,784,1047,784,659,1047].forEach((f,i)=>osc.frequency.setValueAtTime(f,t+i*.12)); gain.gain.setValueAtTime(.35,t); gain.gain.exponentialRampToValueAtTime(.001,t+1.2); osc.start(t);osc.stop(t+1.2); }
    };
    cfg[tipo]?.();
  }catch(e){}
}

// ============================================================
// SOCKET.IO
// ============================================================
const socket = io();

socket.on('connect',()=>{ meuId=socket.id; });

socket.on('estado_atual',({fase,ranking,nivel,materia,totalRodadas,modoJogo})=>{
  modoJogoAtual = modoJogo || 'quiz';
  if(fase==='resultado'){ mostrarTela('resultado'); renderizarResultadoFinal(ranking); }
  renderizarLobby(ranking);
});

socket.on('atualizar_lobby',({jogadores,mensagem})=>{
  renderizarLobby(jogadores); mostrarMsgLobby(mensagem);
});

socket.on('jogo_iniciado',({nivel,totalRodadas,materia,modoJogo,tempoPergunta})=>{
  modoJogoAtual = modoJogo;
  tempoPerguntaTotal = parseInt(tempoPergunta)||10;
  tocarSom('inicio');

  const nivelNomes={'4ano':'4º Ano','5ano':'5º Ano','6ano':'6º Ano','7ano':'7º Ano','8ano':'8º Ano','9ano':'9º Ano'};
  const telaNome = modoJogo==='forca' ? 'forca' : modoJogo==='memoria' ? 'memoria' : 'jogo';
  mostrarTela(telaNome);

  // Atualizar headers
  ['nivel-badge','forca-materia-badge','mem-materia-badge'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.textContent = id.includes('nivel') ? (nivelNomes[nivel]||nivel) : (MATERIA_NOMES[materia]||materia);
  });
  document.getElementById('materia-badge')?.setAttribute('style',`background:linear-gradient(135deg,${MATERIA_CORES[materia]||'#7c3aed'},${MATERIA_CORES[materia]||'#7c3aed'}99)`);
  document.getElementById('modo-badge')&&(document.getElementById('modo-badge').textContent=MODO_NOMES[modoJogo]||modoJogo);

  // Preencher dados do jogador no header
  ['','forca-','mem-'].forEach(p=>{
    const ee=document.getElementById(p+'meu-emoji-header')||document.getElementById(p+'meu-emoji');
    const ne=document.getElementById(p+'meu-nome-header')||document.getElementById(p+'meu-nome');
    const pe=document.getElementById(p+'meus-pontos-header')||document.getElementById(p+'meus-pontos');
    if(ee) ee.textContent=meuEmoji||'👤';
    if(ne) ne.textContent=meuNome||'Jogador';
    if(pe) pe.textContent='0 pts';
  });

  // Botão próxima
  const btn=document.getElementById('btn-proxima-pergunta');
  if(btn) btn.style.display=modoProfsDesbloqueado?'block':'none';

  // Velocidade: mostrar banner
  const vb=document.getElementById('velocidade-bonus');
  if(vb) vb.classList.toggle('oculto',modoJogo!=='velocidade');
});

// ---- QUIZ / VELOCIDADE ----
socket.on('nova_pergunta',({pergunta,opcoes,tipo,rodada,totalRodadas,tempo,materia,modoJogo})=>{
  jaRespondeu=false; respondeuAudio=false;
  tempoPerguntaTotal=parseInt(tempo)||10;
  document.getElementById('rodada-info').textContent=`Rodada ${rodada}/${totalRodadas}`;
  document.getElementById('progresso-fill').style.width='0%';
  document.getElementById('responderam-label').textContent='0 responderam';
  const btn=document.getElementById('btn-proxima-pergunta');
  if(btn&&modoProfsDesbloqueado){ btn.disabled=false; btn.textContent='⏭️ Próxima Pergunta'; }
  renderizarPergunta(pergunta,opcoes,tipo);
  iniciarTimer(tempo);
  esconderFeedback();
  // Velocidade: atualizar banner
  if(modoJogo==='velocidade'){
    const vb=document.getElementById('velocidade-bonus');
    if(vb){ vb.classList.remove('oculto'); document.getElementById('bonus-texto').textContent='⚡ Quanto mais rápido, mais pontos!'; }
  }
});

socket.on('progresso_respostas',({responderam,total})=>{
  const pct=total>0?(responderam/total)*100:0;
  document.getElementById('progresso-fill').style.width=pct+'%';
  document.getElementById('responderam-label').textContent=`${responderam} de ${total} responderam`;
});

socket.on('feedback_resposta',({correta,resposta})=>{
  mostrarFeedback(correta);
  if(!respondeuAudio){ tocarSom(correta?'acerto':'erro'); respondeuAudio=true; }
  document.querySelectorAll('.opcao-btn').forEach((btn,i)=>{
    btn.disabled=true; if(i===resposta) btn.classList.add(correta?'correta':'errada');
  });
});

socket.on('fim_rodada',({respostaCorreta,primeiroAcertou,ranking,modoJogo})=>{
  pararTimer(); esconderFeedback();
  document.querySelectorAll('.opcao-btn').forEach((btn,i)=>{ btn.disabled=true; btn.classList.add(i===respostaCorreta?'correta':'errada'); });
  renderizarRankingLateral(ranking,'ranking-lista');
  atualizarMeusPontos(ranking,'meus-pontos-header');
  if(primeiroAcertou===socket.id) mostrarBadgeRapido();
  const btn=document.getElementById('btn-proxima-pergunta');
  if(btn&&modoProfsDesbloqueado){ btn.disabled=false; btn.textContent='⏭️ Próxima Pergunta'; }
});

// ---- FORCA ----
socket.on('forca_nova_palavra',({tamanho,dica,tentativas,rodada,totalRodadas})=>{
  document.getElementById('forca-rodada-info').textContent=`Rodada ${rodada}/${totalRodadas}`;
  document.getElementById('forca-dica').textContent=dica;
  renderizarPalavraForca(tamanho,[]);
  resetarBonecoForca(tentativas);
  renderizarTeclado();
  iniciarTimer(tempoPerguntaTotal);
});

socket.on('forca_atualizar',({letrasCorretas,letrasErradas,tentativas,ranking,quemJogou,nomeJogador,nomeLetter,acertou,errou})=>{
  renderizarPalavraForcaComLetras(letrasCorretas);
  atualizarBonecoForca(tentativas);
  atualizarTeclado(letrasCorretas,letrasErradas);
  document.getElementById('forca-erradas').innerHTML=letrasErradas.map(l=>`<span class="forca-letra-errada">${l}</span>`).join('');
  renderizarRankingLateral(ranking,'forca-ranking-lista');
  atualizarMeusPontos(ranking,'forca-meus-pontos');
  // Notificação de quem jogou
  if(nomeJogador&&nomeLetter){
    const msg=acertou?`✅ ${nomeJogador} acertou a letra ${nomeLetter}!`:`❌ ${nomeJogador} errou com ${nomeLetter}`;
    mostrarToast(msg,acertou?'acerto':'erro');
    tocarSom(acertou?'acerto':'erro');
  }
  if(errou&&tentativas===0) tocarSom('erro');
});

socket.on('forca_fim_rodada',({ganhou,palavraCompleta,ranking})=>{
  pararTimer();
  renderizarRankingLateral(ranking,'forca-ranking-lista');
  atualizarMeusPontos(ranking,'forca-meus-pontos');
  // Mostrar palavra completa
  renderizarPalavraForcaCompleta(palavraCompleta);
  mostrarToast(ganhou?'🎉 Palavra descoberta!':'💀 Ninguém descobriu! A palavra era: '+palavraCompleta,ganhou?'acerto':'erro');
  tocarSom(ganhou?'par':'erro');
});

// ---- MEMÓRIA ----
let cartasMemoria = []; // estado local das cartas

socket.on('memoria_inicio',({totalCartas,rodada,totalRodadas})=>{
  document.getElementById('mem-rodada-info').textContent=`Rodada ${rodada}/${totalRodadas}`;
  renderizarGridMemoria(totalCartas);
  mostrarToast('🃏 Encontre os pares!','neutro');
});

socket.on('memoria_virar',({posicao,conteudo,jogadorId})=>{
  virarCartaUI(posicao,conteudo,jogadorId===socket.id);
  tocarSom('carta');
});

socket.on('memoria_par',({posicoes,jogadorId,ranking})=>{
  posicoes.forEach(p=>marcarCartaEncontrada(p));
  renderizarRankingLateral(ranking,'mem-ranking-lista');
  atualizarMeusPontos(ranking,'mem-meus-pontos');
  if(jogadorId===socket.id){ tocarSom('par'); mostrarBadgeRapido('🎯 Par encontrado! +20 pts'); }
  else{
    const j=ranking.find(r=>r.id===jogadorId);
    mostrarToast(`${j?.emoji||''} ${j?.nome||'Alguém'} encontrou um par!`,'neutro');
  }
});

socket.on('memoria_erro',({posicoes})=>{
  posicoes.forEach(p=>desvirarCartaUI(p));
});

// ---- FIM ----
socket.on('fim_jogo',({ranking})=>{
  tocarSom('vitoria'); pararTimer();
  setTimeout(()=>{ mostrarTela('resultado'); renderizarResultadoFinal(ranking); }, 500);
});

socket.on('jogo_resetado',({ranking})=>{
  mostrarTela('lobby'); renderizarLobby(ranking);
  mostrarMsgLobby('🔄 Jogo resetado! Aguardando o professor iniciar.');
});

// ============================================================
// FUNÇÕES UI — LOBBY
// ============================================================
function inicializarEmojis(){
  const grid=document.getElementById('emoji-grid');
  EMOJIS.forEach(em=>{
    const btn=document.createElement('button');
    btn.className='emoji-btn'; btn.textContent=em;
    btn.onclick=()=>selecionarEmoji(em,btn);
    grid.appendChild(btn);
  });
}

function selecionarEmoji(emoji,btn){
  document.querySelectorAll('.emoji-btn').forEach(b=>b.classList.remove('selecionado'));
  btn.classList.add('selecionado');
  emojiSelecionado=emoji;
  document.getElementById('emoji-preview').textContent=`Selecionado: ${emoji}`;
}

function selecionarMateria(btn){
  document.querySelectorAll('.btn-materia').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected'); materiaSelecionada=btn.dataset.materia;
}

function selecionarModo(btn){
  document.querySelectorAll('.btn-modo').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected'); modoSelecionado=btn.dataset.modo;
}

function entrarNoLobby(){
  const nome=document.getElementById('input-nome').value.trim();
  if(!nome){ pulsarErro('input-nome'); return; }
  if(!emojiSelecionado){ mostrarToast('Selecione um emoji!','erro'); return; }
  if(nomeProbido(nome)){ mostrarAvisoNomeProibido(); pulsarErro('input-nome'); return; }
  meuNome=nome; meuEmoji=emojiSelecionado;
  socket.emit('entrar_lobby',{nome,emoji:emojiSelecionado});
  document.getElementById('btn-entrar').textContent='✅ Você entrou!';
  document.getElementById('btn-entrar').disabled=true;
  document.getElementById('input-nome').disabled=true;
  document.querySelectorAll('.emoji-btn').forEach(b=>b.disabled=true);
}

function nomeProbido(nome){ const n=nome.toLowerCase().trim(); return NOMES_PROIBIDOS.some(p=>n===p||n.includes(p)); }

function mostrarAvisoNomeProibido(){
  const el=document.createElement('div');
  el.style.cssText='background:rgba(255,60,90,.15);border:2px solid var(--red);border-radius:10px;padding:.7rem 1rem;margin-top:.6rem;color:var(--red);font-size:.85rem;font-weight:700;text-align:center;';
  el.innerHTML='🚫 <strong>Nome não permitido!</strong> Escolha outro nome.';
  document.getElementById('btn-entrar').before(el);
  setTimeout(()=>el.remove(),5000);
}

function toggleModoProf(){
  if(modoProfsDesbloqueado){ document.getElementById('painel-prof').classList.toggle('oculto'); return; }
  const modal=document.getElementById('modal-senha-prof');
  modal.classList.remove('oculto');
  document.getElementById('input-senha-prof').value='';
  document.getElementById('erro-senha-prof').textContent='';
  setTimeout(()=>document.getElementById('input-senha-prof').focus(),100);
}

function confirmarSenhaProf(){
  if(document.getElementById('input-senha-prof').value===SENHA_PROFESSOR){
    modoProfsDesbloqueado=true; fecharModalSenha();
    document.getElementById('painel-prof').classList.remove('oculto');
    document.getElementById('btn-toggle-prof').textContent='👨‍🏫 Modo Professor ✅';
  } else {
    document.getElementById('erro-senha-prof').textContent='❌ Senha incorreta!';
    document.getElementById('input-senha-prof').style.borderColor='var(--red)';
    setTimeout(()=>{ document.getElementById('erro-senha-prof').textContent=''; document.getElementById('input-senha-prof').style.borderColor=''; },2000);
  }
}
function fecharModalSenha(){ document.getElementById('modal-senha-prof')?.classList.add('oculto'); }

document.addEventListener('DOMContentLoaded',()=>{
  const inp=document.getElementById('input-senha-prof');
  inp?.addEventListener('keydown',e=>{ if(e.key==='Enter') confirmarSenhaProf(); if(e.key==='Escape') fecharModalSenha(); });
});

function iniciarJogo(){
  if(!modoProfsDesbloqueado) return;
  socket.emit('iniciar_jogo',{
    nivel:document.getElementById('sel-nivel').value,
    totalRodadas:parseInt(document.getElementById('sel-rodadas').value),
    materia:materiaSelecionada,
    modoJogo:modoSelecionado,
    tempoPergunta:parseInt(document.getElementById('sel-tempo').value)
  });
}
function proximaPerguntaProf(){
  if(!modoProfsDesbloqueado) return;
  const btn=document.getElementById('btn-proxima-pergunta');
  if(btn){ btn.disabled=true; btn.textContent='⏳ Aguardando...'; }
  socket.emit('proxima_pergunta');
}
function resetarJogo(){ socket.emit('resetar_jogo'); }
function voltarLobby(){
  document.getElementById('btn-entrar').textContent='🚀 Entrar no Jogo';
  document.getElementById('btn-entrar').disabled=false;
  document.getElementById('input-nome').disabled=false;
  document.querySelectorAll('.emoji-btn').forEach(b=>b.disabled=false);
  mostrarTela('lobby');
}

// ============================================================
// FUNÇÕES UI — TELAS
// ============================================================
function mostrarTela(nome){
  document.querySelectorAll('.tela').forEach(t=>t.classList.remove('ativa'));
  const mapa={lobby:'tela-lobby',jogo:'tela-jogo',forca:'tela-forca',memoria:'tela-memoria',resultado:'tela-resultado'};
  document.getElementById(mapa[nome])?.classList.add('ativa');
}

function renderizarLobby(jogadores){
  const lista=document.getElementById('lista-jogadores');
  if(!jogadores?.length){ lista.innerHTML='<p class="vazio">Aguardando jogadores...</p>'; return; }
  lista.innerHTML=jogadores.map((j,i)=>`
    <div class="jogador-item ${['top1','top2','top3'][i]||''}">
      <span class="jogador-pos">#${i+1}</span>
      <span class="jogador-emoji">${j.emoji}</span>
      <span class="jogador-nome">${escapeHTML(j.nome)}</span>
      <span class="jogador-pts">${j.pontos} pts</span>
    </div>`).join('');
}

// ============================================================
// FUNÇÕES UI — QUIZ
// ============================================================
function renderizarPergunta(pergunta,opcoes,tipo){
  const tipoNomes={multipla:'🔵 Múltipla Escolha',corrigir:'🔴 Corrigir a Frase',completar:'🟡 Completar',interpretacao:'🟢 Interpretação'};
  document.getElementById('tipo-badge').textContent=tipoNomes[tipo]||'🔵 Múltipla Escolha';
  digitarTexto('texto-pergunta',pergunta);
  document.getElementById('opcoes-grid').innerHTML=opcoes.map((op,i)=>`
    <button class="opcao-btn" onclick="responder(${i})">
      <span class="opcao-letra">${LETRAS[i]}</span>
      <span>${escapeHTML(op)}</span>
    </button>`).join('');
}

function digitarTexto(id,texto){
  const el=document.getElementById(id); el.textContent='';
  let i=0; const vel=Math.max(12,Math.min(38,1200/texto.length));
  const itv=setInterval(()=>{ el.textContent+=texto[i++]; if(i>=texto.length) clearInterval(itv); },vel);
}

function responder(indice){
  if(jaRespondeu) return; jaRespondeu=true;
  document.querySelectorAll('.opcao-btn').forEach(b=>b.disabled=true);
  document.querySelectorAll('.opcao-btn')[indice]?.classList.add('selecionada');
  socket.emit('responder',{resposta:indice});
}

// ============================================================
// TIMER
// ============================================================
function iniciarTimer(segundos){
  pararTimer(); segundosRestantes=segundos;
  const CIRC=327;
  const circle=document.getElementById('timer-circle');
  const numero=document.getElementById('timer-numero');
  if(!circle||!numero) return;
  circle.style.stroke='var(--neon1)'; numero.style.color='var(--text)';
  numero.textContent=segundos; circle.style.strokeDashoffset=0;

  timerLocal=setInterval(()=>{
    segundosRestantes--;
    numero.textContent=segundosRestantes;
    circle.style.strokeDashoffset=CIRC*((segundos-segundosRestantes)/segundos);
    if(segundosRestantes<=3){ circle.style.stroke='var(--red)'; numero.style.color='var(--red)'; if(segundosRestantes>0) tocarSom('tick'); }
    else if(segundosRestantes<=Math.floor(segundos*.4)){ circle.style.stroke='var(--neon3)'; }
    if(segundosRestantes<=0){ pararTimer(); circle.style.strokeDashoffset=CIRC; }
  },1000);
}
function pararTimer(){ if(timerLocal){ clearInterval(timerLocal); timerLocal=null; } }

// ============================================================
// FEEDBACK
// ============================================================
function mostrarFeedback(correta){
  const overlay=document.getElementById('feedback-overlay');
  const box=document.getElementById('feedback-box');
  overlay.classList.remove('oculto');
  box.className='feedback-box '+(correta?'acerto':'erro');
  document.getElementById('feedback-icon').textContent=correta?'✅':'❌';
  document.getElementById('feedback-texto').textContent=correta?'Correto!':'Errou!';
  document.getElementById('feedback-pts').textContent=correta?'+10 pontos':'-5 pontos';
  setTimeout(esconderFeedback,1800);
}
function esconderFeedback(){ document.getElementById('feedback-overlay').classList.add('oculto'); }

function mostrarBadgeRapido(texto='⚡ Mais Rápido! +5 bônus!'){
  const badge=document.createElement('div');
  badge.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:500;background:linear-gradient(135deg,var(--neon3),#ff9100);color:#000;font-family:"Orbitron",sans-serif;font-weight:900;padding:1rem 2rem;border-radius:20px;font-size:1.1rem;animation:popIn .3s ease,fadeOutUp .5s ease 1.5s forwards;box-shadow:0 0 40px rgba(249,200,14,.5);text-align:center;';
  badge.textContent=texto; document.body.appendChild(badge);
  setTimeout(()=>badge.remove(),2500);
}

// ---- TOAST ----
function mostrarToast(msg,tipo='neutro'){
  const t=document.createElement('div');
  const cores={acerto:'rgba(0,255,136,.15)','#':tipo==='acerto'?'var(--green)':'var(--red)',erro:'rgba(255,60,90,.15)',neutro:'rgba(0,229,255,.1)'};
  const bordas={acerto:'var(--green)',erro:'var(--red)',neutro:'var(--neon1)'};
  t.style.cssText=`position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:600;background:${cores[tipo]||cores.neutro};border:1.5px solid ${bordas[tipo]||bordas.neutro};border-radius:12px;padding:.7rem 1.4rem;font-size:.88rem;font-weight:800;color:var(--text);backdrop-filter:blur(8px);animation:fadeUp .3s ease,fadeOutDown .4s ease 2.2s forwards;white-space:nowrap;max-width:90vw;text-overflow:ellipsis;overflow:hidden;`;
  t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),3000);
}

// ---- RANKING ----
function renderizarRankingLateral(ranking,listaId='ranking-lista'){
  const el=document.getElementById(listaId); if(!el) return;
  el.innerHTML=ranking.map((j,i)=>`
    <div class="rank-item ${['top1','top2','top3'][i]||''}">
      <span class="rank-pos">${getMedal(i)}</span>
      <span class="rank-emoji">${j.emoji}</span>
      <span class="rank-nome">${escapeHTML(j.nome)}</span>
      <span class="rank-pts">${j.pontos}</span>
    </div>`).join('');
}

function atualizarMeusPontos(ranking,ptsMeuId='meus-pontos-header'){
  const eu=ranking.find(j=>j.id===socket.id);
  if(eu){ const el=document.getElementById(ptsMeuId); if(el) el.textContent=eu.pontos+' pts'; }
}

// ============================================================
// FORCA
// ============================================================
let palavraForcaTamanho=0;

function renderizarPalavraForca(tamanho,letrasCorretas){
  palavraForcaTamanho=tamanho;
  const wrap=document.getElementById('forca-palavra');
  wrap.innerHTML=Array.from({length:tamanho},(_,i)=>`<div class="forca-letra" id="fc-l-${i}">_</div>`).join('');
}

function renderizarPalavraForcaComLetras(letrasCorretas){
  // Não sabemos a palavra exata no cliente; o servidor revela letra a letra via 'forca_atualizar'
  // Usamos posições retornadas implicitamente — o servidor apenas manda quais letras estão corretas
  // Então reconstruímos o display baseado nas letras reveladas
  // (O servidor não manda a palavra; apenas as letras certas. A renderização mostra '_' para não reveladas)
  // Nada a fazer aqui além de aguardar 'forca_atualizar_posicoes' se existir
}

function renderizarPalavraForcaCompleta(palavra){
  const wrap=document.getElementById('forca-palavra');
  wrap.innerHTML=[...palavra].map(c=>
    c===' '?`<div class="forca-letra-espaco"></div>`:`<div class="forca-letra" style="color:var(--neon3)">${c}</div>`
  ).join('');
}

// Nova função: o servidor manda quais ÍNDICES revelar
// Mas o servidor atual só manda letrasCorretas (array de chars)
// Então vamos receber a palavra parcial em forca_atualizar via custom
socket.on('forca_palavra_parcial',({parcial})=>{
  const wrap=document.getElementById('forca-palavra');
  wrap.innerHTML=[...parcial].map(c=>
    c===' '?`<div class="forca-letra-espaco"></div>`
    :c==='_'?`<div class="forca-letra">_</div>`
    :`<div class="forca-letra">${c}</div>`
  ).join('');
});

function resetarBonecoForca(tentativas){
  const partes=['fc-cabeca','fc-corpo','fc-bD','fc-bE','fc-pD','fc-pE'];
  partes.forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('oculto-svg'); });
  // Mostrar tentativas como corações
  atualizarCorações(tentativas,tentativas);
}

function atualizarBonecoForca(tentativasRestantes){
  const partes=['fc-cabeca','fc-corpo','fc-bD','fc-bE','fc-pD','fc-pE'];
  const maxErros=6;
  const erros=maxErros-tentativasRestantes;
  partes.forEach((id,i)=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(i<erros) el.classList.remove('oculto-svg');
    else el.classList.add('oculto-svg');
  });
  atualizarCorações(tentativasRestantes,maxErros);
}

function atualizarCorações(restantes,max){
  const el=document.getElementById('forca-corações'); if(!el) return;
  el.textContent='❤️'.repeat(restantes)+'🖤'.repeat(max-restantes);
}

function renderizarTeclado(){
  const wrap=document.getElementById('forca-teclado'); if(!wrap) return;
  wrap.innerHTML=[...ALFABETO].map(l=>`<button class="tecla" id="tecla-${l}" onclick="jogarLetraForca('${l}')">${l}</button>`).join('');
}

function atualizarTeclado(letrasCorretas,letrasErradas){
  letrasCorretas.forEach(l=>{ const t=document.getElementById('tecla-'+l); if(t){ t.disabled=true; t.classList.add('acertou'); } });
  letrasErradas.forEach(l=>{  const t=document.getElementById('tecla-'+l); if(t){ t.disabled=true; t.classList.add('errou'); } });
}

function jogarLetraForca(letra){
  socket.emit('forca_letra',{letra});
}

// ============================================================
// MEMÓRIA
// ============================================================
let totalCartasMemoria=0;

function renderizarGridMemoria(total){
  totalCartasMemoria=total;
  cartasMemoria=Array.from({length:total},(_,i)=>({posicao:i,virada:false,encontrada:false,conteudo:''}));
  const grid=document.getElementById('memoria-grid'); if(!grid) return;
  grid.innerHTML=Array.from({length:total},(_,i)=>`
    <div class="memoria-carta" id="mc-${i}" onclick="clicarCarta(${i})">
      <div class="memoria-carta-inner">
        <div class="carta-frente">🂠</div>
        <div class="carta-verso" id="mc-verso-${i}">?</div>
      </div>
    </div>`).join('');
}

function clicarCarta(posicao){
  const carta=cartasMemoria[posicao];
  if(!carta||carta.virada||carta.encontrada) return;
  socket.emit('memoria_carta',{posicao});
}

function virarCartaUI(posicao,conteudo,minha){
  const el=document.getElementById(`mc-${posicao}`); if(!el) return;
  const verso=document.getElementById(`mc-verso-${posicao}`);
  if(verso) verso.textContent=conteudo;
  el.classList.add('virada');
  if(cartasMemoria[posicao]) cartasMemoria[posicao].virada=true;
  if(minha) el.style.boxShadow='0 0 20px var(--neon1)';
}

function desvirarCartaUI(posicao){
  const el=document.getElementById(`mc-${posicao}`); if(!el) return;
  el.style.boxShadow='';
  el.classList.remove('virada');
  if(cartasMemoria[posicao]){ cartasMemoria[posicao].virada=false; }
}

function marcarCartaEncontrada(posicao){
  const el=document.getElementById(`mc-${posicao}`); if(!el) return;
  el.classList.add('encontrada'); el.style.boxShadow='0 0 20px var(--green)';
  if(cartasMemoria[posicao]){ cartasMemoria[posicao].encontrada=true; }
}

// ============================================================
// RESULTADO FINAL COM ANIMAÇÃO ÉPICA
// ============================================================
function renderizarResultadoFinal(ranking){
  // Pódio com animação escalonada (3→2→1 com suspense)
  const top3=ranking.slice(0,3);
  const medalhas=['🥇','🥈','🥉'];
  const coroas=['👑','🌟','⭐'];
  const ordemSuspense=[2,1,0]; // mostra 3º, 2º, 1º

  const podio=document.getElementById('podio');
  podio.innerHTML=top3.map((j,i)=>`
    <div class="podio-item pos-${i+1}" id="podio-${i}">
      <span class="podio-coroa">${coroas[i]}</span>
      <span class="podio-emoji">${j.emoji}</span>
      <p class="podio-nome">${escapeHTML(j.nome)}</p>
      <p class="podio-pts">${j.pontos} pts</p>
      <span class="podio-medal">${medalhas[i]}</span>
    </div>`).join('');

  // Animar em ordem crescente: 3º → 2º → 1º
  ordemSuspense.forEach((idx,ordem)=>{
    setTimeout(()=>{
      const el=document.getElementById('podio-'+idx);
      if(el){
        el.classList.add('animado');
        el.style.animationDelay='0s';
        if(idx===0){ // campeão
          tocarSom('vitoria');
          setTimeout(()=>dispararConfete(),400);
        } else {
          tocarSom('par');
        }
      }
    }, ordem*1200);
  });

  // Ranking completo
  document.getElementById('ranking-final').innerHTML=ranking.map((j,i)=>`
    <div class="ranking-final-item" style="animation-delay:${i*.05}s">
      <span class="rf-pos">${i+1}º</span>
      <span class="rf-emoji">${j.emoji}</span>
      <span class="rf-nome">${escapeHTML(j.nome)}</span>
      <span class="rf-pts">${j.pontos} pts</span>
    </div>`).join('');
}

// ============================================================
// CONFETE
// ============================================================
function dispararConfete(){
  const canvas=document.getElementById('confete-canvas');
  if(!canvas) return;
  canvas.style.display='block';
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const ctx=canvas.getContext('2d');
  const particulas=[];
  const cores=['#f9c80e','#00e5ff','#ff3cac','#00ff88','#8b5cf6','#f97316','#fff'];

  for(let i=0;i<200;i++){
    particulas.push({
      x:Math.random()*canvas.width, y:-10,
      r:Math.random()*6+3,
      cor:cores[Math.floor(Math.random()*cores.length)],
      vx:(Math.random()-.5)*4,
      vy:Math.random()*3+2,
      gravidade:.15,
      rotacao:Math.random()*Math.PI*2,
      vRotacao:(Math.random()-.5)*.2,
      forma:Math.floor(Math.random()*3) // 0=círculo, 1=quadrado, 2=triângulo
    });
  }

  let frame=0;
  function animar(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particulas.forEach(p=>{
      p.vy+=p.gravidade; p.x+=p.vx; p.y+=p.vy; p.rotacao+=p.vRotacao;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotacao); ctx.fillStyle=p.cor; ctx.beginPath();
      if(p.forma===0){ ctx.arc(0,0,p.r,0,Math.PI*2); }
      else if(p.forma===1){ ctx.rect(-p.r,-p.r,p.r*2,p.r*2); }
      else{ ctx.moveTo(0,-p.r); ctx.lineTo(p.r,p.r); ctx.lineTo(-p.r,p.r); ctx.closePath(); }
      ctx.fill(); ctx.restore();
    });
    frame++;
    if(frame<200) requestAnimationFrame(animar);
    else{ ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display='none'; }
  }
  animar();
}

// ============================================================
// MENSAGEM LOBBY
// ============================================================
function mostrarMsgLobby(msg){
  const el=document.getElementById('msg-lobby'); if(!el) return;
  el.textContent=msg; el.style.opacity='1';
  setTimeout(()=>{ el.style.opacity='0'; },4000);
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function getMedal(i){ return['🥇','🥈','🥉'][i]||`${i+1}º`; }
function escapeHTML(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function pulsarErro(id){ const e=document.getElementById(id); if(!e) return; e.style.borderColor='var(--red)'; e.classList.add('anim-shake'); setTimeout(()=>{ e.style.borderColor=''; e.classList.remove('anim-shake'); },500); }

// Animações extras inline
const style=document.createElement('style');
style.textContent=`
  @keyframes fadeOutUp { to { opacity:0; transform:translate(-50%,-80%) scale(.85); } }
  @keyframes fadeOutDown { to { opacity:0; transform:translateX(-50%) translateY(20px); } }
`;
document.head.appendChild(style);

// ============================================================
// INIT
// ============================================================
inicializarEmojis();