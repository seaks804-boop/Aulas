// ============================================================
// BATALHA DA GRAMÁTICA — script.js (cliente)
// ============================================================

// ---- EMOJIS DISPONÍVEIS ----
const EMOJIS = [
  '😎','🔥','👑','🐱','⚡','🦊','🐸','🌟','🎮','💎',
  '🦁','🐯','🐺','🦅','🦋','🌈','🎯','🚀','🏆','💜',
  '😈','🤖','👾','🎭','🧠','🦄','🐉','🌊','⚔️','🛡️',
  '🍎','🎸','🎵','🌙','☀️','❄️','🌺','🍀','🦊','🎩'
];

// ---- LETRAS DAS OPÇÕES ----
const LETRAS = ['A', 'B', 'C', 'D'];

// ---- NOMES PROIBIDOS ----
const NOMES_PROIBIDOS = [
  'eipstein', 'eipsten', 'diddy', 'p.diddy', 'p diddy',
  'adolf', 'hitler', 'adolf hitler'
];

// ---- SENHA DO PROFESSOR ----
const SENHA_PROFESSOR = '2054';

// ---- ESTADO LOCAL ----
let meuId = null;
let meuNome = '';
let meuEmoji = '';
let emojiSelecionado = '';
let timerLocal = null;
let segundosRestantes = 10;
let jaRespondeu = false;
let totalJogadoresAtual = 0;
let respondeuAudio = false;
let modoProfsDesbloqueado = false;

