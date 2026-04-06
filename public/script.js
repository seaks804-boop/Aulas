// ============================================================
// BATALHA DO SABER — script.js (cliente)
// Versão expandida: múltiplas matérias + seletor visual
// ============================================================

// ---- EMOJIS DISPONÍVEIS ----
const EMOJIS = [
  '😎','🔥','👑','🐱','⚡','🦊','🐸','🌟','🎮','💎',
  '🦁','🐯','🐺','🦅','🦋','🌈','🎯','🚀','🏆','💜',
  '😈','🤖','👾','🎭','🧠','🦄','🐉','🌊','⚔️','🛡️',
  '🍎','🎸','🎵','🌙','☀️','❄️','🌺','🍀','🦊','🎩'
];

const LETRAS = ['A', 'B', 'C', 'D'];

const NOMES_PROIBIDOS = [
  'eipstein','eipsten','diddy','p.diddy','p diddy','adolf','hitler','adolf hitler'
];

const SENHA_PROFESSOR = '2054';

// ---- Mapeamento de matérias ----
const MATERIA_NOMES = {
  portugues:  '📖 Português',
  matematica: '🔢 Matemática',
  geometria:  '📐 Geometria',
  geografia:  '🌍 Geografia',
  ciencias:   '🔬 Ciências',
  historia:   '🏛️ História',
  ingles:     '🇬🇧 Inglês',
  aleatorio:  '🎲 Aleatório'
};

const MATERIA_CORES = {
  portugues:  '#7c3aed',
  matematica: '#0891b2',
  geometria:  '#059669',
  geografia:  '#16a34a',
  ciencias:   '#d97706',
  historia:   '#dc2626',
  ingles:     '#2563eb',
  aleatorio:  '#db2777'
};

// ---- ESTADO LOCAL ----
let meuId               = null;
let meuNome             = '';
let meuEmoji            = '';
let emojiSelecionado    = '';
let materiaSelecionada  = 'portugues';
let timerLocal          = null;
let segundosRestantes   = 10;
let jaRespondeu         = false;
let respondeuAudio      = false;
let modoProfsDesbloqueado = false;

// ---- CONTEXTO DE ÁUDIO ----
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tocarSom(tipo) {
  try {
    const ctx  = getAudio();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);

    const cfg = {
      acerto: () => {
        osc.type = 'sine';
        [523,659,784].forEach((f,i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i*.1));
        gain.gain.setValueAtTime(.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .5);
      },
      erro: () => {
        osc.type = 'sawtooth';
        [200,100].forEach((f,i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i*.15));
        gain.gain.setValueAtTime(.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .3);
      },
      tick: () => {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .05);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .05);
      },
      inicio: () => {
        osc.type = 'sine';
        [440,550,660].forEach((f,i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i*.15));
        gain.gain.setValueAtTime(.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .6);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .6);
      },
      fim: () => {
        osc.type = 'sine';
        [784,659,523].forEach((f,i) => osc.frequency.setValueAtTime(f, ctx.currentTime + i*.2));
        gain.gain.setValueAtTime(.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .8);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .8);
      }
    };
    cfg[tipo]?.();
  } catch(e) {}
}

// ============================================================
// SOCKET.IO
// ============================================================
const socket = io();

socket.on('estado_atual', ({ fase, ranking, nivel, materia, totalRodadas }) => {
  if (fase === 'resultado') { mostrarTela('resultado'); renderizarResultadoFinal(ranking); }
  renderizarLobby(ranking);
});

socket.on('atualizar_lobby', ({ jogadores, mensagem }) => {
  renderizarLobby(jogadores);
  mostrarMsgLobby(mensagem);
});

socket.on('jogo_iniciado', ({ nivel, totalRodadas, materia }) => {
  mostrarTela('jogo');
  tocarSom('inicio');

  const nivelNomes = { '4ano':'4º Ano','5ano':'5º Ano','6ano':'6º Ano','7ano':'7º Ano','8ano':'8º Ano','9ano':'9º Ano' };
  document.getElementById('nivel-badge').textContent = nivelNomes[nivel] || nivel;
  atualizarBadgeMateria(materia);
  document.getElementById('meu-emoji-header').textContent = meuEmoji || '👤';
  document.getElementById('meu-nome-header').textContent  = meuNome  || 'Jogador';

  const btn = document.getElementById('btn-proxima-pergunta');
  if (btn) btn.style.display = modoProfsDesbloqueado ? 'block' : 'none';
});

