// ============================================================
// BATALHA DA GRAMÁTICA - Servidor Node.js + Socket.io
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Servir arquivos estáticos da pasta /public
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// BANCO DE PERGUNTAS - Edite aqui para adicionar mais!
// ============================================================
const PERGUNTAS = {
  '4ano': [
    {
      pergunta: 'Qual palavra está escrita corretamente?',
      opcoes: ['Bicicreta', 'Bicicleta', 'Biscicleta', 'Biciscleta'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Complete: "Ontem eu ___ ao parque."',
      opcoes: ['vai', 'fui', 'vou', 'ido'],
      correta: 1,
      tipo: 'completar'
    },
    {
      pergunta: 'Qual frase está correta?',
      opcoes: ['Eu gosto muito de sorvete.', 'Eu gosta muito de sorvete.', 'Eu gostas muito de sorvete.', 'Eu gostam muito de sorvete.'],
      correta: 0,
      tipo: 'corrigir'
    },
    {
      pergunta: 'Quantas sílabas tem a palavra "borboleta"?',
      opcoes: ['2 sílabas', '3 sílabas', '4 sílabas', '5 sílabas'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: 'Qual é o plural de "pão"?',
      opcoes: ['Pãos', 'Pães', 'Pão', 'Pão-s'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'O que é um substantivo?',
      opcoes: ['Palavra que indica ação', 'Palavra que dá nome a seres, coisas e lugares', 'Palavra que liga outras palavras', 'Palavra que qualifica algo'],
      correta: 1,
      tipo: 'multipla'
    }
  ],
  '5ano': [
    {
      pergunta: 'Qual frase usa corretamente a vírgula?',
      opcoes: ['Maria, foi ao mercado.', 'João, Pedro e Ana foram à festa.', 'Eu gosto, de sorvete.', 'O cachorro, late muito.'],
      correta: 1,
      tipo: 'corrigir'
    },
    {
      pergunta: 'Complete com a opção correta: "Ele ___ muito estudioso."',
      opcoes: ['são', 'somos', 'é', 'sou'],
      correta: 2,
      tipo: 'completar'
    },
    {
      pergunta: 'Qual palavra é um adjetivo?',
      opcoes: ['Correr', 'Beleza', 'Bonito', 'Casa'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: 'Qual é o antônimo de "alegre"?',
      opcoes: ['Feliz', 'Contente', 'Triste', 'Animado'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: '"O gato bebeu o leite." Quem praticou a ação?',
      opcoes: ['O leite', 'O gato', 'Bebeu', 'Ninguém'],
      correta: 1,
      tipo: 'interpretacao'
    },
    {
      pergunta: 'Qual palavra tem acento?',
      opcoes: ['Cafe', 'Mesa', 'Avó', 'Bola'],
      correta: 2,
      tipo: 'multipla'
    }
  ],
  '6ano': [
    {
      pergunta: 'Qual frase está na voz passiva?',
      opcoes: ['O aluno estudou a lição.', 'A lição foi estudada pelo aluno.', 'Eu vou estudar amanhã.', 'Estudar é importante.'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Identifique o sujeito: "Correu muito o atleta cansado."',
      opcoes: ['Correu muito', 'O atleta cansado', 'Muito o atleta', 'Cansado'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Qual é o sinônimo de "ágil"?',
      opcoes: ['Lento', 'Preguiçoso', 'Rápido', 'Cansado'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: '"Mal" ou "mau"? "O menino ___ procedeu ontem."',
      opcoes: ['mau', 'mal', 'mál', 'maul'],
      correta: 1,
      tipo: 'completar'
    },
    {
      pergunta: 'Qual é o grau aumentativo de "casa"?',
      opcoes: ['Casinha', 'Casarão', 'Casamento', 'Casal'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Que tipo de sujeito tem a frase: "Choveu muito ontem"?',
      opcoes: ['Sujeito simples', 'Sujeito composto', 'Sujeito indeterminado', 'Sujeito inexistente'],
      correta: 3,
      tipo: 'multipla'
    }
  ],
  '7ano': [
    {
      pergunta: 'Qual alternativa usa corretamente "por que", "porque", "por quê" ou "porquê"?\n"___ você chegou tarde?"',
      opcoes: ['Porque você chegou tarde?', 'Por que você chegou tarde?', 'Por quê você chegou tarde?', 'Porquê você chegou tarde?'],
      correta: 1,
      tipo: 'corrigir'
    },
    {
      pergunta: 'Qual é a função do pronome relativo em: "O livro que li era ótimo."',
      opcoes: ['Sujeito', 'Objeto direto', 'Retomar o antecedente "livro"', 'Predicativo'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: 'Assinale a oração com predicado nominal:',
      opcoes: ['Maria correu no parque.', 'O céu está nublado.', 'Ele comeu o bolo.', 'Nós viajamos ontem.'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: '"Há" ou "a"? "Faz ___ dois anos que não a vejo."',
      opcoes: ['a', 'há', 'ah', 'à'],
      correta: 1,
      tipo: 'completar'
    },
    {
      pergunta: 'Qual figura de linguagem está em: "Meus olhos são dois oceanos"?',
      opcoes: ['Metonímia', 'Hipérbole', 'Metáfora', 'Ironia'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: 'Em "Não fui à festa." o "à" indica:',
      opcoes: ['Crase obrigatória', 'Simples preposição', 'Artigo apenas', 'Não existe crase aqui'],
      correta: 0,
      tipo: 'multipla'
    }
  ],
  '8ano': [
    {
      pergunta: 'Qual período é composto por subordinação?',
      opcoes: ['Cheguei e fui dormir.', 'Espero que você venha.', 'Ele saiu, mas ela ficou.', 'Vai logo ou fica!'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Que tipo de oração é "para que todos entendessem"?',
      opcoes: ['Oração subordinada adverbial causal', 'Oração subordinada adverbial final', 'Oração subordinada substantiva', 'Oração coordenada'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'Identifique a figura de linguagem: "O silêncio gritou no corredor."',
      opcoes: ['Hipérbole', 'Paradoxo', 'Personificação', 'Eufemismo'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: 'Complete corretamente: "Vou a ___ cidade amanhã."',
      opcoes: ['a', 'à', 'há', 'ah'],
      correta: 0,
      tipo: 'completar'
    },
    {
      pergunta: 'Qual é o modo verbal de "Estude mais!"?',
      opcoes: ['Indicativo', 'Subjuntivo', 'Imperativo', 'Infinitivo'],
      correta: 2,
      tipo: 'multipla'
    },
    {
      pergunta: '"Embora estivesse cansado, ele trabalhou." A oração subordinada é:',
      opcoes: ['Causal', 'Concessiva', 'Condicional', 'Comparativa'],
      correta: 1,
      tipo: 'multipla'
    }
  ],
  '9ano': [
    {
      pergunta: 'Em qual alternativa há erro de regência verbal?',
      opcoes: ['Eu assisti ao filme.', 'Ela aspirou o pó da sala.', 'Nós preferimos isso a aquilo.', 'Ele visou ao cargo público.'],
      correta: 1,
      tipo: 'corrigir'
    },
    {
      pergunta: 'Qual alternativa está com a concordância nominal CORRETA?',
      opcoes: ['Ela mesma fez o trabalho.', 'Ela mesmo fez o trabalho.', 'Ela mesmos fez o trabalho.', 'Ela mesmas fez o trabalho.'],
      correta: 0,
      tipo: 'multipla'
    },
    {
      pergunta: 'Qual é o sujeito de "Convém que todos compareçam"?',
      opcoes: ['Todos', 'Que todos compareçam', 'Convém', 'Não tem sujeito'],
      correta: 1,
      tipo: 'multipla'
    },
    {
      pergunta: 'A frase "O candidato que mais votos receber vencerá" contém:',
      opcoes: ['Oração subordinada adjetiva restritiva', 'Oração subordinada adjetiva explicativa', 'Oração subordinada substantiva', 'Oração coordenada assindética'],
      correta: 0,
      tipo: 'multipla'
    },
    {
      pergunta: '"Vende-se casas." — Esta frase contém erro de:',
      opcoes: ['Regência', 'Concordância verbal', 'Colocação pronominal', 'Crase'],
      correta: 1,
      tipo: 'corrigir'
    },
    {
      pergunta: 'Qual figura de linguagem há em "Morte, vida — dois lados da mesma moeda"?',
      opcoes: ['Ironia', 'Antítese', 'Eufemismo', 'Pleonasmo'],
      correta: 1,
      tipo: 'multipla'
    }
  ]
};

// ============================================================
// ESTADO DO JOGO
// ============================================================
let estado = {
  fase: 'lobby',          // lobby | jogando | resultado
  jogadores: {},          // { socketId: { nome, emoji, pontos, respondeu } }
  nivelAtual: '6ano',
  perguntaAtual: null,
  indicePergunta: -1,
  perguntasUsadas: [],
  timerPergunta: null,
  primeiroAcertou: null,  // socketId de quem acertou primeiro
  totalRodadas: 10,
  rodadaAtual: 0,
  respostasRodada: {}     // { socketId: { resposta, tempo, correta } }
};

// ============================================================
// UTILITÁRIOS
// ============================================================
function getRanking() {
  return Object.entries(estado.jogadores)
    .map(([id, j]) => ({ id, nome: j.nome, emoji: j.emoji, pontos: j.pontos }))
    .sort((a, b) => b.pontos - a.pontos);
}

function proximaPergunta() {
  const nivel = PERGUNTAS[estado.nivelAtual];
  const disponíveis = nivel.filter((_, i) => !estado.perguntasUsadas.includes(i));

  if (disponíveis.length === 0) {
    estado.perguntasUsadas = [];
  }

  const pool = nivel.filter((_, i) => !estado.perguntasUsadas.includes(i));
  const indice = nivel.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  estado.perguntasUsadas.push(indice);
  estado.indicePergunta = indice;
  return nivel[indice];
}

function encerrarRodada() {
  clearTimeout(estado.timerPergunta);

  // Calcular resultados
  const corretas = Object.entries(estado.respostasRodada);
  let primeiro = null;
  let menorTempo = Infinity;

  corretas.forEach(([id, r]) => {
    if (r.correta && r.tempo < menorTempo) {
      menorTempo = r.tempo;
      primeiro = id;
    }
  });

  // Aplicar pontuação
  Object.entries(estado.respostasRodada).forEach(([id, r]) => {
    if (!estado.jogadores[id]) return;
    if (r.correta) {
      estado.jogadores[id].pontos += 10;
      if (id === primeiro) estado.jogadores[id].pontos += 5; // bônus velocidade
    } else {
      estado.jogadores[id].pontos = Math.max(0, estado.jogadores[id].pontos - 5);
    }
  });

  // Jogadores que não responderam perdem pontos
  Object.keys(estado.jogadores).forEach(id => {
    if (!estado.respostasRodada[id]) {
      estado.jogadores[id].pontos = Math.max(0, estado.jogadores[id].pontos - 2);
    }
  });

  const respostaCerta = estado.perguntaAtual.correta;
  io.emit('fim_rodada', {
    respostaCorreta: respostaCerta,
    respostas: estado.respostasRodada,
    primeiroAcertou: primeiro,
    ranking: getRanking()
  });

  estado.rodadaAtual++;

  if (estado.rodadaAtual >= estado.totalRodadas) {
    // Fim de jogo
    setTimeout(() => {
      estado.fase = 'resultado';
      io.emit('fim_jogo', { ranking: getRanking() });
    }, 3500);
  }
}

// ============================================================
// CONEXÕES SOCKET.IO
// ============================================================
io.on('connection', (socket) => {
  console.log(`✅ Conectado: ${socket.id}`);

  // Enviar estado atual para quem entrou
  socket.emit('estado_atual', {
    fase: estado.fase,
    ranking: getRanking(),
    nivel: estado.nivelAtual,
    totalRodadas: estado.totalRodadas
  });

  // ---------- ENTRAR NO LOBBY ----------
  socket.on('entrar_lobby', ({ nome, emoji }) => {
    if (!nome || !emoji) return;

    estado.jogadores[socket.id] = {
      nome: nome.trim().substring(0, 20),
      emoji,
      pontos: 0,
      respondeu: false
    };

    console.log(`👤 ${emoji} ${nome} entrou`);
    io.emit('atualizar_lobby', {
      jogadores: getRanking(),
      mensagem: `${emoji} ${nome} entrou no jogo!`
    });
  });

  // ---------- INICIAR JOGO (professor) ----------
  socket.on('iniciar_jogo', ({ nivel, totalRodadas }) => {
    if (Object.keys(estado.jogadores).length < 1) return;

    estado.fase = 'jogando';
    estado.nivelAtual = nivel || '6ano';
    estado.totalRodadas = totalRodadas || 10;
    estado.rodadaAtual = 0;
    estado.perguntasUsadas = [];

    // Zerar pontos
    Object.keys(estado.jogadores).forEach(id => {
      estado.jogadores[id].pontos = 0;
    });

    io.emit('jogo_iniciado', {
      nivel: estado.nivelAtual,
      totalRodadas: estado.totalRodadas
    });

    console.log(`🎮 Jogo iniciado! Nível: ${nivel}, Rodadas: ${totalRodadas}`);

    // Pequeno delay antes da primeira pergunta
    setTimeout(enviarPergunta, 2000);
  });

  // ---------- PRÓXIMA PERGUNTA (professor) ----------
  socket.on('proxima_pergunta', () => {
    if (estado.fase !== 'jogando') return;
    clearTimeout(estado.timerPergunta);
    enviarPergunta();
  });

  // ---------- RESPOSTA DO JOGADOR ----------
  socket.on('responder', ({ resposta }) => {
    if (estado.fase !== 'jogando') return;
    if (!estado.jogadores[socket.id]) return;
    if (estado.respostasRodada[socket.id]) return; // já respondeu

    const agora = Date.now();
    const correta = resposta === estado.perguntaAtual.correta;

    estado.respostasRodada[socket.id] = {
      resposta,
      tempo: agora - estado.tempoInicioPergunta,
      correta
    };

    // Feedback privado para o jogador
    socket.emit('feedback_resposta', { correta, resposta });

    // Informar todos quantos já responderam
    const totalRespostas = Object.keys(estado.respostasRodada).length;
    const totalJogadores = Object.keys(estado.jogadores).length;

    io.emit('progresso_respostas', {
      responderam: totalRespostas,
      total: totalJogadores
    });

    // Se todos responderam, encerrar rodada
    if (totalRespostas >= totalJogadores) {
      encerrarRodada();
    }
  });

  // ---------- RESETAR JOGO ----------
  socket.on('resetar_jogo', () => {
    clearTimeout(estado.timerPergunta);
    estado.fase = 'lobby';
    estado.rodadaAtual = 0;
    estado.perguntasUsadas = [];
    estado.perguntaAtual = null;

    Object.keys(estado.jogadores).forEach(id => {
      estado.jogadores[id].pontos = 0;
    });

    io.emit('jogo_resetado', { ranking: getRanking() });
    console.log('🔄 Jogo resetado');
  });

  // ---------- DESCONEXÃO ----------
  socket.on('disconnect', () => {
    if (estado.jogadores[socket.id]) {
      const j = estado.jogadores[socket.id];
      console.log(`❌ ${j.emoji} ${j.nome} saiu`);
      delete estado.jogadores[socket.id];
      io.emit('atualizar_lobby', {
        jogadores: getRanking(),
        mensagem: `${j.emoji} ${j.nome} saiu do jogo`
      });
    }
  });
});

// ============================================================
// ENVIAR PERGUNTA
// ============================================================
function enviarPergunta() {
  if (estado.rodadaAtual >= estado.totalRodadas) return;

  estado.respostasRodada = {};
  estado.primeiroAcertou = null;
  estado.perguntaAtual = proximaPergunta();
  estado.tempoInicioPergunta = Date.now();

  Object.keys(estado.jogadores).forEach(id => {
    estado.jogadores[id].respondeu = false;
  });

  io.emit('nova_pergunta', {
    pergunta: estado.perguntaAtual.pergunta,
    opcoes: estado.perguntaAtual.opcoes,
    tipo: estado.perguntaAtual.tipo,
    rodada: estado.rodadaAtual + 1,
    totalRodadas: estado.totalRodadas,
    tempo: 10
  });

  console.log(`❓ Pergunta ${estado.rodadaAtual + 1}: ${estado.perguntaAtual.pergunta.substring(0, 40)}...`);

  // Timer de 10 segundos
  estado.timerPergunta = setTimeout(() => {
    encerrarRodada();
  }, 10000);
}

// ============================================================
// INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 Batalha da Gramática rodando em http://localhost:${PORT}`);
  console.log(`📚 Perguntas carregadas: ${Object.values(PERGUNTAS).flat().length} no total\n`);
});