// ---- CONTEXTO DE ÁUDIO ----
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// ---- SOM SINTÉTICO ----
function tocarSom(tipo) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tipo === 'acerto') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (tipo === 'erro') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (tipo === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (tipo === 'inicio') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(550, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (tipo === 'fim') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(523, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch (e) { /* áudio pode falhar silenciosamente */ }
}

// ============================================================
// SOCKET.IO
// ============================================================
const socket = io();

// ---- ESTADO ATUAL ----
socket.on('estado_atual', ({ fase, ranking, nivel, totalRodadas }) => {
  if (fase === 'resultado') {
    mostrarTela('resultado');
    renderizarResultadoFinal(ranking);
  }
  renderizarLobby(ranking);
});

// ---- ATUALIZAR LOBBY ----
socket.on('atualizar_lobby', ({ jogadores, mensagem }) => {
  renderizarLobby(jogadores);
  mostrarMsgLobby(mensagem);
});

// ---- JOGO INICIADO ----
socket.on('jogo_iniciado', ({ nivel, totalRodadas }) => {
  mostrarTela('jogo');
  tocarSom('inicio');

  const nivelNomes = { '4ano':'4º Ano','5ano':'5º Ano','6ano':'6º Ano','7ano':'7º Ano','8ano':'8º Ano','9ano':'9º Ano' };
  document.getElementById('nivel-badge').textContent = nivelNomes[nivel] || nivel;
  document.getElementById('meu-emoji-header').textContent = meuEmoji || '👤';
  document.getElementById('meu-nome-header').textContent = meuNome || 'Jogador';

  // Mostrar botão próxima pergunta só se for professor
  const btnProxima = document.getElementById('btn-proxima-pergunta');
  if (btnProxima) btnProxima.style.display = modoProfsDesbloqueado ? 'block' : 'none';
});

// ---- NOVA PERGUNTA ----
socket.on('nova_pergunta', ({ pergunta, opcoes, tipo, rodada, totalRodadas, tempo }) => {
  jaRespondeu = false;
  respondeuAudio = false;

  document.getElementById('rodada-info').textContent = `Rodada ${rodada}/${totalRodadas}`;
  document.getElementById('progresso-fill').style.width = '0%';
  document.getElementById('responderam-label').textContent = '0 responderam';

  // Habilitar botão próxima pergunta para professor
  const btnProxima = document.getElementById('btn-proxima-pergunta');
  if (btnProxima && modoProfsDesbloqueado) {
    btnProxima.disabled = false;
    btnProxima.textContent = '⏭️ Próxima Pergunta';
  }

  renderizarPergunta(pergunta, opcoes, tipo);
  iniciarTimer(tempo);
  esconderFeedback();
});

// ---- PROGRESSO DAS RESPOSTAS ----
socket.on('progresso_respostas', ({ responderam, total }) => {
  totalJogadoresAtual = total;
  const pct = total > 0 ? (responderam / total) * 100 : 0;
  document.getElementById('progresso-fill').style.width = pct + '%';
  document.getElementById('responderam-label').textContent = `${responderam} de ${total} responderam`;
});

// ---- FEEDBACK INDIVIDUAL ----
socket.on('feedback_resposta', ({ correta, resposta }) => {
  mostrarFeedback(correta);
  if (!respondeuAudio) {
    tocarSom(correta ? 'acerto' : 'erro');
    respondeuAudio = true;
  }
  const botoes = document.querySelectorAll('.opcao-btn');
  botoes.forEach((btn, i) => {
    btn.disabled = true;
    if (i === resposta) {
      btn.classList.add(correta ? 'correta' : 'errada');
    }
  });
});

// ---- FIM DA RODADA ----
socket.on('fim_rodada', ({ respostaCorreta, respostas, primeiroAcertou, ranking }) => {
  pararTimer();
  esconderFeedback();

  const botoes = document.querySelectorAll('.opcao-btn');
  botoes.forEach((btn, i) => {
    btn.disabled = true;
    if (i === respostaCorreta) btn.classList.add('correta');
    else btn.classList.add('errada');
  });

  renderizarRankingLateral(ranking);

  const eu = ranking.find(j => j.id === socket.id);
  if (eu) {
    document.getElementById('meus-pontos-header').textContent = eu.pontos + ' pts';
  }

  if (primeiroAcertou === socket.id) {
    mostrarBadgeRapido();
  }

  // Habilitar botão próxima pergunta após fim da rodada
  const btnProxima = document.getElementById('btn-proxima-pergunta');
  if (btnProxima && modoProfsDesbloqueado) {
    btnProxima.disabled = false;
    btnProxima.textContent = '⏭️ Próxima Pergunta';
  }
});

// ---- FIM DO JOGO ----
socket.on('fim_jogo', ({ ranking }) => {
  tocarSom('fim');
  setTimeout(() => {
    mostrarTela('resultado');
    renderizarResultadoFinal(ranking);
  }, 500);
});

// ---- JOGO RESETADO ----
socket.on('jogo_resetado', ({ ranking }) => {
  mostrarTela('lobby');
  renderizarLobby(ranking);
  mostrarMsgLobby('🔄 Jogo resetado! Aguardando o professor iniciar.');
});

// ============================================================
// FUNÇÕES DE UI
// ============================================================

// ---- VERIFICAR NOME PROIBIDO ----
function nomeProbido(nome) {
  const nomeLower = nome.toLowerCase().trim();
  return NOMES_PROIBIDOS.some(proibido => nomeLower === proibido || nomeLower.includes(proibido));
}

// ---- INICIALIZAR EMOJIS ----
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

// ---- ENTRAR NO LOBBY ----
function entrarNoLobby() {
  const nome = document.getElementById('input-nome').value.trim();
  if (!nome) { pulsarErro('input-nome'); return; }
  if (!emojiSelecionado) { alert('Selecione um emoji!'); return; }

  // Verificar nome proibido
  if (nomeProbido(nome)) {
    mostrarAvisoNomeProibido();
    pulsarErro('input-nome');
    return;
  }

  meuNome = nome;
  meuEmoji = emojiSelecionado;

  socket.emit('entrar_lobby', { nome, emoji: emojiSelecionado });

  document.getElementById('btn-entrar').textContent = '✅ Você entrou!';
  document.getElementById('btn-entrar').disabled = true;
  document.getElementById('input-nome').disabled = true;
  document.querySelectorAll('.emoji-btn').forEach(b => b.disabled = true);
}

// ---- AVISO NOME PROIBIDO ----
function mostrarAvisoNomeProibido() {
  // Remover aviso anterior se existir
  const existente = document.getElementById('aviso-nome-proibido');
  if (existente) existente.remove();

  const aviso = document.createElement('div');
  aviso.id = 'aviso-nome-proibido';
  aviso.style.cssText = `
    background: rgba(255,60,90,0.15);
    border: 2px solid var(--red);
    border-radius: 10px;
    padding: 0.8rem 1rem;
    margin-top: 0.6rem;
    color: var(--red);
    font-size: 0.88rem;
    font-weight: 700;
    text-align: center;
    animation: fadeUp 0.3s ease;
  `;
  aviso.innerHTML = `
    🚫 <strong>Nome não permitido!</strong><br>
    <span style="font-weight:400;font-size:0.82rem;">Por favor, escolha outro nome para continuar.</span>
  `;

  const campo = document.querySelector('.campo');
  campo.parentNode.insertBefore(aviso, document.getElementById('btn-entrar'));

  // Auto remover após 5 segundos
  setTimeout(() => {
    if (aviso.parentNode) aviso.remove();
  }, 5000);
}

// ---- TOGGLE MODO PROFESSOR ----
function toggleModoProf() {
  if (modoProfsDesbloqueado) {
    // Já desbloqueado, apenas mostrar/esconder
    const painel = document.getElementById('painel-prof');
    painel.classList.toggle('oculto');
    return;
  }

  // Pedir senha
  const modal = document.getElementById('modal-senha-prof');
  if (modal) {
    modal.classList.remove('oculto');
    document.getElementById('input-senha-prof').value = '';
    document.getElementById('input-senha-prof').focus();
    document.getElementById('erro-senha-prof').textContent = '';
  }
}

function confirmarSenhaProf() {
  const senha = document.getElementById('input-senha-prof').value;
  if (senha === SENHA_PROFESSOR) {
    modoProfsDesbloqueado = true;
    fecharModalSenha();
    const painel = document.getElementById('painel-prof');
    painel.classList.remove('oculto');
    document.querySelector('.btn-link').textContent = '👨‍🏫 Modo Professor ✅';
  } else {
    const erroEl = document.getElementById('erro-senha-prof');
    erroEl.textContent = '❌ Senha incorreta!';
    document.getElementById('input-senha-prof').style.borderColor = 'var(--red)';
    setTimeout(() => {
      erroEl.textContent = '';
      document.getElementById('input-senha-prof').style.borderColor = '';
    }, 2000);
  }
}

function fecharModalSenha() {
  const modal = document.getElementById('modal-senha-prof');
  if (modal) modal.classList.add('oculto');
}

// Confirmar senha com Enter
document.addEventListener('DOMContentLoaded', () => {
  const inputSenha = document.getElementById('input-senha-prof');
  if (inputSenha) {
    inputSenha.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmarSenhaProf();
      if (e.key === 'Escape') fecharModalSenha();
    });
  }
});