socket.on('nova_pergunta', ({ pergunta, opcoes, tipo, rodada, totalRodadas, tempo, materia }) => {
  jaRespondeu = false; respondeuAudio = false;

  document.getElementById('rodada-info').textContent = `Rodada ${rodada}/${totalRodadas}`;
  document.getElementById('progresso-fill').style.width = '0%';
  document.getElementById('responderam-label').textContent = '0 responderam';

  atualizarBadgeMateria(materia);

  const btn = document.getElementById('btn-proxima-pergunta');
  if (btn && modoProfsDesbloqueado) { btn.disabled = false; btn.textContent = '⏭️ Próxima Pergunta'; }

  renderizarPergunta(pergunta, opcoes, tipo);
  iniciarTimer(tempo);
  esconderFeedback();
});

socket.on('progresso_respostas', ({ responderam, total }) => {
  const pct = total > 0 ? (responderam / total) * 100 : 0;
  document.getElementById('progresso-fill').style.width = pct + '%';
  document.getElementById('responderam-label').textContent = `${responderam} de ${total} responderam`;
});

socket.on('feedback_resposta', ({ correta, resposta }) => {
  mostrarFeedback(correta);
  if (!respondeuAudio) { tocarSom(correta ? 'acerto' : 'erro'); respondeuAudio = true; }
  document.querySelectorAll('.opcao-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === resposta) btn.classList.add(correta ? 'correta' : 'errada');
  });
});

socket.on('fim_rodada', ({ respostaCorreta, respostas, primeiroAcertou, ranking }) => {
  pararTimer(); esconderFeedback();
  document.querySelectorAll('.opcao-btn').forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.add(i === respostaCorreta ? 'correta' : 'errada');
  });
  renderizarRankingLateral(ranking);
  const eu = ranking.find(j => j.id === socket.id);
  if (eu) document.getElementById('meus-pontos-header').textContent = eu.pontos + ' pts';
  if (primeiroAcertou === socket.id) mostrarBadgeRapido();
  const btn = document.getElementById('btn-proxima-pergunta');
  if (btn && modoProfsDesbloqueado) { btn.disabled = false; btn.textContent = '⏭️ Próxima Pergunta'; }
});

socket.on('fim_jogo', ({ ranking }) => {
  tocarSom('fim');
  setTimeout(() => { mostrarTela('resultado'); renderizarResultadoFinal(ranking); }, 500);
});

socket.on('jogo_resetado', ({ ranking }) => {
  mostrarTela('lobby'); renderizarLobby(ranking);
  mostrarMsgLobby('🔄 Jogo resetado! Aguardando o professor iniciar.');
});

socket.on('connect', () => { meuId = socket.id; });

// ============================================================
// UI
// ============================================================

function atualizarBadgeMateria(materia) {
  const badge = document.getElementById('materia-badge');
  if (!badge || !materia) return;
  badge.textContent = MATERIA_NOMES[materia] || materia;
  const cor = MATERIA_CORES[materia] || '#7c3aed';
  badge.style.background = `linear-gradient(135deg, ${cor}, ${cor}aa)`;
}

function selecionarMateria(btn) {
  document.querySelectorAll('.btn-materia').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  materiaSelecionada = btn.dataset.materia;
}

function nomeProbido(nome) {
  const n = nome.toLowerCase().trim();
  return NOMES_PROIBIDOS.some(p => n === p || n.includes(p));
}

function inicializarEmojis() {
  const grid = document.getElementById('emoji-grid');
  grid.innerHTML = '';
  EMOJIS.forEach(em => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = em;
    btn.onclick = () => selecionarEmoji(em, btn);
    grid.appendChild(btn);
  });
}

function selecionarEmoji(emoji, btn) {
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
  btn.classList.add('selecionado');
  emojiSelecionado = emoji;
  document.getElementById('emoji-preview').textContent = `Selecionado: ${emoji}`;
}

function entrarNoLobby() {
  const nome = document.getElementById('input-nome').value.trim();
  if (!nome) { pulsarErro('input-nome'); return; }
  if (!emojiSelecionado) { alert('Selecione um emoji!'); return; }
  if (nomeProbido(nome)) { mostrarAvisoNomeProibido(); pulsarErro('input-nome'); return; }

  meuNome = nome; meuEmoji = emojiSelecionado;
  socket.emit('entrar_lobby', { nome, emoji: emojiSelecionado });

  document.getElementById('btn-entrar').textContent = '✅ Você entrou!';
  document.getElementById('btn-entrar').disabled = true;
  document.getElementById('input-nome').disabled  = true;
  document.querySelectorAll('.emoji-btn').forEach(b => b.disabled = true);
}

function mostrarAvisoNomeProibido() {
  const existente = document.getElementById('aviso-nome-proibido');
  if (existente) existente.remove();
  const aviso = document.createElement('div');
  aviso.id = 'aviso-nome-proibido';
  aviso.style.cssText = `background:rgba(255,60,90,.15);border:2px solid var(--red);border-radius:10px;padding:.8rem 1rem;margin-top:.6rem;color:var(--red);font-size:.88rem;font-weight:700;text-align:center;animation:fadeUp .3s ease;`;
  aviso.innerHTML = `🚫 <strong>Nome não permitido!</strong><br><span style="font-weight:400;font-size:.82rem;">Por favor, escolha outro nome para continuar.</span>`;
  document.getElementById('btn-entrar').before(aviso);
  setTimeout(() => aviso.parentNode && aviso.remove(), 5000);
}

