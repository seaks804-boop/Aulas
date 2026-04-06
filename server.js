// ============================================================
// BATALHA DO SABER — Servidor Node.js + Socket.io
// Versão expandida: Português, Matemática, Geometria,
//                  Geografia, Ciências, História, Inglês
// ============================================================

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
//  BANCO DE PERGUNTAS
//  Estrutura: PERGUNTAS[materia][nivel][array de questões]
//  Para adicionar: basta copiar um objeto questão e editar.
// ============================================================
const PERGUNTAS = {

  // ══════════════════════════════════════════════════════════
  //  LÍNGUA PORTUGUESA
  // ══════════════════════════════════════════════════════════
  portugues: {
    '4ano': [
      { pergunta:'Qual palavra está escrita corretamente?', opcoes:['Bicicreta','Bicicleta','Biscicleta','Biciscleta'], correta:1, tipo:'multipla' },
      { pergunta:'Complete: "Ontem eu ___ ao parque."', opcoes:['vai','fui','vou','ido'], correta:1, tipo:'completar' },
      { pergunta:'Qual frase está correta?', opcoes:['Eu gosto muito de sorvete.','Eu gosta muito de sorvete.','Eu gostas muito de sorvete.','Eu gostam muito de sorvete.'], correta:0, tipo:'corrigir' },
      { pergunta:'Quantas sílabas tem a palavra "borboleta"?', opcoes:['2 sílabas','3 sílabas','4 sílabas','5 sílabas'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o plural de "pão"?', opcoes:['Pãos','Pães','Pão','Pão-s'], correta:1, tipo:'multipla' },
      { pergunta:'O que é um substantivo?', opcoes:['Palavra que indica ação','Palavra que dá nome a seres, coisas e lugares','Palavra que liga outras palavras','Palavra que qualifica algo'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o feminino de "ator"?', opcoes:['Actriz','Atoriz','Atriz','Atora'], correta:2, tipo:'multipla' },
      { pergunta:'Qual destas palavras tem dígrafo?', opcoes:['Bola','Carro','Pato','Vaca'], correta:1, tipo:'multipla' },
      { pergunta:'"Cachorro" é sinônimo de:', opcoes:['Gato','Cão','Cavalo','Peixe'], correta:1, tipo:'multipla' },
      { pergunta:'Qual pontuação termina uma pergunta?', opcoes:['Ponto final','Ponto de exclamação','Ponto de interrogação','Vírgula'], correta:2, tipo:'multipla' },
      { pergunta:'Qual palavra rima com "sol"?', opcoes:['Lar','Col','Lua','Mar'], correta:1, tipo:'multipla' },
      { pergunta:'Quantas letras tem o alfabeto brasileiro?', opcoes:['23','24','25','26'], correta:3, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Qual frase usa corretamente a vírgula?', opcoes:['Maria, foi ao mercado.','João, Pedro e Ana foram à festa.','Eu gosto, de sorvete.','O cachorro, late muito.'], correta:1, tipo:'corrigir' },
      { pergunta:'Complete: "Ele ___ muito estudioso."', opcoes:['são','somos','é','sou'], correta:2, tipo:'completar' },
      { pergunta:'Qual palavra é um adjetivo?', opcoes:['Correr','Beleza','Bonito','Casa'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o antônimo de "alegre"?', opcoes:['Feliz','Contente','Triste','Animado'], correta:2, tipo:'multipla' },
      { pergunta:'"O gato bebeu o leite." Quem praticou a ação?', opcoes:['O leite','O gato','Bebeu','Ninguém'], correta:1, tipo:'interpretacao' },
      { pergunta:'Qual palavra tem acento?', opcoes:['Cafe','Mesa','Avó','Bola'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o diminutivo de "livro"?', opcoes:['Livrão','Livrinho','Livreco','Livreto'], correta:1, tipo:'multipla' },
      { pergunta:'"Rapidamente" é um:', opcoes:['Substantivo','Adjetivo','Advérbio','Verbo'], correta:2, tipo:'multipla' },
      { pergunta:'Qual palavra está no plural?', opcoes:['Mesa','Cadeira','Livros','Janela'], correta:2, tipo:'multipla' },
      { pergunta:'O verbo "comer" no passado é:', opcoes:['Come','Comeu','Comerá','Comia'], correta:1, tipo:'multipla' },
      { pergunta:'Qual frase está no tempo futuro?', opcoes:['Eu comi o bolo.','Eu como o bolo.','Eu comerei o bolo.','Eu comia o bolo.'], correta:2, tipo:'multipla' },
      { pergunta:'O oposto de "alto" é:', opcoes:['Grande','Baixo','Gordo','Largo'], correta:1, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Qual frase está na voz passiva?', opcoes:['O aluno estudou a lição.','A lição foi estudada pelo aluno.','Eu vou estudar amanhã.','Estudar é importante.'], correta:1, tipo:'multipla' },
      { pergunta:'Identifique o sujeito: "Correu muito o atleta cansado."', opcoes:['Correu muito','O atleta cansado','Muito o atleta','Cansado'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o sinônimo de "ágil"?', opcoes:['Lento','Preguiçoso','Rápido','Cansado'], correta:2, tipo:'multipla' },
      { pergunta:'"Mal" ou "mau"? "O menino ___ procedeu ontem."', opcoes:['mau','mal','mál','maul'], correta:1, tipo:'completar' },
      { pergunta:'Qual é o grau aumentativo de "casa"?', opcoes:['Casinha','Casarão','Casamento','Casal'], correta:1, tipo:'multipla' },
      { pergunta:'Que tipo de sujeito tem: "Choveu muito ontem"?', opcoes:['Sujeito simples','Sujeito composto','Sujeito indeterminado','Sujeito inexistente'], correta:3, tipo:'multipla' },
      { pergunta:'Qual é a função de "porque" em: "Fui porque quis."?', opcoes:['Conjunção causal','Conjunção concessiva','Conjunção final','Pronome relativo'], correta:0, tipo:'multipla' },
      { pergunta:'Assinale o verbo de ligação:', opcoes:['Correr','Estudar','Ser','Comer'], correta:2, tipo:'multipla' },
      { pergunta:'Qual palavra é um pronome pessoal?', opcoes:['Meu','Aquele','Ele','Este'], correta:2, tipo:'multipla' },
      { pergunta:'"Ele fez o trabalho sozinho." O predicado é:', opcoes:['Ele','Fez','Fez o trabalho sozinho','O trabalho'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o plural de "cidadão"?', opcoes:['Cidadãos','Cidadões','Cidadãoes','Cidadão'], correta:0, tipo:'multipla' },
      { pergunta:'Em "livro novo", "novo" é:', opcoes:['Substantivo','Advérbio','Adjetivo','Verbo'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Qual alternativa usa "por que" corretamente?\n"___ você chegou tarde?"', opcoes:['Porque você chegou tarde?','Por que você chegou tarde?','Por quê você chegou tarde?','Porquê você chegou tarde?'], correta:1, tipo:'corrigir' },
      { pergunta:'Qual é a função do pronome relativo em: "O livro que li era ótimo."', opcoes:['Sujeito','Objeto direto','Retomar o antecedente "livro"','Predicativo'], correta:2, tipo:'multipla' },
      { pergunta:'Assinale a oração com predicado nominal:', opcoes:['Maria correu no parque.','O céu está nublado.','Ele comeu o bolo.','Nós viajamos ontem.'], correta:1, tipo:'multipla' },
      { pergunta:'"Há" ou "a"? "Faz ___ dois anos que não a vejo."', opcoes:['a','há','ah','à'], correta:1, tipo:'completar' },
      { pergunta:'Qual figura de linguagem está em: "Meus olhos são dois oceanos"?', opcoes:['Metonímia','Hipérbole','Metáfora','Ironia'], correta:2, tipo:'multipla' },
      { pergunta:'Em "Não fui à festa." o "à" indica:', opcoes:['Crase obrigatória','Simples preposição','Artigo apenas','Não existe crase aqui'], correta:0, tipo:'multipla' },
      { pergunta:'Que tipo de oração é "Espero que você venha"?', opcoes:['Coordenada','Subordinada substantiva','Subordinada adjetiva','Subordinada adverbial'], correta:1, tipo:'multipla' },
      { pergunta:'A hipérbole é uma figura que:', opcoes:['Compara coisas diferentes','Exagera para dar ênfase','Atribui vida a objetos','Usa palavras com sentido oposto'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o modo subjuntivo de "falar"?', opcoes:['Falo','Falei','Que eu fale','Falaria'], correta:2, tipo:'multipla' },
      { pergunta:'"Ela chegou cansada." O predicativo do sujeito é:', opcoes:['Ela','Chegou','Cansada','Chegou cansada'], correta:2, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'Qual período é composto por subordinação?', opcoes:['Cheguei e fui dormir.','Espero que você venha.','Ele saiu, mas ela ficou.','Vai logo ou fica!'], correta:1, tipo:'multipla' },
      { pergunta:'Que tipo de oração é "para que todos entendessem"?', opcoes:['Oração subordinada adverbial causal','Oração subordinada adverbial final','Oração subordinada substantiva','Oração coordenada'], correta:1, tipo:'multipla' },
      { pergunta:'Identifique a figura de linguagem: "O silêncio gritou no corredor."', opcoes:['Hipérbole','Paradoxo','Personificação','Eufemismo'], correta:2, tipo:'multipla' },
      { pergunta:'Complete corretamente: "Vou a ___ cidade amanhã."', opcoes:['a','à','há','ah'], correta:0, tipo:'completar' },
      { pergunta:'Qual é o modo verbal de "Estude mais!"?', opcoes:['Indicativo','Subjuntivo','Imperativo','Infinitivo'], correta:2, tipo:'multipla' },
      { pergunta:'"Embora estivesse cansado, ele trabalhou." A subordinada é:', opcoes:['Causal','Concessiva','Condicional','Comparativa'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a voz do verbo em "A porta foi aberta"?', opcoes:['Ativa','Passiva analítica','Passiva sintética','Reflexiva'], correta:1, tipo:'multipla' },
      { pergunta:'Em "Abriram a loja cedo", o sujeito é:', opcoes:['A loja','Cedo','Indeterminado','Inexistente'], correta:2, tipo:'multipla' },
      { pergunta:'"Se eu soubesse, teria ido." Que tipo de oração é "Se eu soubesse"?', opcoes:['Causal','Concessiva','Condicional','Consecutiva'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o agente da passiva em "O gol foi marcado pelo atacante"?', opcoes:['O gol','Foi marcado','Pelo atacante','Marcado'], correta:2, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'Em qual alternativa há erro de regência verbal?', opcoes:['Eu assisti ao filme.','Ela aspirou o pó da sala.','Nós preferimos isso a aquilo.','Ele visou ao cargo público.'], correta:1, tipo:'corrigir' },
      { pergunta:'Qual alternativa está com concordância nominal CORRETA?', opcoes:['Ela mesma fez o trabalho.','Ela mesmo fez o trabalho.','Ela mesmos fez o trabalho.','Ela mesmas fez o trabalho.'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é o sujeito de "Convém que todos compareçam"?', opcoes:['Todos','Que todos compareçam','Convém','Não tem sujeito'], correta:1, tipo:'multipla' },
      { pergunta:'"Vende-se casas." — Esta frase contém erro de:', opcoes:['Regência','Concordância verbal','Colocação pronominal','Crase'], correta:1, tipo:'corrigir' },
      { pergunta:'Qual figura de linguagem há em "Morte, vida — dois lados da mesma moeda"?', opcoes:['Ironia','Antítese','Eufemismo','Pleonasmo'], correta:1, tipo:'multipla' },
      { pergunta:'A frase "O candidato que mais votos receber vencerá" contém:', opcoes:['Oração subordinada adjetiva restritiva','Oração subordinada adjetiva explicativa','Oração subordinada substantiva','Oração coordenada assindética'], correta:0, tipo:'multipla' },
      { pergunta:'"Ela se penteou." O pronome "se" indica:', opcoes:['Voz passiva','Voz reflexiva','Voz ativa','Indeterminação do sujeito'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o efeito do eufemismo?', opcoes:['Exagerar uma ideia','Suavizar algo desagradável','Comparar duas coisas','Repetir sons semelhantes'], correta:1, tipo:'multipla' },
      { pergunta:'"Ele chegou quando eu saía." Que relação há entre as orações?', opcoes:['Causa','Consequência','Tempo','Concessão'], correta:2, tipo:'multipla' },
      { pergunta:'Colocação correta do pronome: "Ele ___ disse ontem."', opcoes:['me','lhe','o','se'], correta:0, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  MATEMÁTICA
  // ══════════════════════════════════════════════════════════
  matematica: {
    '4ano': [
      { pergunta:'Quanto é 345 + 278?', opcoes:['513','623','633','523'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o resultado de 7 × 8?', opcoes:['54','56','58','62'], correta:1, tipo:'multipla' },
      { pergunta:'500 – 237 = ?', opcoes:['263','273','253','283'], correta:0, tipo:'multipla' },
      { pergunta:'Qual número é par?', opcoes:['13','27','34','51'], correta:2, tipo:'multipla' },
      { pergunta:'48 ÷ 6 = ?', opcoes:['6','7','8','9'], correta:2, tipo:'multipla' },
      { pergunta:'Qual fração representa metade?', opcoes:['1/3','1/4','1/2','2/3'], correta:2, tipo:'multipla' },
      { pergunta:'Qual número fica entre 99 e 101?', opcoes:['98','100','102','103'], correta:1, tipo:'multipla' },
      { pergunta:'9 × 9 = ?', opcoes:['72','81','90','63'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o dobro de 35?', opcoes:['60','65','70','75'], correta:2, tipo:'multipla' },
      { pergunta:'Quantos centímetros tem 1 metro?', opcoes:['10','100','1000','10000'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a metade de 80?', opcoes:['30','35','40','45'], correta:2, tipo:'multipla' },
      { pergunta:'3/4 é igual a quantos quartos?', opcoes:['2','3','4','1'], correta:1, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Qual é o MMC de 4 e 6?', opcoes:['8','12','16','24'], correta:1, tipo:'multipla' },
      { pergunta:'0,5 é igual a qual fração?', opcoes:['1/4','1/5','1/2','2/5'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o MDC de 12 e 18?', opcoes:['3','4','6','9'], correta:2, tipo:'multipla' },
      { pergunta:'25% de 200 é:', opcoes:['25','40','50','75'], correta:2, tipo:'multipla' },
      { pergunta:'Qual número é primo?', opcoes:['9','12','13','15'], correta:2, tipo:'multipla' },
      { pergunta:'2,5 × 4 = ?', opcoes:['8','9','10','11'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o triplo de 24?', opcoes:['48','60','72','84'], correta:2, tipo:'multipla' },
      { pergunta:'3/5 + 1/5 = ?', opcoes:['4/10','4/5','2/5','3/10'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o quadrado de 7?', opcoes:['14','42','49','56'], correta:2, tipo:'multipla' },
      { pergunta:'Se João tem 3 dúzias de ovos, quantos ovos ele tem?', opcoes:['24','30','36','48'], correta:2, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Qual é o resultado de (–3) × (–5)?', opcoes:['–15','–8','8','15'], correta:3, tipo:'multipla' },
      { pergunta:'Qual é a raiz quadrada de 144?', opcoes:['11','12','13','14'], correta:1, tipo:'multipla' },
      { pergunta:'3² + 4² = ?', opcoes:['25','49','14','7'], correta:0, tipo:'multipla' },
      { pergunta:'50% de 360 é:', opcoes:['100','150','180','200'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o valor de x: 2x + 4 = 14?', opcoes:['3','4','5','6'], correta:2, tipo:'multipla' },
      { pergunta:'(–8) + (+3) = ?', opcoes:['11','–5','5','–11'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o resultado de 2/3 × 3/4?', opcoes:['6/12','1/2','5/12','2/4'], correta:1, tipo:'multipla' },
      { pergunta:'A razão entre 15 e 3 é:', opcoes:['3','4','5','6'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o valor de 5³?', opcoes:['15','25','125','150'], correta:2, tipo:'multipla' },
      { pergunta:'Se 3 camisas custam R$90, qual o preço de 1?', opcoes:['R$20','R$25','R$30','R$35'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Equação do 1º grau: 3x – 9 = 0. Qual é x?', opcoes:['2','3','4','6'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a equação da reta que passa por (0,2) com inclinação 3?', opcoes:['y = 3x','y = 2x + 3','y = 3x + 2','y = x + 2'], correta:2, tipo:'multipla' },
      { pergunta:'Um produto custa R$80 com 20% de desconto. Quanto você paga?', opcoes:['R$60','R$64','R$68','R$70'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o valor de x²+x para x=3?', opcoes:['9','10','11','12'], correta:3, tipo:'multipla' },
      { pergunta:'Se y = 2x + 1 e x = 4, qual é y?', opcoes:['7','8','9','10'], correta:2, tipo:'multipla' },
      { pergunta:'Qual operação com números negativos está CORRETA?', opcoes:['(–4)–(–2)=–6','(–4)–(–2)=–2','(–4)+(–2)=2','(–4)×(–2)=–8'], correta:1, tipo:'multipla' },
      { pergunta:'Simplifique: 8x + 3x – 2x', opcoes:['9x','10x','11x','13x'], correta:0, tipo:'multipla' },
      { pergunta:'A velocidade média de um carro que percorre 180 km em 2h é:', opcoes:['60 km/h','80 km/h','90 km/h','100 km/h'], correta:2, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'Bhaskara: x²– 5x + 6 = 0. Quais são as raízes?', opcoes:['x=1 e x=6','x=2 e x=3','x=–2 e x=–3','x=0 e x=5'], correta:1, tipo:'multipla' },
      { pergunta:'Num triângulo retângulo com catetos 3 e 4, a hipotenusa é:', opcoes:['5','6','7','8'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é o discriminante de x²+ 2x + 1 = 0?', opcoes:['0','1','2','4'], correta:0, tipo:'multipla' },
      { pergunta:'A soma dos ângulos internos de um triângulo é:', opcoes:['90°','180°','270°','360°'], correta:1, tipo:'multipla' },
      { pergunta:'sen(30°) = ?', opcoes:['0','0,5','√2/2','√3/2'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a área de um círculo com raio 5? (π≈3,14)', opcoes:['15,7','31,4','78,5','157'], correta:2, tipo:'multipla' },
      { pergunta:'Qual sequência é uma PA com razão 3?', opcoes:['2,5,8,11','1,3,6,10','2,6,18,54','1,4,8,13'], correta:0, tipo:'multipla' },
      { pergunta:'cos(60°) = ?', opcoes:['0','0,5','√2/2','1'], correta:1, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'Qual é a equação da circunferência de centro (0,0) e raio 5?', opcoes:['x+y=25','x²+y²=5','x²+y²=25','x²–y²=25'], correta:2, tipo:'multipla' },
      { pergunta:'log₁₀(1000) = ?', opcoes:['2','3','4','10'], correta:1, tipo:'multipla' },
      { pergunta:'Num PG, a₁=2 e q=3. Qual é a₄?', opcoes:['18','27','54','81'], correta:2, tipo:'multipla' },
      { pergunta:'O conjunto solução de x² < 9 é:', opcoes:['x<3','–3<x<3','x>–3','x<–3 ou x>3'], correta:1, tipo:'multipla' },
      { pergunta:'tg(45°) = ?', opcoes:['0','0,5','1','√3'], correta:2, tipo:'multipla' },
      { pergunta:'Qual a distância entre (1,2) e (4,6)?', opcoes:['3','4','5','6'], correta:2, tipo:'multipla' },
      { pergunta:'A média aritmética de 4, 8, 12 e 16 é:', opcoes:['8','10','12','14'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a derivada de f(x) = 3x²?', opcoes:['3x','6x','6','3x³'], correta:1, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  GEOMETRIA
  // ══════════════════════════════════════════════════════════
  geometria: {
    '4ano': [
      { pergunta:'Quantos lados tem um quadrado?', opcoes:['3','4','5','6'], correta:1, tipo:'multipla' },
      { pergunta:'Qual figura tem 3 lados?', opcoes:['Quadrado','Círculo','Triângulo','Pentágono'], correta:2, tipo:'multipla' },
      { pergunta:'O que é um ângulo reto?', opcoes:['45°','90°','180°','360°'], correta:1, tipo:'multipla' },
      { pergunta:'Como se chama a linha que passa pelo centro do círculo?', opcoes:['Raio','Corda','Diâmetro','Arco'], correta:2, tipo:'multipla' },
      { pergunta:'Quantas faces tem um cubo?', opcoes:['4','5','6','8'], correta:2, tipo:'multipla' },
      { pergunta:'Qual sólido tem base circular?', opcoes:['Cubo','Pirâmide','Cilindro','Paralelepípedo'], correta:2, tipo:'multipla' },
      { pergunta:'Um retângulo tem:', opcoes:['Todos os lados iguais','4 ângulos retos','3 lados','5 vértices'], correta:1, tipo:'multipla' },
      { pergunta:'Perímetro de um quadrado com lado 5 cm:', opcoes:['10 cm','15 cm','20 cm','25 cm'], correta:2, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Área de um retângulo 6×4 cm:', opcoes:['20 cm²','24 cm²','28 cm²','18 cm²'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a área de um triângulo com base 10 e altura 6?', opcoes:['30','40','60','16'], correta:0, tipo:'multipla' },
      { pergunta:'Um hexágono tem quantos lados?', opcoes:['5','6','7','8'], correta:1, tipo:'multipla' },
      { pergunta:'Quantas arestas tem um cubo?', opcoes:['8','10','12','14'], correta:2, tipo:'multipla' },
      { pergunta:'O diâmetro é ___ vezes o raio.', opcoes:['1','2','3','4'], correta:1, tipo:'multipla' },
      { pergunta:'Volume de um cubo com lado 3 cm:', opcoes:['9 cm³','18 cm³','27 cm³','36 cm³'], correta:2, tipo:'multipla' },
      { pergunta:'Dois ângulos que somam 90° são:', opcoes:['Suplementares','Complementares','Opostos','Retos'], correta:1, tipo:'multipla' },
      { pergunta:'Qual polígono tem 5 lados?', opcoes:['Quadrado','Hexágono','Pentágono','Octógono'], correta:2, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'A soma dos ângulos internos de um pentágono é:', opcoes:['360°','450°','540°','720°'], correta:2, tipo:'multipla' },
      { pergunta:'Dois ângulos somando 180° são:', opcoes:['Complementares','Suplementares','Opostos pelo vértice','Retos'], correta:1, tipo:'multipla' },
      { pergunta:'Num triângulo equilátero cada ângulo interno mede:', opcoes:['45°','60°','90°','120°'], correta:1, tipo:'multipla' },
      { pergunta:'Área do círculo com raio 7 (π≈3,14):', opcoes:['43,96','49','153,86','21,98'], correta:2, tipo:'multipla' },
      { pergunta:'Circunferência com raio 5 (π≈3,14):', opcoes:['15,7','25','31,4','50'], correta:2, tipo:'multipla' },
      { pergunta:'Quantos vértices tem uma pirâmide de base quadrada?', opcoes:['4','5','6','8'], correta:1, tipo:'multipla' },
      { pergunta:'Ângulos opostos pelo vértice são:', opcoes:['Suplementares','Complementares','Iguais','Diferentes'], correta:2, tipo:'multipla' },
      { pergunta:'Qual figura plana NÃO tem vértices?', opcoes:['Triângulo','Quadrado','Círculo','Pentágono'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'No triângulo retângulo, qual é a relação de Pitágoras?', opcoes:['a=b+c','a²=b²+c²','a²=b²–c²','a+b=c²'], correta:1, tipo:'multipla' },
      { pergunta:'Catetos 6 e 8, a hipotenusa é:', opcoes:['10','12','14','16'], correta:0, tipo:'multipla' },
      { pergunta:'A soma dos ângulos externos de qualquer polígono convexo é:', opcoes:['180°','270°','360°','540°'], correta:2, tipo:'multipla' },
      { pergunta:'Volume de um cilindro com r=3 e h=5 (π≈3,14):', opcoes:['45','47,1','94,2','141,3'], correta:3, tipo:'multipla' },
      { pergunta:'Triângulo com lados 3, 4 e 6 é:', opcoes:['Equilátero','Isósceles','Escaleno','Retângulo'], correta:2, tipo:'multipla' },
      { pergunta:'A apótema é usada para calcular a área de:', opcoes:['Círculo','Triângulo equilátero','Polígono regular','Paralelograma'], correta:2, tipo:'multipla' },
      { pergunta:'Dois triângulos são semelhantes quando:', opcoes:['Têm lados iguais','Têm ângulos iguais','São congruentes','Têm a mesma área'], correta:1, tipo:'multipla' },
      { pergunta:'A diagonal de um quadrado com lado 1 mede:', opcoes:['1','√2','2','√3'], correta:1, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'sen²θ + cos²θ = ?', opcoes:['0','1','2','θ'], correta:1, tipo:'multipla' },
      { pergunta:'Num triângulo retângulo, sen(θ) = cateto oposto ÷ ?', opcoes:['Cateto adjacente','Hipotenusa','Área','Perímetro'], correta:1, tipo:'multipla' },
      { pergunta:'A área do trapézio é: (B+b)×h ÷ ?', opcoes:['1','2','3','4'], correta:1, tipo:'multipla' },
      { pergunta:'Volume de uma esfera com r=3 (V=4πr³/3, π≈3,14):', opcoes:['28,26','56,52','113,04','314'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é a área lateral de um cubo com lado 4 cm?', opcoes:['48 cm²','64 cm²','80 cm²','96 cm²'], correta:3, tipo:'multipla' },
      { pergunta:'Triângulo com ângulos 90°, 45°, 45° é:', opcoes:['Escaleno','Isósceles retângulo','Equilátero','Obtusângulo'], correta:1, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'A fórmula da distância entre dois pontos P1(x1,y1) e P2(x2,y2) é:', opcoes:['|x2–x1|+|y2–y1|','√((x2–x1)²+(y2–y1)²)','(x2–x1)²+(y2–y1)²','x2·y2–x1·y1'], correta:1, tipo:'multipla' },
      { pergunta:'O lugar geométrico equidistante de um ponto é:', opcoes:['Reta','Circunferência','Parábola','Elipse'], correta:1, tipo:'multipla' },
      { pergunta:'Volume de um cone com r=3 e h=4 (V=πr²h/3, π≈3,14):', opcoes:['12,56','37,68','113,04','150,72'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o ângulo central de um hexágono regular?', opcoes:['45°','60°','72°','90°'], correta:1, tipo:'multipla' },
      { pergunta:'Se duas retas são perpendiculares, o ângulo entre elas é:', opcoes:['45°','60°','90°','180°'], correta:2, tipo:'multipla' },
      { pergunta:'A reta mediatriz de um segmento é perpendicular e passa pelo:', opcoes:['Extremo','Ponto médio','Terço','Quartil'], correta:1, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  GEOGRAFIA
  // ══════════════════════════════════════════════════════════
  geografia: {
    '4ano': [
      { pergunta:'Qual é a capital do Brasil?', opcoes:['São Paulo','Rio de Janeiro','Brasília','Salvador'], correta:2, tipo:'multipla' },
      { pergunta:'O Brasil está localizado em qual continente?', opcoes:['África','Europa','Américas','Ásia'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o maior estado do Brasil?', opcoes:['São Paulo','Pará','Minas Gerais','Amazonas'], correta:3, tipo:'multipla' },
      { pergunta:'Qual é o rio mais longo do Brasil?', opcoes:['Rio São Francisco','Rio Paraná','Rio Amazonas','Rio Tocantins'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o principal idioma falado no Brasil?', opcoes:['Espanhol','Inglês','Português','Francês'], correta:2, tipo:'multipla' },
      { pergunta:'Quantos estados tem o Brasil?', opcoes:['25','26','27','28'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o oceano que banha o litoral brasileiro?', opcoes:['Pacífico','Índico','Atlântico','Ártico'], correta:2, tipo:'multipla' },
      { pergunta:'A Amazônia é famosa por ser:', opcoes:['O maior deserto','A maior floresta tropical','O maior oceano','A maior montanha'], correta:1, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Quantos países fazem fronteira com o Brasil?', opcoes:['8','9','10','11'], correta:2, tipo:'multipla' },
      { pergunta:'Qual país NÃO faz fronteira com o Brasil?', opcoes:['Argentina','Colômbia','Chile','Venezuela'], correta:2, tipo:'multipla' },
      { pergunta:'A Região Nordeste tem quantos estados?', opcoes:['7','8','9','10'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o bioma predominante no Nordeste?', opcoes:['Cerrado','Caatinga','Mata Atlântica','Amazônia'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a maior cidade do Brasil?', opcoes:['Rio de Janeiro','Brasília','São Paulo','Manaus'], correta:2, tipo:'multipla' },
      { pergunta:'A linha do Equador passa pelo Brasil, em qual estado?', opcoes:['Pará','Amazonas','Amapá','Roraima'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o estado mais populoso do Brasil?', opcoes:['Rio de Janeiro','Minas Gerais','São Paulo','Bahia'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o clima predominante na região Amazônica?', opcoes:['Árido','Temperado','Equatorial','Semiárido'], correta:2, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Quais são os trópicos que limitam a zona intertropical?', opcoes:['Árctico e Antártico','Câncer e Capricórnio','Norte e Sul','Leste e Oeste'], correta:1, tipo:'multipla' },
      { pergunta:'O que são placas tectônicas?', opcoes:['Camadas da atmosfera','Grandes porções da crosta terrestre que se movem','Tipos de solo','Correntes marítimas'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o maior continente do mundo?', opcoes:['América','África','Ásia','Europa'], correta:2, tipo:'multipla' },
      { pergunta:'Qual fenômeno ocorre quando o ar quente sobe e o frio desce?', opcoes:['Erosão','Convecção','Condensação','Evaporação'], correta:1, tipo:'multipla' },
      { pergunta:'O Meridiano de Greenwich define:', opcoes:['Longitude 0°','Latitude 0°','Altitude 0','O polo Norte'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é o maior deserto do mundo?', opcoes:['Sahara','Kalahari','Atacama','Gobi'], correta:0, tipo:'multipla' },
      { pergunta:'A camada da atmosfera mais próxima da Terra é:', opcoes:['Estratosfera','Mesosfera','Troposfera','Exosfera'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o oceano mais extenso do mundo?', opcoes:['Atlântico','Índico','Ártico','Pacífico'], correta:3, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Qual é a capital da Argentina?', opcoes:['Montevidéu','Santiago','Buenos Aires','Lima'], correta:2, tipo:'multipla' },
      { pergunta:'O Produto Interno Bruto (PIB) mede:', opcoes:['A população de um país','A riqueza produzida num país','A área de um país','Os recursos naturais'], correta:1, tipo:'multipla' },
      { pergunta:'O que é êxodo rural?', opcoes:['Migração do campo para a cidade','Migração da cidade para o campo','Crescimento da zona rural','Redução da população urbana'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é a cordilheira mais extensa da América do Sul?', opcoes:['Serra do Mar','Andes','Pirineus','Himalaia'], correta:1, tipo:'multipla' },
      { pergunta:'Qual região do Brasil tem o maior PIB?', opcoes:['Norte','Nordeste','Centro-Oeste','Sudeste'], correta:3, tipo:'multipla' },
      { pergunta:'O Mercosul é um bloco econômico formado por países da:', opcoes:['América do Norte','América Central','América do Sul','Europa'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o país mais populoso do mundo?', opcoes:['EUA','Índia','China','Rússia'], correta:1, tipo:'multipla' },
      { pergunta:'A transumância está relacionada a qual atividade?', opcoes:['Pesca','Pastoreio migratório','Agricultura irrigada','Mineração'], correta:1, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'O que é a globalização?', opcoes:['Aquecimento global','Integração econômica, cultural e política mundial','Expansão de desertos','Crescimento da população'], correta:1, tipo:'multipla' },
      { pergunta:'A Revolução Industrial começou em qual país?', opcoes:['França','Alemanha','Estados Unidos','Inglaterra'], correta:3, tipo:'multipla' },
      { pergunta:'O efeito estufa é causado principalmente pelo acúmulo de:', opcoes:['Oxigênio','Nitrogênio','CO₂ e outros gases','Vapor d\'água puro'], correta:2, tipo:'multipla' },
      { pergunta:'O que são países do G7?', opcoes:['7 países mais populosos','7 países mais ricos','7 países da Europa','7 países da ONU'], correta:1, tipo:'multipla' },
      { pergunta:'BRICS agrupa quais países?', opcoes:['Brasil, Rússia, Índia, China, África do Sul','Brasil, Reino Unido, Irã, Chile, África do Sul','Bélgica, Rússia, Indonésia, Canadá, Suécia','Brasil, Romênia, Islândia, Croácia, Síria'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é a maior metrópole da América Latina?', opcoes:['Buenos Aires','São Paulo','México D.F.','Bogotá'], correta:1, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'A Primavera Árabe ocorreu principalmente em qual região?', opcoes:['África Subsaariana','Oriente Médio e Norte da África','Europa Oriental','Ásia Central'], correta:1, tipo:'multipla' },
      { pergunta:'O Protocolo de Kyoto está relacionado a:', opcoes:['Comércio internacional','Redução de emissões de CO₂','Direitos humanos','Guerras nucleares'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o país com maior área territorial do mundo?', opcoes:['EUA','China','Canadá','Rússia'], correta:3, tipo:'multipla' },
      { pergunta:'O que é desenvolvimento sustentável?', opcoes:['Crescimento econômico sem limite','Usar recursos respeitando a capacidade de regeneração do ambiente','Industrialização máxima','Desmatamento para gerar empregos'], correta:1, tipo:'multipla' },
      { pergunta:'A ONU (Organização das Nações Unidas) foi fundada em:', opcoes:['1919','1939','1945','1960'], correta:2, tipo:'multipla' },
      { pergunta:'Qual continente tem o maior número de países?', opcoes:['Ásia','América','Europa','África'], correta:3, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  CIÊNCIAS / BIOLOGIA
  // ══════════════════════════════════════════════════════════
  ciencias: {
    '4ano': [
      { pergunta:'Qual é o processo pelo qual as plantas produzem alimento?', opcoes:['Respiração','Digestão','Fotossíntese','Excreção'], correta:2, tipo:'multipla' },
      { pergunta:'Qual planeta é o mais próximo do Sol?', opcoes:['Venus','Terra','Marte','Mercúrio'], correta:3, tipo:'multipla' },
      { pergunta:'O que os animais herbívoros comem?', opcoes:['Carne','Plantas','Insetos','Frutas e carne'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o estado físico da água a 0°C?', opcoes:['Gasoso','Líquido','Sólido','Plasma'], correta:2, tipo:'multipla' },
      { pergunta:'Quantos planetas tem o Sistema Solar?', opcoes:['7','8','9','10'], correta:1, tipo:'multipla' },
      { pergunta:'O coração bombeia o quê pelo corpo?', opcoes:['Ar','Sangue','Linfa','Água'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a unidade básica dos seres vivos?', opcoes:['Átomo','Célula','Tecido','Órgão'], correta:1, tipo:'multipla' },
      { pergunta:'Onde ocorre a fotossíntese nas plantas?', opcoes:['Raiz','Caule','Flor','Folha'], correta:3, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Qual tipo de rocha se forma por resfriamento do magma?', opcoes:['Sedimentar','Metamórfica','Ígnea','Calcária'], correta:2, tipo:'multipla' },
      { pergunta:'A cadeia alimentar começa com:', opcoes:['Predadores','Decompositores','Produtores (plantas)','Consumidores'], correta:2, tipo:'multipla' },
      { pergunta:'O sistema digestório termina em qual órgão?', opcoes:['Estômago','Intestino delgado','Intestino grosso','Esôfago'], correta:2, tipo:'multipla' },
      { pergunta:'O que faz a vacina no corpo?', opcoes:['Mata bactérias','Estimula o sistema imunológico','Aumenta glóbulos vermelhos','Fortalece os ossos'], correta:1, tipo:'multipla' },
      { pergunta:'Qual gás as plantas absorvem na fotossíntese?', opcoes:['Oxigênio','Nitrogênio','CO₂','Hidrogênio'], correta:2, tipo:'multipla' },
      { pergunta:'De que é feito o DNA?', opcoes:['Proteínas','Gorduras','Nucleotídeos','Aminoácidos'], correta:2, tipo:'multipla' },
      { pergunta:'O que é biodiversidade?', opcoes:['A variedade de seres vivos em um local','O número de animais extintos','A quantidade de árvores','O número de rios'], correta:0, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'O que são fungos?', opcoes:['Plantas sem clorofila','Reinos à parte, nem plantas nem animais','Tipo de bactéria','Algas microscópicas'], correta:1, tipo:'multipla' },
      { pergunta:'A mitose resulta em:', opcoes:['2 células idênticas','4 células diferentes','1 célula maior','Células sem núcleo'], correta:0, tipo:'multipla' },
      { pergunta:'Qual vitamina o Sol ajuda a produzir?', opcoes:['Vitamina A','Vitamina B12','Vitamina C','Vitamina D'], correta:3, tipo:'multipla' },
      { pergunta:'O que é ecossistema?', opcoes:['Conjunto de seres vivos e o ambiente onde vivem','Apenas os animais de uma região','Apenas as plantas de um lugar','O clima de uma região'], correta:0, tipo:'multipla' },
      { pergunta:'Qual é a principal função dos rins?', opcoes:['Bombear sangue','Filtrar o sangue e produzir urina','Produzir bile','Absorver nutrientes'], correta:1, tipo:'multipla' },
      { pergunta:'A célula eucariota se diferencia da procariota por ter:', opcoes:['Parede celular','Membrana plasmática','Núcleo definido','Ribossomos'], correta:2, tipo:'multipla' },
      { pergunta:'O efeito estufa natural é importante para:', opcoes:['Destruir a camada de ozônio','Manter a temperatura da Terra habitável','Aumentar a chuva ácida','Reduzir a luz solar'], correta:1, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'O que é mutualismo?', opcoes:['Um organismo prejudica o outro','Ambos se beneficiam','Um é neutro e outro se beneficia','Um é devorado pelo outro'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o processo pelo qual os animais quebram nutrientes para obter energia?', opcoes:['Fotossíntese','Respiração celular','Quimiossíntese','Mitose'], correta:1, tipo:'multipla' },
      { pergunta:'DNA e RNA são tipos de:', opcoes:['Proteínas','Carboidratos','Ácidos nucleicos','Lipídios'], correta:2, tipo:'multipla' },
      { pergunta:'O que estuda a ecologia?', opcoes:['Células vivas','Relações entre seres vivos e ambiente','Rochas e minerais','Sistema solar'], correta:1, tipo:'multipla' },
      { pergunta:'A meiose produz:', opcoes:['2 células idênticas','4 células com metade dos cromossomos','1 célula maior','Células somáticas'], correta:1, tipo:'multipla' },
      { pergunta:'Qual sistema é responsável pela locomoção?', opcoes:['Sistema digestório','Osteomuscular','Circulatório','Nervoso'], correta:1, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'A lei de Mendel descreve:', opcoes:['Evolução das espécies','Transmissão de características hereditárias','Composição das células','Ciclo do carbono'], correta:1, tipo:'multipla' },
      { pergunta:'Se B (castanho) é dominante sobre b (azul), qual é o fenótipo de Bb?', opcoes:['Azul','Castanho','Misto','Nenhum'], correta:1, tipo:'multipla' },
      { pergunta:'Qual processo transforma glicose em energia sem O₂?', opcoes:['Respiração aeróbica','Fermentação','Fotossíntese','Digestão'], correta:1, tipo:'multipla' },
      { pergunta:'Anticorpos são produzidos por:', opcoes:['Glóbulos vermelhos','Plaquetas','Linfócitos B','Neurônios'], correta:2, tipo:'multipla' },
      { pergunta:'O que é homeostase?', opcoes:['Divisão celular','Equilíbrio interno do organismo','Transporte de nutrientes','Digestão química'], correta:1, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'A teoria da evolução foi proposta por:', opcoes:['Gregor Mendel','Isaac Newton','Charles Darwin','Louis Pasteur'], correta:2, tipo:'multipla' },
      { pergunta:'O que é seleção natural?', opcoes:['Escolha artificial de características','Sobrevivência dos organismos mais adaptados','Mutações aleatórias','Cruzamento entre espécies'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o papel dos decompositores no ecossistema?', opcoes:['Produzir alimento','Decompor matéria orgânica e reciclar nutrientes','Polinizar flores','Predatizar animais'], correta:1, tipo:'multipla' },
      { pergunta:'O que são células-tronco?', opcoes:['Células diferenciadas','Células que podem se transformar em outros tipos de células','Células cancerígenas','Células do sistema nervoso'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a função da camada de ozônio?', opcoes:['Reter calor','Filtrar raios UV','Produzir oxigênio','Regular chuvas'], correta:1, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  HISTÓRIA
  // ══════════════════════════════════════════════════════════
  historia: {
    '4ano': [
      { pergunta:'Quem descobriu o Brasil?', opcoes:['Cristóvão Colombo','Pedro Álvares Cabral','Vasco da Gama','Américo Vespúcio'], correta:1, tipo:'multipla' },
      { pergunta:'Em que ano o Brasil foi descoberto?', opcoes:['1492','1498','1500','1550'], correta:2, tipo:'multipla' },
      { pergunta:'Qual povo habitava o Brasil antes dos portugueses?', opcoes:['Gregos','Romanos','Indígenas','Africanos'], correta:2, tipo:'multipla' },
      { pergunta:'Qual era a principal riqueza explorada no início da colonização?', opcoes:['Ouro','Pau-brasil','Açúcar','Café'], correta:1, tipo:'multipla' },
      { pergunta:'A Proclamação da República do Brasil ocorreu em:', opcoes:['1822','1850','1888','1889'], correta:3, tipo:'multipla' },
      { pergunta:'Quem foi Dom Pedro I?', opcoes:['Presidente do Brasil','Primeiro imperador do Brasil','Rei de Portugal','General da república'], correta:1, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'A Independência do Brasil ocorreu em:', opcoes:['1800','1822','1888','1889'], correta:1, tipo:'multipla' },
      { pergunta:'O "Grito do Ipiranga" foi dado por:', opcoes:['Dom Pedro II','Dom João VI','Dom Pedro I','Tiradentes'], correta:2, tipo:'multipla' },
      { pergunta:'A abolição da escravatura ocorreu em:', opcoes:['1822','1850','1888','1889'], correta:2, tipo:'multipla' },
      { pergunta:'Quem assinou a Lei Áurea?', opcoes:['Princesa Isabel','Dom Pedro I','Deodoro da Fonseca','Dom João VI'], correta:0, tipo:'multipla' },
      { pergunta:'Tiradentes era um símbolo de:', opcoes:['Monarquia','Escravidão','Inconfidência Mineira','Revolução Francesa'], correta:2, tipo:'multipla' },
      { pergunta:'Os bandeirantes exploravam o interior do Brasil em busca de:', opcoes:['Sal','Pedras preciosas e índios para escravizar','Madeira','Terras para plantar'], correta:1, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Qual civilização construiu o Coliseu em Roma?', opcoes:['Grega','Egípcia','Romana','Persa'], correta:2, tipo:'multipla' },
      { pergunta:'As pirâmides do Egito foram construídas para servir de:', opcoes:['Templos','Túmulos dos faraós','Fortalezas','Observatórios'], correta:1, tipo:'multipla' },
      { pergunta:'A democracia surgiu na antiga:', opcoes:['Roma','Atenas (Grécia)','Pérsia','Mesopotâmia'], correta:1, tipo:'multipla' },
      { pergunta:'A Revolução Francesa ocorreu em:', opcoes:['1689','1776','1789','1848'], correta:2, tipo:'multipla' },
      { pergunta:'O feudalismo foi o sistema predominante na:', opcoes:['Antiguidade','Idade Média','Idade Moderna','Contemporânea'], correta:1, tipo:'multipla' },
      { pergunta:'Quem foi Alexandre, o Grande?', opcoes:['Imperador romano','Filósofo grego','Rei macedônio que conquistou um grande império','Faraó egípcio'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'A Revolução Industrial começou no século:', opcoes:['XVI','XVII','XVIII','XIX'], correta:2, tipo:'multipla' },
      { pergunta:'O que foi a Reforma Protestante?', opcoes:['Modernização da Igreja Católica','Movimento que questionou a Igreja Católica no séc. XVI','Revolução política na Europa','Expansão do Islã'], correta:1, tipo:'multipla' },
      { pergunta:'O Iluminismo defendia principalmente:', opcoes:['A fé religiosa acima da razão','A razão e a ciência como guias da humanidade','O poder absoluto dos reis','O retorno ao feudalismo'], correta:1, tipo:'multipla' },
      { pergunta:'Napoleão Bonaparte era de qual país?', opcoes:['Itália','Espanha','França','Alemanha'], correta:2, tipo:'multipla' },
      { pergunta:'As Cruzadas foram expedições com objetivo de:', opcoes:['Colonizar a América','Reconquistar a Terra Santa','Comercializar com a Ásia','Explorar a África'], correta:1, tipo:'multipla' },
      { pergunta:'Quem foi Karl Marx?', opcoes:['Presidente dos EUA','Filósofo e economista criador do marxismo','Rei da Inglaterra','Cientista alemão'], correta:1, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'A Primeira Guerra Mundial começou em:', opcoes:['1910','1914','1918','1939'], correta:1, tipo:'multipla' },
      { pergunta:'O que foi o Holocausto?', opcoes:['Uma batalha naval','O genocídio de judeus e outros grupos pelo regime nazista','Uma revolução comunista','A bomba atômica'], correta:1, tipo:'multipla' },
      { pergunta:'A Revolução Russa (1917) instaurou qual sistema?', opcoes:['Democracia liberal','Fascismo','Comunismo','Monarquia constitucional'], correta:2, tipo:'multipla' },
      { pergunta:'A Guerra Fria foi um conflito entre:', opcoes:['EUA e China','EUA e URSS','Europa e América Latina','EUA e Alemanha'], correta:1, tipo:'multipla' },
      { pergunta:'Quando terminou a Segunda Guerra Mundial?', opcoes:['1943','1944','1945','1946'], correta:2, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'A Ditadura Militar no Brasil durou de:', opcoes:['1945–1960','1964–1985','1930–1945','1889–1930'], correta:1, tipo:'multipla' },
      { pergunta:'O Muro de Berlim caiu em:', opcoes:['1985','1987','1989','1991'], correta:2, tipo:'multipla' },
      { pergunta:'A ONU foi fundada após qual evento?', opcoes:['Primeira Guerra Mundial','Segunda Guerra Mundial','Guerra Fria','Revolução Francesa'], correta:1, tipo:'multipla' },
      { pergunta:'O atentado do 11 de setembro de 2001 ocorreu nos:', opcoes:['Inglaterra','França','EUA','Alemanha'], correta:2, tipo:'multipla' },
      { pergunta:'Quem foi Nelson Mandela?', opcoes:['Líder do movimento pelos direitos civis dos negros na África do Sul','Presidente dos EUA','Primeiro-ministro britânico','Ditador africano'], correta:0, tipo:'multipla' },
    ]
  },

  // ══════════════════════════════════════════════════════════
  //  INGLÊS
  // ══════════════════════════════════════════════════════════
  ingles: {
    '4ano': [
      { pergunta:'Como se diz "Cachorro" em inglês?', opcoes:['Cat','Dog','Bird','Fish'], correta:1, tipo:'multipla' },
      { pergunta:'What color is the sky? (Que cor é o céu?)', opcoes:['Red','Green','Blue','Yellow'], correta:2, tipo:'multipla' },
      { pergunta:'How do you say "Olá" in English?', opcoes:['Bye','Hello','Please','Sorry'], correta:1, tipo:'multipla' },
      { pergunta:'O número "three" em português é:', opcoes:['Um','Dois','Três','Quatro'], correta:2, tipo:'multipla' },
      { pergunta:'What is a "book"?', opcoes:['Um caderno','Uma caneta','Um livro','Uma mesa'], correta:2, tipo:'multipla' },
      { pergunta:'"Good morning" significa:', opcoes:['Boa tarde','Boa noite','Bom dia','Até logo'], correta:2, tipo:'multipla' },
      { pergunta:'Como se diz "vermelho" em inglês?', opcoes:['Blue','Red','Green','Pink'], correta:1, tipo:'multipla' },
      { pergunta:'"I am happy" significa:', opcoes:['Eu estou com fome','Eu estou feliz','Eu estou com sono','Eu estou triste'], correta:1, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'O plural de "child" em inglês é:', opcoes:['Childs','Childes','Children','Childrens'], correta:2, tipo:'multipla' },
      { pergunta:'"She ___ a teacher." Complete corretamente:', opcoes:['am','is','are','be'], correta:1, tipo:'multipla' },
      { pergunta:'What does "beautiful" mean?', opcoes:['Feio','Bonito','Triste','Rápido'], correta:1, tipo:'multipla' },
      { pergunta:'Como se forma o passado de "go"?', opcoes:['Goed','Goes','Went','Gone'], correta:2, tipo:'multipla' },
      { pergunta:'"They ___ playing football." Complete:', opcoes:['am','is','are','be'], correta:2, tipo:'multipla' },
      { pergunta:'O oposto de "big" em inglês é:', opcoes:['Tall','Small','Fast','Old'], correta:1, tipo:'multipla' },
      { pergunta:'"I don\'t like pizza." Esta frase é:', opcoes:['Afirmativa','Negativa','Interrogativa','Exclamativa'], correta:1, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Qual é o passado simples de "eat"?', opcoes:['Eated','Ate','Eaten','Eat'], correta:1, tipo:'multipla' },
      { pergunta:'"Have you ever been to Paris?" Esse tempo verbal é:', opcoes:['Simple Past','Present Simple','Present Perfect','Future Simple'], correta:2, tipo:'multipla' },
      { pergunta:'Qual pronome substitui "Maria and João"?', opcoes:['He','She','They','We'], correta:2, tipo:'multipla' },
      { pergunta:'"She is taller than her brother." Qual grau do adjetivo é usado?', opcoes:['Positivo','Comparativo','Superlativo','Neutro'], correta:1, tipo:'multipla' },
      { pergunta:'Complete: "It\'s the ___ movie I\'ve ever seen." (best/better)', opcoes:['good','better','best','most good'], correta:2, tipo:'multipla' },
      { pergunta:'O que significa "however"?', opcoes:['Portanto','No entanto','Além disso','Porque'], correta:1, tipo:'multipla' },
      { pergunta:'"He will travel tomorrow." Está no:', opcoes:['Passado','Presente','Futuro','Perfeito'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'"If I had money, I ___ buy a car." Complete:', opcoes:['will','would','can','should'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a voz passiva de "They built the bridge"?', opcoes:['The bridge built they.','The bridge was built by them.','They are building the bridge.','The bridge has been built.'], correta:1, tipo:'multipla' },
      { pergunta:'O que são "false cognates" (falsos cognatos)?', opcoes:['Palavras iguais com mesmo significado','Palavras parecidas com significados diferentes','Palavras difíceis','Palavras compostas'], correta:1, tipo:'multipla' },
      { pergunta:'"Eventually" em inglês significa:', opcoes:['Eventualmente (às vezes)','Finalmente / no fim','Rapidamente','Claramente'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o gerúndio de "swim"?', opcoes:['Swims','Swiming','Swimming','Swimmed'], correta:2, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'Qual é o modo condicional tipo 2?\n"If she ___ harder, she ___ pass."', opcoes:['studies/will','studied/would','study/can','had studied/would have'], correta:1, tipo:'multipla' },
      { pergunta:'"He said that he was tired." Esta é uma frase em:', opcoes:['Direct Speech','Indirect/Reported Speech','Passive Voice','Interrogative form'], correta:1, tipo:'multipla' },
      { pergunta:'O que é um "modal verb"?', opcoes:['Verbo no passado','Verbo auxiliar que expressa possibilidade ou obrigação','Verbo no gerúndio','Verbo irregular'], correta:1, tipo:'multipla' },
      { pergunta:'Qual modal expressa obrigação forte?', opcoes:['Can','May','Must','Should'], correta:2, tipo:'multipla' },
      { pergunta:'"Despite being tired, she finished the race." "Despite" equivale a:', opcoes:['Porque','Portanto','Apesar de','Antes de'], correta:2, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'Qual tempo verbal é "She had already left when he arrived"?', opcoes:['Past Simple','Past Continuous','Past Perfect','Present Perfect'], correta:2, tipo:'multipla' },
      { pergunta:'"It is suggested that everyone ___ a seat." Complete com subjuntivo:', opcoes:['takes','take','took','taking'], correta:1, tipo:'multipla' },
      { pergunta:'O que é "inversion" em inglês formal?', opcoes:['Voz passiva','Inversão da ordem sujeito-verbo para ênfase','Gerúndio','Condicional'], correta:1, tipo:'multipla' },
      { pergunta:'"Not only did he win, but he also broke the record." Esta estrutura é:', opcoes:['Comparativa','Inversão com "not only"','Condicional tipo 3','Voz passiva'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a diferença entre "affect" e "effect"?', opcoes:['"Affect" é substantivo; "effect" é verbo','"Affect" é verbo; "effect" é substantivo','São sinônimos','Ambos são advérbios'], correta:1, tipo:'multipla' },
    ]
  }

}; // fim PERGUNTAS

// ============================================================
//  ESTADO DO JOGO
// ============================================================
let estado = {
  fase:           'lobby',
  jogadores:      {},
  materiaAtual:   'portugues',
  nivelAtual:     '6ano',
  perguntaAtual:  null,
  indicePergunta: -1,
  perguntasUsadas:[],
  timerPergunta:  null,
  totalRodadas:   10,
  rodadaAtual:    0,
  respostasRodada:{},
  tempoInicio:    0
};

// ============================================================
//  UTILITÁRIOS
// ============================================================
function getRanking() {
  return Object.entries(estado.jogadores)
    .map(([id, j]) => ({ id, nome: j.nome, emoji: j.emoji, pontos: j.pontos }))
    .sort((a, b) => b.pontos - a.pontos);
}

function proximaPergunta() {
  const banco = PERGUNTAS[estado.materiaAtual]?.[estado.nivelAtual] || [];
  if (!banco.length) return null;

  const disponíveis = banco.filter((_, i) => !estado.perguntasUsadas.includes(i));
  const pool = disponíveis.length ? disponíveis : banco;
  if (!disponíveis.length) estado.perguntasUsadas = [];

  const indice = banco.indexOf(pool[Math.floor(Math.random() * pool.length)]);
  estado.perguntasUsadas.push(indice);
  return banco[indice];
}

function encerrarRodada() {
  clearTimeout(estado.timerPergunta);

  let primeiro = null, menorTempo = Infinity;
  Object.entries(estado.respostasRodada).forEach(([id, r]) => {
    if (r.correta && r.tempo < menorTempo) { menorTempo = r.tempo; primeiro = id; }
  });

  Object.entries(estado.respostasRodada).forEach(([id, r]) => {
    if (!estado.jogadores[id]) return;
    if (r.correta) {
      estado.jogadores[id].pontos += 10;
      if (id === primeiro) estado.jogadores[id].pontos += 5;
    } else {
      estado.jogadores[id].pontos = Math.max(0, estado.jogadores[id].pontos - 5);
    }
  });

  Object.keys(estado.jogadores).forEach(id => {
    if (!estado.respostasRodada[id])
      estado.jogadores[id].pontos = Math.max(0, estado.jogadores[id].pontos - 2);
  });

  if (!estado.perguntaAtual) return;

  io.emit('fim_rodada', {
    respostaCorreta: estado.perguntaAtual.correta,
    respostas:       estado.respostasRodada,
    primeiroAcertou: primeiro,
    ranking:         getRanking()
  });

  estado.rodadaAtual++;

  if (estado.rodadaAtual >= estado.totalRodadas) {
    setTimeout(() => {
      estado.fase = 'resultado';
      io.emit('fim_jogo', { ranking: getRanking() });
    }, 3500);
  }
}

// ============================================================
//  ENVIAR PERGUNTA
// ============================================================
function enviarPergunta() {
  if (estado.rodadaAtual >= estado.totalRodadas) return;

  estado.respostasRodada = {};
  estado.perguntaAtual   = proximaPergunta();
  if (!estado.perguntaAtual) return;
  estado.tempoInicio     = Date.now();

  Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].respondeu = false; });

  io.emit('nova_pergunta', {
    pergunta:     estado.perguntaAtual.pergunta,
    opcoes:       estado.perguntaAtual.opcoes,
    tipo:         estado.perguntaAtual.tipo,
    rodada:       estado.rodadaAtual + 1,
    totalRodadas: estado.totalRodadas,
    tempo:        10,
    materia:      estado.materiaAtual
  });

  console.log(`❓ [${estado.materiaAtual}/${estado.nivelAtual}] Rodada ${estado.rodadaAtual + 1}: ${estado.perguntaAtual.pergunta.substring(0,50)}...`);

  estado.timerPergunta = setTimeout(encerrarRodada, 10000);
}

// ============================================================
//  SOCKET.IO
// ============================================================
io.on('connection', (socket) => {
  console.log(`✅ Conectado: ${socket.id}`);

  socket.emit('estado_atual', {
    fase:         estado.fase,
    ranking:      getRanking(),
    nivel:        estado.nivelAtual,
    materia:      estado.materiaAtual,
    totalRodadas: estado.totalRodadas,
    materias:     Object.keys(PERGUNTAS),
    niveis:       ['4ano','5ano','6ano','7ano','8ano','9ano']
  });

  socket.on('entrar_lobby', ({ nome, emoji }) => {
    if (!nome || !emoji) return;
    estado.jogadores[socket.id] = { nome: nome.trim().substring(0,20), emoji, pontos:0, respondeu:false };
    console.log(`👤 ${emoji} ${nome} entrou`);
    io.emit('atualizar_lobby', { jogadores: getRanking(), mensagem: `${emoji} ${nome} entrou!` });
  });

  socket.on('iniciar_jogo', ({ nivel, totalRodadas, materia }) => {
    estado.fase          = 'jogando';
    estado.nivelAtual    = nivel   || '6ano';
    estado.totalRodadas  = totalRodadas || 10;
    estado.materiaAtual  = materia || 'portugues';
    estado.rodadaAtual   = 0;
    estado.perguntasUsadas = [];
    Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].pontos = 0; });

    io.emit('jogo_iniciado', { nivel: estado.nivelAtual, totalRodadas: estado.totalRodadas, materia: estado.materiaAtual });
    console.log(`🎮 Jogo iniciado! Matéria: ${estado.materiaAtual}, Nível: ${estado.nivelAtual}, Rodadas: ${estado.totalRodadas}`);
    setTimeout(enviarPergunta, 2000);
  });

  socket.on('proxima_pergunta', () => {
    if (estado.fase !== 'jogando') return;
    clearTimeout(estado.timerPergunta);
    enviarPergunta();
  });

  socket.on('responder', ({ resposta }) => {
    if (estado.fase !== 'jogando' || !estado.jogadores[socket.id] || estado.respostasRodada[socket.id]) return;
    const correta = resposta === estado.perguntaAtual.correta;
    estado.respostasRodada[socket.id] = { resposta, tempo: Date.now() - estado.tempoInicio, correta };
    socket.emit('feedback_resposta', { correta, resposta });
    const total = Object.keys(estado.jogadores).length;
    io.emit('progresso_respostas', { responderam: Object.keys(estado.respostasRodada).length, total });
    if (Object.keys(estado.respostasRodada).length >= total) encerrarRodada();
  });

  socket.on('resetar_jogo', () => {
    clearTimeout(estado.timerPergunta);
    estado.fase = 'lobby'; estado.rodadaAtual = 0;
    estado.perguntasUsadas = []; estado.perguntaAtual = null;
    Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].pontos = 0; });
    io.emit('jogo_resetado', { ranking: getRanking() });
    console.log('🔄 Jogo resetado');
  });

  socket.on('disconnect', () => {
    if (estado.jogadores[socket.id]) {
      const j = estado.jogadores[socket.id];
      console.log(`❌ ${j.emoji} ${j.nome} saiu`);
      delete estado.jogadores[socket.id];
      io.emit('atualizar_lobby', { jogadores: getRanking(), mensagem: `${j.emoji} ${j.nome} saiu` });
    }
  });
});

// ============================================================
//  INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const total = Object.values(PERGUNTAS).flatMap(m => Object.values(m)).flat().length;
  console.log(`\n🎮 Batalha do Saber rodando em http://localhost:${PORT}`);
  console.log(`📚 ${total} perguntas em ${Object.keys(PERGUNTAS).length} matérias carregadas!\n`);
});