// ---- INICIAR JOGO ----
function iniciarJogo() {
  if (!modoProfsDesbloqueado) return;
  const nivel = document.getElementById('sel-nivel').value;
  const totalRodadas = parseInt(document.getElementById('sel-rodadas').value);
  socket.emit('iniciar_jogo', { nivel, totalRodadas });
}

// ---- PRÓXIMA PERGUNTA (professor) ----
function proximaPerguntaProf() {
  if (!modoProfsDesbloqueado) return;
  const btn = document.getElementById('btn-proxima-pergunta');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Aguardando...';
  }
  socket.emit('proxima_pergunta');
}

// ---- RESETAR ----
function resetarJogo() {
  socket.emit('resetar_jogo');
}

// ---- VOLTAR LOBBY ----
function voltarLobby() {
  document.getElementById('btn-entrar').textContent = '🚀 Entrar no Jogo';
  document.getElementById('btn-entrar').disabled = false;
  document.getElementById('input-nome').disabled = false;
  document.querySelectorAll('.emoji-btn').forEach(b => b.disabled = false);
  mostrarTela('lobby');
}

// ---- MOSTRAR TELA ----
function mostrarTela(nome) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const mapa = { lobby: 'tela-lobby', jogo: 'tela-jogo', resultado: 'tela-resultado' };
  document.getElementById(mapa[nome])?.classList.add('ativa');
}