function toggleModoProf() {
  if (modoProfsDesbloqueado) {
    document.getElementById('painel-prof').classList.toggle('oculto'); return;
  }
  const modal = document.getElementById('modal-senha-prof');
  if (modal) { modal.classList.remove('oculto'); document.getElementById('input-senha-prof').value = ''; document.getElementById('input-senha-prof').focus(); document.getElementById('erro-senha-prof').textContent = ''; }
}

function confirmarSenhaProf() {
  const senha = document.getElementById('input-senha-prof').value;
  if (senha === SENHA_PROFESSOR) {
    modoProfsDesbloqueado = true; fecharModalSenha();
    document.getElementById('painel-prof').classList.remove('oculto');
    document.querySelector('.btn-link').textContent = '👨‍🏫 Modo Professor ✅';
  } else {
    const el = document.getElementById('erro-senha-prof');
    el.textContent = '❌ Senha incorreta!';
    document.getElementById('input-senha-prof').style.borderColor = 'var(--red)';
    setTimeout(() => { el.textContent = ''; document.getElementById('input-senha-prof').style.borderColor = ''; }, 2000);
  }
}

function fecharModalSenha() {
  document.getElementById('modal-senha-prof')?.classList.add('oculto');
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input-senha-prof');
  if (input) {
    input.addEventListener('keydown', e => { if (e.key === 'Enter') confirmarSenhaProf(); if (e.key === 'Escape') fecharModalSenha(); });
  }
});

function iniciarJogo() {
  if (!modoProfsDesbloqueado) return;
  const nivel        = document.getElementById('sel-nivel').value;
  const totalRodadas = parseInt(document.getElementById('sel-rodadas').value);
  const materia      = materiaSelecionada;
  socket.emit('iniciar_jogo', { nivel, totalRodadas, materia });
}

function proximaPerguntaProf() {
  if (!modoProfsDesbloqueado) return;
  const btn = document.getElementById('btn-proxima-pergunta');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Aguardando...'; }
  socket.emit('proxima_pergunta');
}

function resetarJogo() { socket.emit('resetar_jogo'); }

function voltarLobby() {
  document.getElementById('btn-entrar').textContent = '🚀 Entrar no Jogo';
  document.getElementById('btn-entrar').disabled    = false;
  document.getElementById('input-nome').disabled    = false;
  document.querySelectorAll('.emoji-btn').forEach(b => b.disabled = false);
  mostrarTela('lobby');
}

function mostrarTela(nome) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const mapa = { lobby:'tela-lobby', jogo:'tela-jogo', resultado:'tela-resultado' };
  document.getElementById(mapa[nome])?.classList.add('ativa');
}

function renderizarLobby(jogadores) {
  const lista = document.getElementById('lista-jogadores');
  if (!jogadores?.length) { lista.innerHTML = '<p class="vazio">Aguardando jogadores...</p>'; return; }
  lista.innerHTML = jogadores.map((j, i) => `
    <div class="jogador-item ${['top1','top2','top3'][i]||''}">
      <span class="jogador-pos">#${i+1}</span>
      <span class="jogador-emoji">${j.emoji}</span>
      <span class="jogador-nome">${escapeHTML(j.nome)}</span>
      <span class="jogador-pts">${j.pontos} pts</span>
    </div>`).join('');
}

function renderizarPergunta(pergunta, opcoes, tipo) {
  const tipoNomes = { multipla:'🔵 Múltipla Escolha', corrigir:'🔴 Corrigir a Frase', completar:'🟡 Completar', interpretacao:'🟢 Interpretação' };
  document.getElementById('tipo-badge').textContent = tipoNomes[tipo] || '🔵 Múltipla Escolha';
  digitarTexto('texto-pergunta', pergunta);
  document.getElementById('opcoes-grid').innerHTML = opcoes.map((op, i) => `
    <button class="opcao-btn" onclick="responder(${i})">
      <span class="opcao-letra">${LETRAS[i]}</span>
      <span>${escapeHTML(op)}</span>
    </button>`).join('');
}

function digitarTexto(id, texto) {
  const el = document.getElementById(id);
  el.textContent = '';
  let i = 0;
  const vel = Math.max(15, Math.min(40, 1200 / texto.length));
  const itv = setInterval(() => { el.textContent += texto[i++]; if (i >= texto.length) clearInterval(itv); }, vel);
}

function responder(indice) {
  if (jaRespondeu) return;
  jaRespondeu = true;
  document.querySelectorAll('.opcao-btn').forEach(b => b.disabled = true);
  document.querySelectorAll('.opcao-btn')[indice]?.classList.add('selecionada');
  socket.emit('responder', { resposta: indice });
}

function iniciarTimer(segundos) {
  pararTimer();
  segundosRestantes = segundos;
  const CIRC = 327;
  const circle = document.getElementById('timer-circle');
  const numero = document.getElementById('timer-numero');
  circle.style.stroke = 'var(--neon1)';
  numero.style.color  = 'var(--text)';
  numero.textContent  = segundos;
  circle.style.strokeDashoffset = 0;

  timerLocal = setInterval(() => {
    segundosRestantes--;
    numero.textContent = segundosRestantes;
    circle.style.strokeDashoffset = CIRC * ((segundos - segundosRestantes) / segundos);
    if      (segundosRestantes <= 3) { circle.style.stroke = 'var(--red)'; numero.style.color = 'var(--red)'; if (segundosRestantes > 0) tocarSom('tick'); }
    else if (segundosRestantes <= 5) { circle.style.stroke = 'var(--neon3)'; }
    if (segundosRestantes <= 0) { pararTimer(); circle.style.strokeDashoffset = CIRC; }
  }, 1000);
}

function pararTimer() { if (timerLocal) { clearInterval(timerLocal); timerLocal = null; } }

function mostrarFeedback(correta) {
  const overlay = document.getElementById('feedback-overlay');
  const box     = document.getElementById('feedback-box');
  document.getElementById('feedback-overlay').classList.remove('oculto');
  box.className = 'feedback-box ' + (correta ? 'acerto' : 'erro');
  document.getElementById('feedback-icon').textContent  = correta ? '✅' : '❌';
  document.getElementById('feedback-texto').textContent = correta ? 'Correto!' : 'Errou!';
  document.getElementById('feedback-pts').textContent   = correta ? '+10 pontos' : '-5 pontos';
  setTimeout(esconderFeedback, 2000);
}

function esconderFeedback() { document.getElementById('feedback-overlay').classList.add('oculto'); }

function mostrarBadgeRapido() {
  const badge = document.createElement('div');
  badge.className = 'badge-rapido';
  badge.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:300;background:linear-gradient(135deg,var(--neon3),#ff9100);color:#000;font-family:'Orbitron',sans-serif;font-weight:900;padding:1rem 2rem;border-radius:20px;font-size:1.2rem;animation:popIn .3s ease,fadeOut .5s ease 1.5s forwards;box-shadow:0 0 40px rgba(249,200,14,.4);`;
  badge.textContent = '⚡ Mais Rápido! +5 bônus!';
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 2500);
}

function renderizarRankingLateral(ranking) {
  document.getElementById('ranking-lista').innerHTML = ranking.map((j, i) => `
    <div class="rank-item ${['top1','top2','top3'][i]||''}">
      <span class="rank-pos">${getMedal(i)}</span>
      <span class="rank-emoji">${j.emoji}</span>
      <span class="rank-nome">${escapeHTML(j.nome)}</span>
      <span class="rank-pts">${j.pontos}</span>
    </div>`).join('');
}

function renderizarResultadoFinal(ranking) {
  const top3     = ranking.slice(0, 3);
  const medalhas = ['🥇','🥈','🥉'];
  const coroas   = ['👑','🌟','⭐'];

  document.getElementById('podio').innerHTML = top3.map((j, i) => `
    <div class="podio-item" style="animation-delay:${i*.15}s">
      <span class="podio-coroa">${coroas[i]}</span>
      <span class="podio-emoji">${j.emoji}</span>
      <p class="podio-nome">${escapeHTML(j.nome)}</p>
      <p class="podio-pts">${j.pontos} pts</p>
      <span>${medalhas[i]}</span>
    </div>`).join('');

  document.getElementById('ranking-final').innerHTML = ranking.map((j, i) => `
    <div class="ranking-final-item">
      <span class="rf-pos">${i+1}º</span>
      <span class="rf-emoji">${j.emoji}</span>
      <span class="rf-nome">${escapeHTML(j.nome)}</span>
      <span class="rf-pts">${j.pontos} pts</span>
    </div>`).join('');
}

function mostrarMsgLobby(msg) {
  const el = document.getElementById('msg-lobby');
  if (!el) return;
  el.textContent = msg; el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 4000);
}

function getMedal(i) { return ['🥇','🥈','🥉'][i] || `${i+1}º`; }

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function pulsarErro(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = 'var(--red)';
  el.classList.add('anim-shake');
  setTimeout(() => { el.style.borderColor = ''; el.classList.remove('anim-shake'); }, 500);
}

const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { to { opacity:0; transform:translate(-50%,-50%) scale(.8); } }`;
document.head.appendChild(style);

// ============================================================
// INIT
// ============================================================
inicializarEmojis();