// ---- RENDERIZAR LOBBY ----
function renderizarLobby(jogadores) {
  const lista = document.getElementById('lista-jogadores');
  if (!jogadores || jogadores.length === 0) {
    lista.innerHTML = '<p class="vazio">Aguardando jogadores...</p>';
    return;
  }
  lista.innerHTML = jogadores.map((j, i) => `
    <div class="jogador-item ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">
      <span class="jogador-pos">#${i + 1}</span>
      <span class="jogador-emoji">${j.emoji}</span>
      <span class="jogador-nome">${escapeHTML(j.nome)}</span>
      <span class="jogador-pts">${j.pontos} pts</span>
    </div>
  `).join('');
}

// ---- RENDERIZAR PERGUNTA ----
function renderizarPergunta(pergunta, opcoes, tipo) {
  const tipoNomes = {
    multipla: '🔵 Múltipla Escolha',
    corrigir: '🔴 Corrigir a Frase',
    completar: '🟡 Completar',
    interpretacao: '🟢 Interpretação'
  };

  document.getElementById('tipo-badge').textContent = tipoNomes[tipo] || '🔵 Múltipla Escolha';
  digitarTexto('texto-pergunta', pergunta);

  const grid = document.getElementById('opcoes-grid');
  grid.innerHTML = opcoes.map((op, i) => `
    <button class="opcao-btn" onclick="responder(${i})">
      <span class="opcao-letra">${LETRAS[i]}</span>
      <span>${escapeHTML(op)}</span>
    </button>
  `).join('');
}

// ---- EFEITO DIGITAÇÃO ----
function digitarTexto(elementId, texto) {
  const el = document.getElementById(elementId);
  el.textContent = '';
  let i = 0;
  const vel = Math.max(15, Math.min(40, 1200 / texto.length));
  const intervalo = setInterval(() => {
    el.textContent += texto[i];
    i++;
    if (i >= texto.length) clearInterval(intervalo);
  }, vel);
}

// ---- RESPONDER ----
function responder(indice) {
  if (jaRespondeu) return;
  jaRespondeu = true;

  const botoes = document.querySelectorAll('.opcao-btn');
  botoes.forEach(b => b.disabled = true);
  botoes[indice]?.classList.add('selecionada');

  socket.emit('responder', { resposta: indice });
}

// ---- TIMER ----
function iniciarTimer(segundos) {
  pararTimer();
  segundosRestantes = segundos;
  const CIRCUNFERENCIA = 327;

  const circle = document.getElementById('timer-circle');
  const numero = document.getElementById('timer-numero');

  circle.style.stroke = 'var(--neon1)';
  numero.style.color = 'var(--text)';
  numero.textContent = segundos;
  circle.style.strokeDashoffset = 0;

  timerLocal = setInterval(() => {
    segundosRestantes--;
    numero.textContent = segundosRestantes;

    const progresso = (segundos - segundosRestantes) / segundos;
    circle.style.strokeDashoffset = CIRCUNFERENCIA * progresso;

    if (segundosRestantes <= 3) {
      circle.style.stroke = 'var(--red)';
      numero.style.color = 'var(--red)';
      if (segundosRestantes > 0) tocarSom('tick');
    } else if (segundosRestantes <= 5) {
      circle.style.stroke = 'var(--neon3)';
    }

    if (segundosRestantes <= 0) {
      pararTimer();
      circle.style.strokeDashoffset = CIRCUNFERENCIA;
    }
  }, 1000);
}

function pararTimer() {
  if (timerLocal) { clearInterval(timerLocal); timerLocal = null; }
}

// ---- MOSTRAR FEEDBACK ----
function mostrarFeedback(correta) {
  const overlay = document.getElementById('feedback-overlay');
  const box = document.getElementById('feedback-box');
  const icon = document.getElementById('feedback-icon');
  const texto = document.getElementById('feedback-texto');
  const pts = document.getElementById('feedback-pts');

  overlay.classList.remove('oculto');
  box.className = 'feedback-box ' + (correta ? 'acerto' : 'erro');
  icon.textContent = correta ? '✅' : '❌';
  texto.textContent = correta ? 'Correto!' : 'Errou!';
  pts.textContent = correta ? '+10 pontos' : '-5 pontos';

  setTimeout(esconderFeedback, 2000);
}

function esconderFeedback() {
  document.getElementById('feedback-overlay').classList.add('oculto');
}

// ---- BADGE RAPIDEZ ----
function mostrarBadgeRapido() {
  const badge = document.createElement('div');
  badge.className = 'badge-rapido';
  badge.style.cssText = `
    position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    z-index:300;background:linear-gradient(135deg,var(--neon3),#ff9100);
    color:#000;font-family:'Orbitron',sans-serif;font-weight:900;
    padding:1rem 2rem;border-radius:20px;font-size:1.2rem;
    animation:popIn 0.3s ease, fadeOut 0.5s ease 1.5s forwards;
    box-shadow:0 0 40px rgba(249,200,14,0.4);
  `;
  badge.textContent = '⚡ Mais Rápido! +5 bônus!';
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 2500);
}

// ---- RANKING LATERAL ----
function renderizarRankingLateral(ranking) {
  const lista = document.getElementById('ranking-lista');
  lista.innerHTML = ranking.map((j, i) => `
    <div class="rank-item ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">
      <span class="rank-pos">${getMedal(i)}</span>
      <span class="rank-emoji">${j.emoji}</span>
      <span class="rank-nome">${escapeHTML(j.nome)}</span>
      <span class="rank-pts">${j.pontos}</span>
    </div>
  `).join('');
}

// ---- RESULTADO FINAL ----
function renderizarResultadoFinal(ranking) {
  const podio = document.getElementById('podio');
  const top3 = ranking.slice(0, 3);
  const medalhas = ['🥇', '🥈', '🥉'];
  const coroas = ['👑', '🌟', '⭐'];

  podio.innerHTML = top3.map((j, i) => `
    <div class="podio-item" style="animation-delay:${i * 0.15}s">
      <span class="podio-coroa">${coroas[i]}</span>
      <span class="podio-emoji">${j.emoji}</span>
      <p class="podio-nome">${escapeHTML(j.nome)}</p>
      <p class="podio-pts">${j.pontos} pts</p>
      <span>${medalhas[i]}</span>
    </div>
  `).join('');

  const rankFinal = document.getElementById('ranking-final');
  rankFinal.innerHTML = ranking.map((j, i) => `
    <div class="ranking-final-item">
      <span class="rf-pos">${i + 1}º</span>
      <span class="rf-emoji">${j.emoji}</span>
      <span class="rf-nome">${escapeHTML(j.nome)}</span>
      <span class="rf-pts">${j.pontos} pts</span>
    </div>
  `).join('');
}

// ---- MENSAGEM LOBBY ----
function mostrarMsgLobby(msg) {
  const el = document.getElementById('msg-lobby');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 4000);
}

// ---- UTILITÁRIOS ----
function getMedal(i) {
  return ['🥇', '🥈', '🥉'][i] || `${i + 1}º`;
}

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

// ---- ESTILO FADEOUT ----
const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { to { opacity: 0; transform: translate(-50%,-50%) scale(0.8); } }`;
document.head.appendChild(style);

// ============================================================
// INICIALIZAR
// ============================================================
inicializarEmojis();
socket.on('connect', () => { meuId = socket.id; });