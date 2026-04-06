// ============================================================
// BATALHA DO SABER v2 — Servidor Node.js + Socket.io
// Modos: Quiz, Forca, Memória, Velocidade
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
//  BANCO DE PERGUNTAS (Quiz)
// ============================================================
const PERGUNTAS = {
  portugues: {
    '4ano': [
      { pergunta:'Qual palavra está escrita corretamente?', opcoes:['Bicicreta','Bicicleta','Biscicleta','Biciscleta'], correta:1, tipo:'multipla' },
      { pergunta:'Complete: "Ontem eu ___ ao parque."', opcoes:['vai','fui','vou','ido'], correta:1, tipo:'completar' },
      { pergunta:'Qual frase está correta?', opcoes:['Eu gosto muito de sorvete.','Eu gosta muito de sorvete.','Eu gostas muito de sorvete.','Eu gostam muito de sorvete.'], correta:0, tipo:'corrigir' },
      { pergunta:'Quantas sílabas tem a palavra "borboleta"?', opcoes:['2 sílabas','3 sílabas','4 sílabas','5 sílabas'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o plural de "pão"?', opcoes:['Pãos','Pães','Pão','Pão-s'], correta:1, tipo:'multipla' },
      { pergunta:'O que é um substantivo?', opcoes:['Palavra que indica ação','Palavra que dá nome a seres, coisas e lugares','Palavra que liga outras palavras','Palavra que qualifica algo'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o feminino de "ator"?', opcoes:['Actriz','Atoriz','Atriz','Atora'], correta:2, tipo:'multipla' },
      { pergunta:'"Cachorro" é sinônimo de:', opcoes:['Gato','Cão','Cavalo','Peixe'], correta:1, tipo:'multipla' },
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
    ],
    '8ano': [
      { pergunta:'Qual período é composto por subordinação?', opcoes:['Cheguei e fui dormir.','Espero que você venha.','Ele saiu, mas ela ficou.','Vai logo ou fica!'], correta:1, tipo:'multipla' },
      { pergunta:'Que tipo de oração é "para que todos entendessem"?', opcoes:['Oração subordinada adverbial causal','Oração subordinada adverbial final','Oração subordinada substantiva','Oração coordenada'], correta:1, tipo:'multipla' },
      { pergunta:'Identifique a figura de linguagem: "O silêncio gritou no corredor."', opcoes:['Hipérbole','Paradoxo','Personificação','Eufemismo'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o modo verbal de "Estude mais!"?', opcoes:['Indicativo','Subjuntivo','Imperativo','Infinitivo'], correta:2, tipo:'multipla' },
      { pergunta:'"Embora estivesse cansado, ele trabalhou." A subordinada é:', opcoes:['Causal','Concessiva','Condicional','Comparativa'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a voz do verbo em "A porta foi aberta"?', opcoes:['Ativa','Passiva analítica','Passiva sintética','Reflexiva'], correta:1, tipo:'multipla' },
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
      { pergunta:'Colocação correta do pronome: "Ele ___ disse ontem."', opcoes:['me','lhe','o','se'], correta:0, tipo:'multipla' },
    ]
  },
  matematica: {
    '4ano': [
      { pergunta:'Quanto é 345 + 278?', opcoes:['513','623','633','523'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o resultado de 7 × 8?', opcoes:['54','56','58','62'], correta:1, tipo:'multipla' },
      { pergunta:'500 – 237 = ?', opcoes:['263','273','253','283'], correta:0, tipo:'multipla' },
      { pergunta:'Qual número é par?', opcoes:['13','27','34','51'], correta:2, tipo:'multipla' },
      { pergunta:'48 ÷ 6 = ?', opcoes:['6','7','8','9'], correta:2, tipo:'multipla' },
      { pergunta:'Qual fração representa metade?', opcoes:['1/3','1/4','1/2','2/3'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o dobro de 35?', opcoes:['60','65','70','75'], correta:2, tipo:'multipla' },
      { pergunta:'9 × 9 = ?', opcoes:['72','81','90','63'], correta:1, tipo:'multipla' },
    ],
    '5ano': [
      { pergunta:'Qual é o MMC de 4 e 6?', opcoes:['8','12','16','24'], correta:1, tipo:'multipla' },
      { pergunta:'0,5 é igual a qual fração?', opcoes:['1/4','1/5','1/2','2/5'], correta:2, tipo:'multipla' },
      { pergunta:'25% de 200 é:', opcoes:['25','40','50','75'], correta:2, tipo:'multipla' },
      { pergunta:'Qual número é primo?', opcoes:['9','12','13','15'], correta:2, tipo:'multipla' },
      { pergunta:'2,5 × 4 = ?', opcoes:['8','9','10','11'], correta:2, tipo:'multipla' },
      { pergunta:'3/5 + 1/5 = ?', opcoes:['4/10','4/5','2/5','3/10'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o quadrado de 7?', opcoes:['14','42','49','56'], correta:2, tipo:'multipla' },
      { pergunta:'3 dúzias de ovos = quantos ovos?', opcoes:['24','30','36','48'], correta:2, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'Qual é o resultado de (–3) × (–5)?', opcoes:['–15','–8','8','15'], correta:3, tipo:'multipla' },
      { pergunta:'Qual é a raiz quadrada de 144?', opcoes:['11','12','13','14'], correta:1, tipo:'multipla' },
      { pergunta:'3² + 4² = ?', opcoes:['25','49','14','7'], correta:0, tipo:'multipla' },
      { pergunta:'50% de 360 é:', opcoes:['100','150','180','200'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o valor de x: 2x + 4 = 14?', opcoes:['3','4','5','6'], correta:2, tipo:'multipla' },
      { pergunta:'(–8) + (+3) = ?', opcoes:['11','–5','5','–11'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o valor de 5³?', opcoes:['15','25','125','150'], correta:2, tipo:'multipla' },
      { pergunta:'Se 3 camisas custam R$90, qual o preço de 1?', opcoes:['R$20','R$25','R$30','R$35'], correta:2, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Equação do 1º grau: 3x – 9 = 0. Qual é x?', opcoes:['2','3','4','6'], correta:1, tipo:'multipla' },
      { pergunta:'Um produto custa R$80 com 20% de desconto. Quanto paga?', opcoes:['R$60','R$64','R$68','R$70'], correta:1, tipo:'multipla' },
      { pergunta:'Se y = 2x + 1 e x = 4, qual é y?', opcoes:['7','8','9','10'], correta:2, tipo:'multipla' },
      { pergunta:'Simplifique: 8x + 3x – 2x', opcoes:['9x','10x','11x','13x'], correta:0, tipo:'multipla' },
      { pergunta:'Velocidade média: 180 km em 2h =', opcoes:['60 km/h','80 km/h','90 km/h','100 km/h'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o valor de x²+x para x=3?', opcoes:['9','10','11','12'], correta:3, tipo:'multipla' },
      { pergunta:'Sequência 2,5,8,11... Qual é o próximo?', opcoes:['12','13','14','15'], correta:2, tipo:'multipla' },
      { pergunta:'O MDC de 12 e 18 é:', opcoes:['3','4','6','9'], correta:2, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'Bhaskara: x²– 5x + 6 = 0. Raízes:', opcoes:['x=1 e x=6','x=2 e x=3','x=–2 e x=–3','x=0 e x=5'], correta:1, tipo:'multipla' },
      { pergunta:'Triângulo retângulo com catetos 3 e 4: hipotenusa =', opcoes:['5','6','7','8'], correta:0, tipo:'multipla' },
      { pergunta:'Discriminante de x²+ 2x + 1 = 0:', opcoes:['0','1','2','4'], correta:0, tipo:'multipla' },
      { pergunta:'sen(30°) = ?', opcoes:['0','0,5','√2/2','√3/2'], correta:1, tipo:'multipla' },
      { pergunta:'Área de um círculo com raio 5 (π≈3,14):', opcoes:['15,7','31,4','78,5','157'], correta:2, tipo:'multipla' },
      { pergunta:'PA com razão 3: 2,5,8,11... décimo termo:', opcoes:['27','28','29','30'], correta:2, tipo:'multipla' },
      { pergunta:'cos(60°) = ?', opcoes:['0','0,5','√2/2','1'], correta:1, tipo:'multipla' },
      { pergunta:'A soma dos ângulos internos de um triângulo é:', opcoes:['90°','180°','270°','360°'], correta:1, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'log₁₀(1000) = ?', opcoes:['2','3','4','10'], correta:1, tipo:'multipla' },
      { pergunta:'Num PG, a₁=2 e q=3. Qual é a₄?', opcoes:['18','27','54','81'], correta:2, tipo:'multipla' },
      { pergunta:'tg(45°) = ?', opcoes:['0','0,5','1','√3'], correta:2, tipo:'multipla' },
      { pergunta:'Distância entre (1,2) e (4,6):', opcoes:['3','4','5','6'], correta:2, tipo:'multipla' },
      { pergunta:'Média aritmética de 4, 8, 12, 16:', opcoes:['8','10','12','14'], correta:1, tipo:'multipla' },
      { pergunta:'x²+y²=25 é a equação de uma circunferência com raio:', opcoes:['5','10','25','√5'], correta:0, tipo:'multipla' },
      { pergunta:'Conjunto solução de x² < 9:', opcoes:['x<3','–3<x<3','x>–3','x<–3 ou x>3'], correta:1, tipo:'multipla' },
      { pergunta:'Derivada de f(x) = 3x²:', opcoes:['3x','6x','6','3x³'], correta:1, tipo:'multipla' },
    ]
  },
  ciencias: {
    '4ano': [
      { pergunta:'Qual processo produz alimento nas plantas?', opcoes:['Respiração','Digestão','Fotossíntese','Excreção'], correta:2, tipo:'multipla' },
      { pergunta:'Qual planeta é mais próximo do Sol?', opcoes:['Vênus','Terra','Marte','Mercúrio'], correta:3, tipo:'multipla' },
      { pergunta:'Quantos planetas tem o Sistema Solar?', opcoes:['7','8','9','10'], correta:1, tipo:'multipla' },
      { pergunta:'O coração bombeia o que pelo corpo?', opcoes:['Ar','Sangue','Linfa','Água'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é a unidade básica dos seres vivos?', opcoes:['Átomo','Célula','Tecido','Órgão'], correta:1, tipo:'multipla' },
      { pergunta:'Onde ocorre a fotossíntese nas plantas?', opcoes:['Raiz','Caule','Flor','Folha'], correta:3, tipo:'multipla' },
      { pergunta:'O estado físico da água a 0°C:', opcoes:['Gasoso','Líquido','Sólido','Plasma'], correta:2, tipo:'multipla' },
      { pergunta:'Animais herbívoros comem:', opcoes:['Carne','Plantas','Insetos','Frutas e carne'], correta:1, tipo:'multipla' },
    ],
    '6ano': [
      { pergunta:'O que são fungos?', opcoes:['Plantas sem clorofila','Reino à parte, nem planta nem animal','Tipo de bactéria','Algas microscópicas'], correta:1, tipo:'multipla' },
      { pergunta:'A mitose resulta em:', opcoes:['2 células idênticas','4 células diferentes','1 célula maior','Células sem núcleo'], correta:0, tipo:'multipla' },
      { pergunta:'Qual vitamina o Sol ajuda a produzir?', opcoes:['Vitamina A','Vitamina B12','Vitamina C','Vitamina D'], correta:3, tipo:'multipla' },
      { pergunta:'Principal função dos rins:', opcoes:['Bombear sangue','Filtrar sangue e produzir urina','Produzir bile','Absorver nutrientes'], correta:1, tipo:'multipla' },
      { pergunta:'Célula eucariota se diferencia da procariota por ter:', opcoes:['Parede celular','Membrana plasmática','Núcleo definido','Ribossomos'], correta:2, tipo:'multipla' },
      { pergunta:'O efeito estufa natural é importante para:', opcoes:['Destruir a camada de ozônio','Manter a temperatura da Terra habitável','Aumentar a chuva ácida','Reduzir a luz solar'], correta:1, tipo:'multipla' },
      { pergunta:'A cadeia alimentar começa com:', opcoes:['Predadores','Decompositores','Produtores (plantas)','Consumidores'], correta:2, tipo:'multipla' },
      { pergunta:'DNA e RNA são tipos de:', opcoes:['Proteínas','Carboidratos','Ácidos nucleicos','Lipídios'], correta:2, tipo:'multipla' },
    ],
    '9ano': [
      { pergunta:'A teoria da evolução foi proposta por:', opcoes:['Gregor Mendel','Isaac Newton','Charles Darwin','Louis Pasteur'], correta:2, tipo:'multipla' },
      { pergunta:'O que é seleção natural?', opcoes:['Escolha artificial de características','Sobrevivência dos mais adaptados','Mutações aleatórias','Cruzamento entre espécies'], correta:1, tipo:'multipla' },
      { pergunta:'A meiose produz:', opcoes:['2 células idênticas','4 células com metade dos cromossomos','1 célula maior','Células somáticas'], correta:1, tipo:'multipla' },
      { pergunta:'Se B (castanho) domina b (azul), fenótipo de Bb é:', opcoes:['Azul','Castanho','Misto','Nenhum'], correta:1, tipo:'multipla' },
      { pergunta:'Função da camada de ozônio:', opcoes:['Reter calor','Filtrar raios UV','Produzir oxigênio','Regular chuvas'], correta:1, tipo:'multipla' },
      { pergunta:'Anticorpos são produzidos por:', opcoes:['Glóbulos vermelhos','Plaquetas','Linfócitos B','Neurônios'], correta:2, tipo:'multipla' },
      { pergunta:'O que é homeostase?', opcoes:['Divisão celular','Equilíbrio interno do organismo','Transporte de nutrientes','Digestão química'], correta:1, tipo:'multipla' },
      { pergunta:'Decompositores no ecossistema:', opcoes:['Produzem alimento','Decompõem matéria e reciclam nutrientes','Polinizam flores','Predam animais'], correta:1, tipo:'multipla' },
    ]
  },
  historia: {
    '5ano': [
      { pergunta:'A Independência do Brasil ocorreu em:', opcoes:['1800','1822','1888','1889'], correta:1, tipo:'multipla' },
      { pergunta:'O "Grito do Ipiranga" foi dado por:', opcoes:['Dom Pedro II','Dom João VI','Dom Pedro I','Tiradentes'], correta:2, tipo:'multipla' },
      { pergunta:'A abolição da escravatura ocorreu em:', opcoes:['1822','1850','1888','1889'], correta:2, tipo:'multipla' },
      { pergunta:'Quem assinou a Lei Áurea?', opcoes:['Princesa Isabel','Dom Pedro I','Deodoro da Fonseca','Dom João VI'], correta:0, tipo:'multipla' },
      { pergunta:'Quem descobriu o Brasil?', opcoes:['Cristóvão Colombo','Pedro Álvares Cabral','Vasco da Gama','Américo Vespúcio'], correta:1, tipo:'multipla' },
      { pergunta:'Em que ano o Brasil foi descoberto?', opcoes:['1492','1498','1500','1550'], correta:2, tipo:'multipla' },
      { pergunta:'A Proclamação da República ocorreu em:', opcoes:['1822','1850','1888','1889'], correta:3, tipo:'multipla' },
      { pergunta:'Tiradentes é símbolo da:', opcoes:['Monarquia','Escravidão','Inconfidência Mineira','Revolução Francesa'], correta:2, tipo:'multipla' },
    ],
    '8ano': [
      { pergunta:'A Primeira Guerra Mundial começou em:', opcoes:['1910','1914','1918','1939'], correta:1, tipo:'multipla' },
      { pergunta:'O Holocausto foi:', opcoes:['Uma batalha naval','Genocídio de judeus e outros pelo nazismo','Uma revolução comunista','A bomba atômica'], correta:1, tipo:'multipla' },
      { pergunta:'A Revolução Russa (1917) instaurou:', opcoes:['Democracia liberal','Fascismo','Comunismo','Monarquia constitucional'], correta:2, tipo:'multipla' },
      { pergunta:'A Guerra Fria foi entre:', opcoes:['EUA e China','EUA e URSS','Europa e América Latina','EUA e Alemanha'], correta:1, tipo:'multipla' },
      { pergunta:'Quando terminou a 2ª Guerra Mundial?', opcoes:['1943','1944','1945','1946'], correta:2, tipo:'multipla' },
      { pergunta:'A Revolução Industrial começou em qual país?', opcoes:['França','Alemanha','EUA','Inglaterra'], correta:3, tipo:'multipla' },
      { pergunta:'Napoleão Bonaparte era de qual país?', opcoes:['Itália','Espanha','França','Alemanha'], correta:2, tipo:'multipla' },
      { pergunta:'As Cruzadas tinham objetivo de:', opcoes:['Colonizar a América','Reconquistar a Terra Santa','Comercializar com a Ásia','Explorar a África'], correta:1, tipo:'multipla' },
    ]
  },
  ingles: {
    '5ano': [
      { pergunta:'O plural de "child" em inglês é:', opcoes:['Childs','Childes','Children','Childrens'], correta:2, tipo:'multipla' },
      { pergunta:'"She ___ a teacher." Complete:', opcoes:['am','is','are','be'], correta:1, tipo:'multipla' },
      { pergunta:'What does "beautiful" mean?', opcoes:['Feio','Bonito','Triste','Rápido'], correta:1, tipo:'multipla' },
      { pergunta:'Como se forma o passado de "go"?', opcoes:['Goed','Goes','Went','Gone'], correta:2, tipo:'multipla' },
      { pergunta:'O oposto de "big" em inglês é:', opcoes:['Tall','Small','Fast','Old'], correta:1, tipo:'multipla' },
      { pergunta:'Como se diz "Cachorro" em inglês?', opcoes:['Cat','Dog','Bird','Fish'], correta:1, tipo:'multipla' },
      { pergunta:'"Good morning" significa:', opcoes:['Boa tarde','Boa noite','Bom dia','Até logo'], correta:2, tipo:'multipla' },
      { pergunta:'Como se diz "vermelho" em inglês?', opcoes:['Blue','Red','Green','Pink'], correta:1, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Qual é o passado simples de "eat"?', opcoes:['Eated','Ate','Eaten','Eat'], correta:1, tipo:'multipla' },
      { pergunta:'"Have you ever been to Paris?" É:', opcoes:['Simple Past','Present Simple','Present Perfect','Future Simple'], correta:2, tipo:'multipla' },
      { pergunta:'"She is taller than her brother." É grau:', opcoes:['Positivo','Comparativo','Superlativo','Neutro'], correta:1, tipo:'multipla' },
      { pergunta:'O que significa "however"?', opcoes:['Portanto','No entanto','Além disso','Porque'], correta:1, tipo:'multipla' },
      { pergunta:'Qual é o gerúndio de "swim"?', opcoes:['Swims','Swiming','Swimming','Swimmed'], correta:2, tipo:'multipla' },
      { pergunta:'"If I had money, I ___ buy a car."', opcoes:['will','would','can','should'], correta:1, tipo:'multipla' },
      { pergunta:'Voz passiva de "They built the bridge":', opcoes:['The bridge built they.','The bridge was built by them.','They are building the bridge.','The bridge has been built.'], correta:1, tipo:'multipla' },
      { pergunta:'"Eventually" em inglês significa:', opcoes:['Eventualmente (às vezes)','Finalmente / no fim','Rapidamente','Claramente'], correta:1, tipo:'multipla' },
    ]
  },
  geografia: {
    '5ano': [
      { pergunta:'Qual é a capital do Brasil?', opcoes:['São Paulo','Rio de Janeiro','Brasília','Salvador'], correta:2, tipo:'multipla' },
      { pergunta:'O Brasil está localizado em qual continente?', opcoes:['África','Europa','Américas','Ásia'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o maior estado do Brasil?', opcoes:['São Paulo','Pará','Minas Gerais','Amazonas'], correta:3, tipo:'multipla' },
      { pergunta:'Qual é o rio mais longo do Brasil?', opcoes:['Rio São Francisco','Rio Paraná','Rio Amazonas','Rio Tocantins'], correta:2, tipo:'multipla' },
      { pergunta:'Quantos países fazem fronteira com o Brasil?', opcoes:['8','9','10','11'], correta:2, tipo:'multipla' },
      { pergunta:'A Região Nordeste tem quantos estados?', opcoes:['7','8','9','10'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o maior continente do mundo?', opcoes:['América','África','Ásia','Europa'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o oceano mais extenso do mundo?', opcoes:['Atlântico','Índico','Ártico','Pacífico'], correta:3, tipo:'multipla' },
    ],
    '7ano': [
      { pergunta:'Qual é a capital da Argentina?', opcoes:['Montevidéu','Santiago','Buenos Aires','Lima'], correta:2, tipo:'multipla' },
      { pergunta:'O PIB mede:', opcoes:['A população de um país','A riqueza produzida num país','A área de um país','Os recursos naturais'], correta:1, tipo:'multipla' },
      { pergunta:'O que é êxodo rural?', opcoes:['Migração do campo para a cidade','Migração da cidade para o campo','Crescimento da zona rural','Redução da população urbana'], correta:0, tipo:'multipla' },
      { pergunta:'A cordilheira mais extensa da América do Sul:', opcoes:['Serra do Mar','Andes','Pirineus','Himalaia'], correta:1, tipo:'multipla' },
      { pergunta:'Qual país é o mais populoso do mundo?', opcoes:['EUA','Índia','China','Rússia'], correta:1, tipo:'multipla' },
      { pergunta:'O Meridiano de Greenwich define:', opcoes:['Longitude 0°','Latitude 0°','Altitude 0','O polo Norte'], correta:0, tipo:'multipla' },
      { pergunta:'O Mercosul é um bloco de países da:', opcoes:['América do Norte','América Central','América do Sul','Europa'], correta:2, tipo:'multipla' },
      { pergunta:'Qual é o maior deserto do mundo?', opcoes:['Sahara','Kalahari','Atacama','Gobi'], correta:0, tipo:'multipla' },
    ]
  }
};

// ============================================================
//  PALAVRAS DA FORCA (por matéria e nível)
// ============================================================
const PALAVRAS_FORCA = {
  portugues: {
    '4ano': [
      { palavra:'BORBOLETA', dica:'Inseto que voa com asas coloridas' },
      { palavra:'BIBLIOTECA', dica:'Local onde ficam os livros' },
      { palavra:'SUBSTANTIVO', dica:'Tipo de classe gramatical' },
      { palavra:'ALFABETO', dica:'Conjunto de letras da língua' },
      { palavra:'SILABA', dica:'Unidade sonora da palavra' },
      { palavra:'DITONGO', dica:'Duas vogais na mesma sílaba' },
      { palavra:'PLURAL', dica:'Mais de um, vários' },
      { palavra:'VERBO', dica:'Palavra que indica ação' },
    ],
    '5ano': [
      { palavra:'ADJETIVO', dica:'Palavra que qualifica o substantivo' },
      { palavra:'CONJUGAR', dica:'Flexionar o verbo nas pessoas' },
      { palavra:'SINÔNIMO', dica:'Palavra com mesmo significado' },
      { palavra:'ANTÔNIMO', dica:'Palavra com significado oposto' },
      { palavra:'PREDICADO', dica:'Parte da oração que fala do sujeito' },
      { palavra:'PRONOME', dica:'Substitui ou acompanha o substantivo' },
      { palavra:'ADVÉRBIO', dica:'Modifica o verbo, adjetivo ou advérbio' },
      { palavra:'ESTROFE', dica:'Conjunto de versos de um poema' },
    ],
    '6ano': [
      { palavra:'METÁFORA', dica:'Comparação sem "como" ou "que"' },
      { palavra:'CRASE', dica:'Fusão da preposição "a" com o artigo' },
      { palavra:'SUJEITO', dica:'Quem pratica ou sofre a ação' },
      { palavra:'PREDICATIVO', dica:'Complemento do verbo de ligação' },
      { palavra:'PASSIVA', dica:'Voz em que o sujeito sofre a ação' },
      { palavra:'HIPÉRBOLE', dica:'Exagero usado como figura de linguagem' },
      { palavra:'ORAÇÃO', dica:'Unidade sintática com verbo' },
      { palavra:'PERÍODO', dica:'Frase com uma ou mais orações' },
    ],
    '7ano': [
      { palavra:'SUBJUNTIVO', dica:'Modo verbal da incerteza e desejo' },
      { palavra:'SUBORDINADA', dica:'Oração que depende de outra' },
      { palavra:'PLEONASMO', dica:'Redundância de sentido' },
      { palavra:'EUFEMISMO', dica:'Suavização de algo desagradável' },
      { palavra:'IRONIA', dica:'Dizer o oposto do que se quer' },
      { palavra:'ANTÍTESE', dica:'Oposição de ideias' },
      { palavra:'METONÍMIA', dica:'Substituição por relação de proximidade' },
      { palavra:'COORDENADA', dica:'Oração independente sintaticamente' },
    ],
    '8ano': [
      { palavra:'PERSONIFICAÇÃO', dica:'Atribuir características humanas a seres não humanos' },
      { palavra:'IMPERATIVO', dica:'Modo verbal que expressa ordem' },
      { palavra:'CONCESSIVA', dica:'Oração com "embora", "apesar de"' },
      { palavra:'APOSTO', dica:'Elemento que explica um substantivo' },
      { palavra:'VOCATIVO', dica:'Elemento que chama ou interpela' },
      { palavra:'AGENTE', dica:'Na voz passiva, quem pratica a ação' },
      { palavra:'CONSECUTIVA', dica:'Oração que exprime consequência' },
      { palavra:'PARTICÍPIO', dica:'Forma nominal do verbo (amado, feito)' },
    ],
    '9ano': [
      { palavra:'REGÊNCIA', dica:'Relação de dependência entre palavras' },
      { palavra:'CONCORDÂNCIA', dica:'Harmonia entre termos da frase' },
      { palavra:'COLOCAÇÃO', dica:'Posição dos pronomes na frase' },
      { palavra:'POLISSÍNDETO', dica:'Repetição de conjunções' },
      { palavra:'ASSÍNDETO', dica:'Ausência de conjunções' },
      { palavra:'ANACOLUTO', dica:'Ruptura da estrutura sintática' },
      { palavra:'ZEUGMA', dica:'Omissão de termo já expresso' },
      { palavra:'ELIPSE', dica:'Omissão de termo facilmente subentendido' },
    ]
  },
  matematica: {
    '4ano': [
      { palavra:'DIVISÃO', dica:'Operação aritmética oposta à multiplicação' },
      { palavra:'FRAÇÃO', dica:'Número que representa partes de um todo' },
      { palavra:'DEZENA', dica:'Grupo de dez unidades' },
      { palavra:'CENTENA', dica:'Grupo de cem unidades' },
      { palavra:'NUMERAL', dica:'Palavra que indica quantidade' },
      { palavra:'PERÍMETRO', dica:'Soma dos lados de uma figura' },
      { palavra:'METADE', dica:'Dividido em dois partes iguais' },
      { palavra:'DOBRO', dica:'Duas vezes um número' },
    ],
    '6ano': [
      { palavra:'EQUAÇÃO', dica:'Igualdade com incógnita' },
      { palavra:'POTÊNCIA', dica:'Multiplicação do número por ele mesmo' },
      { palavra:'RAIZ', dica:'Operação inversa da potência' },
      { palavra:'PROPORÇÃO', dica:'Igualdade entre duas razões' },
      { palavra:'INCÓGNITA', dica:'Valor desconhecido numa equação' },
      { palavra:'NEGATIVO', dica:'Número menor que zero' },
      { palavra:'PORCENTAGEM', dica:'Relação de um valor por cem' },
      { palavra:'MONOMIO', dica:'Expressão algébrica com um único termo' },
    ],
    '9ano': [
      { palavra:'LOGARITMO', dica:'Expoente de uma potência' },
      { palavra:'TRIGONOMETRIA', dica:'Estudo das relações nos triângulos' },
      { palavra:'PROBABILIDADE', dica:'Chance de um evento ocorrer' },
      { palavra:'ESTATÍSTICA', dica:'Coleta e análise de dados' },
      { palavra:'PARÁBOLA', dica:'Curva formada por equação do 2º grau' },
      { palavra:'DERIVADA', dica:'Taxa de variação de uma função' },
      { palavra:'GEOMETRIA', dica:'Ramo da matemática que estuda formas' },
      { palavra:'CIRCUNFERÊNCIA', dica:'Curva fechada com todos os pontos equidistantes do centro' },
    ]
  },
  ciencias: {
    '5ano': [
      { palavra:'CÉLULA', dica:'Unidade básica dos seres vivos' },
      { palavra:'FOTOSSÍNTESE', dica:'Processo pelo qual plantas produzem alimento' },
      { palavra:'SISTEMA', dica:'Conjunto de órgãos com função comum' },
      { palavra:'VERTEBRADO', dica:'Animal que tem coluna vertebral' },
      { palavra:'HERBÍVORO', dica:'Animal que come apenas plantas' },
      { palavra:'CADEIA', dica:'Sequência alimentar' },
      { palavra:'ECOSSISTEMA', dica:'Seres vivos + ambiente' },
      { palavra:'VOLCÃO', dica:'Abertura na crosta que expele magma' },
    ],
    '8ano': [
      { palavra:'CROMOSSOMO', dica:'Estrutura que carrega o DNA' },
      { palavra:'METABOLISMO', dica:'Conjunto de reações químicas do organismo' },
      { palavra:'HOMEOSTASE', dica:'Equilíbrio interno do organismo' },
      { palavra:'FERMENTAÇÃO', dica:'Processo sem oxigênio para obter energia' },
      { palavra:'ANTICORPO', dica:'Proteína do sistema imune' },
      { palavra:'MUTAÇÃO', dica:'Alteração no material genético' },
      { palavra:'PARASITISMO', dica:'Relação onde um prejudica o outro' },
      { palavra:'SIMBIOSE', dica:'Relação íntima entre organismos de espécies diferentes' },
    ]
  },
  historia: {
    '6ano': [
      { palavra:'FEUDALISMO', dica:'Sistema social da Idade Média' },
      { palavra:'FARAÓ', dica:'Governante do Egito antigo' },
      { palavra:'DEMOCRACIA', dica:'Sistema de governo popular' },
      { palavra:'COLONIZAÇÃO', dica:'Ocupação de território por outro povo' },
      { palavra:'ESCRAVIDÃO', dica:'Condição de ser escravo' },
      { palavra:'REVOLUÇÃO', dica:'Transformação profunda e rápida' },
      { palavra:'IMPÉRIO', dica:'Território governado por um imperador' },
      { palavra:'CRUZADAS', dica:'Expedições cristãs medievais' },
    ],
    '9ano': [
      { palavra:'GLOBALIZAÇÃO', dica:'Integração econômica e cultural mundial' },
      { palavra:'NAZISMO', dica:'Ideologia totalitária alemã do séc. XX' },
      { palavra:'IMPERIALISMO', dica:'Dominação política e econômica de outros povos' },
      { palavra:'SOCIALISMO', dica:'Sistema que defende coletivização dos meios de produção' },
      { palavra:'DITADURA', dica:'Governo autoritário sem eleições livres' },
      { palavra:'REPUBLICA', dica:'Forma de governo com representação popular' },
      { palavra:'TOTALITARISMO', dica:'Controle total do Estado sobre a sociedade' },
      { palavra:'INDEPENDÊNCIA', dica:'Liberdade de um povo de se auto-governar' },
    ]
  },
  ingles: {
    '5ano': [
      { palavra:'BUTTERFLY', dica:'Inseto com asas coloridas' },
      { palavra:'BEAUTIFUL', dica:'Muito bonito' },
      { palavra:'YESTERDAY', dica:'O dia antes de hoje' },
      { palavra:'SCHOOL', dica:'Lugar onde se aprende' },
      { palavra:'FRIEND', dica:'Pessoa com quem se tem amizade' },
      { palavra:'FAMILY', dica:'Grupo de pessoas relacionadas' },
      { palavra:'HAPPY', dica:'Sentimento positivo' },
      { palavra:'TEACHER', dica:'Quem ensina em sala de aula' },
    ],
    '8ano': [
      { palavra:'GRAMMAR', dica:'Estudo das regras de uma língua' },
      { palavra:'ADJECTIVE', dica:'Word that describes a noun' },
      { palavra:'VOCABULARY', dica:'Conjunto de palavras de uma língua' },
      { palavra:'PRONOUN', dica:'Word that replaces a noun' },
      { palavra:'CONDITIONAL', dica:'Estrutura "if...would"' },
      { palavra:'SUBJUNCTIVE', dica:'Modo verbal da incerteza em inglês' },
      { palavra:'PARTICIPLE', dica:'Forma verbal usada em tempos compostos' },
      { palavra:'AUXILIARY', dica:'Verbo auxiliar (do, have, be)' },
    ]
  }
};

// ============================================================
//  CARTAS DA MEMÓRIA (pares temáticos por matéria)
// ============================================================
const CARTAS_MEMORIA = {
  portugues: [
    { id:1, conteudo:'Substantivo', par:2 }, { id:2, conteudo:'Nome de ser', par:1 },
    { id:3, conteudo:'Adjetivo', par:4 },    { id:4, conteudo:'Qualidade', par:3 },
    { id:5, conteudo:'Verbo', par:6 },        { id:6, conteudo:'Ação', par:5 },
    { id:7, conteudo:'Advérbio', par:8 },     { id:8, conteudo:'Modifica verbo', par:7 },
    { id:9, conteudo:'Sujeito', par:10 },     { id:10, conteudo:'Quem faz', par:9 },
    { id:11, conteudo:'Predicado', par:12 },  { id:12, conteudo:'O que se diz', par:11 },
  ],
  matematica: [
    { id:1, conteudo:'Soma', par:2 },         { id:2, conteudo:'Adição', par:1 },
    { id:3, conteudo:'Subtração', par:4 },    { id:4, conteudo:'Diminuir', par:3 },
    { id:5, conteudo:'Produto', par:6 },      { id:6, conteudo:'Multiplicação', par:5 },
    { id:7, conteudo:'Quociente', par:8 },    { id:8, conteudo:'Divisão', par:7 },
    { id:9, conteudo:'Raiz', par:10 },        { id:10, conteudo:'√', par:9 },
    { id:11, conteudo:'Potência', par:12 },   { id:12, conteudo:'Expoente', par:11 },
  ],
  ciencias: [
    { id:1, conteudo:'Célula', par:2 },             { id:2, conteudo:'Unidade da vida', par:1 },
    { id:3, conteudo:'Fotossíntese', par:4 },        { id:4, conteudo:'CO₂ + luz → glicose', par:3 },
    { id:5, conteudo:'DNA', par:6 },                 { id:6, conteudo:'Material genético', par:5 },
    { id:7, conteudo:'Mitose', par:8 },              { id:8, conteudo:'2 células iguais', par:7 },
    { id:9, conteudo:'Herbívoro', par:10 },          { id:10, conteudo:'Come plantas', par:9 },
    { id:11, conteudo:'Ecossistema', par:12 },       { id:12, conteudo:'Ser vivo + ambiente', par:11 },
  ],
  historia: [
    { id:1, conteudo:'1500', par:2 },             { id:2, conteudo:'Descoberta do Brasil', par:1 },
    { id:3, conteudo:'1822', par:4 },             { id:4, conteudo:'Independência', par:3 },
    { id:5, conteudo:'1888', par:6 },             { id:6, conteudo:'Lei Áurea', par:5 },
    { id:7, conteudo:'1889', par:8 },             { id:8, conteudo:'República', par:7 },
    { id:9, conteudo:'1914', par:10 },            { id:10, conteudo:'1ª Guerra Mundial', par:9 },
    { id:11, conteudo:'1945', par:12 },           { id:12, conteudo:'Fim da 2ª Guerra', par:11 },
  ],
  ingles: [
    { id:1, conteudo:'Dog', par:2 },         { id:2, conteudo:'Cachorro', par:1 },
    { id:3, conteudo:'Happy', par:4 },       { id:4, conteudo:'Feliz', par:3 },
    { id:5, conteudo:'Beautiful', par:6 },   { id:6, conteudo:'Bonito', par:5 },
    { id:7, conteudo:'School', par:8 },      { id:8, conteudo:'Escola', par:7 },
    { id:9, conteudo:'Family', par:10 },     { id:10, conteudo:'Família', par:9 },
    { id:11, conteudo:'Teacher', par:12 },   { id:12, conteudo:'Professor', par:11 },
  ],
  geografia: [
    { id:1, conteudo:'Brasília', par:2 },    { id:2, conteudo:'Capital do Brasil', par:1 },
    { id:3, conteudo:'Amazonas', par:4 },    { id:4, conteudo:'Maior estado', par:3 },
    { id:5, conteudo:'Pacífico', par:6 },    { id:6, conteudo:'Maior oceano', par:5 },
    { id:7, conteudo:'Ásia', par:8 },        { id:8, conteudo:'Maior continente', par:7 },
    { id:9, conteudo:'Sahara', par:10 },     { id:10, conteudo:'Maior deserto', par:9 },
    { id:11, conteudo:'Andes', par:12 },     { id:12, conteudo:'Cordilheira da América do Sul', par:11 },
  ]
};

// ============================================================
//  ESTADO DO JOGO
// ============================================================
let estado = {
  fase:           'lobby',   // lobby | jogando | resultado
  modoJogo:       'quiz',    // quiz | forca | memoria | velocidade
  jogadores:      {},
  materiaAtual:   'portugues',
  nivelAtual:     '6ano',
  perguntaAtual:  null,
  perguntasUsadas:[],
  timerPergunta:  null,
  totalRodadas:   10,
  rodadaAtual:    0,
  respostasRodada:{},
  tempoInicio:    0,
  tempoPergunta:  10,  // tempo configurável pelo professor

  // Forca
  forca: {
    palavraAtual:  '',
    dicaAtual:     '',
    letrasErradas: [],
    letrasCorretas:[],
    tentativas:    6,
    palavrasUsadas:[]
  },

  // Memória
  memoria: {
    cartas:        [],
    viradas:       [],    // [idx1, idx2] em progresso
    paresFeitos:   [],    // ids dos pares encontrados
    travada:       false, // previne clique durante animação
    pontosPorPar:  20
  }
};

// ============================================================
//  UTILITÁRIOS
// ============================================================
function getRanking() {
  return Object.entries(estado.jogadores)
    .map(([id, j]) => ({ id, nome: j.nome, emoji: j.emoji, pontos: j.pontos }))
    .sort((a, b) => b.pontos - a.pontos);
}

function proximaPerguntaQuiz() {
  const banco = PERGUNTAS[estado.materiaAtual]?.[estado.nivelAtual] || [];
  if (!banco.length) return null;
  const pool = banco.filter((_, i) => !estado.perguntasUsadas.includes(i));
  const usarPool = pool.length ? pool : banco;
  if (!pool.length) estado.perguntasUsadas = [];
  const indice = banco.indexOf(usarPool[Math.floor(Math.random() * usarPool.length)]);
  estado.perguntasUsadas.push(indice);
  return banco[indice];
}

function encerrarRodadaQuiz() {
  clearTimeout(estado.timerPergunta);
  let primeiro = null, menorTempo = Infinity;
  Object.entries(estado.respostasRodada).forEach(([id, r]) => {
    if (r.correta && r.tempo < menorTempo) { menorTempo = r.tempo; primeiro = id; }
  });

  Object.entries(estado.respostasRodada).forEach(([id, r]) => {
    if (!estado.jogadores[id]) return;
    if (r.correta) {
      // Modo velocidade: pontos baseados no tempo
      if (estado.modoJogo === 'velocidade') {
        const tempoMax = estado.tempoPergunta * 1000;
        const bonus = Math.round((1 - r.tempo / tempoMax) * 20); // 0-20 pts bônus
        estado.jogadores[id].pontos += 10 + Math.max(0, bonus);
      } else {
        estado.jogadores[id].pontos += 10;
        if (id === primeiro) estado.jogadores[id].pontos += 5;
      }
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
    respostas: estado.respostasRodada,
    primeiroAcertou: primeiro,
    ranking: getRanking(),
    modoJogo: estado.modoJogo
  });

  estado.rodadaAtual++;
  if (estado.rodadaAtual >= estado.totalRodadas) {
    setTimeout(() => { estado.fase = 'resultado'; io.emit('fim_jogo', { ranking: getRanking() }); }, 3500);
  }
}

// ============================================================
//  ENVIAR PERGUNTA (Quiz / Velocidade)
// ============================================================
function enviarPerguntaQuiz() {
  if (estado.rodadaAtual >= estado.totalRodadas) return;
  estado.respostasRodada = {};
  estado.perguntaAtual   = proximaPerguntaQuiz();
  if (!estado.perguntaAtual) return;
  estado.tempoInicio = Date.now();
  Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].respondeu = false; });

  io.emit('nova_pergunta', {
    pergunta:     estado.perguntaAtual.pergunta,
    opcoes:       estado.perguntaAtual.opcoes,
    tipo:         estado.perguntaAtual.tipo,
    rodada:       estado.rodadaAtual + 1,
    totalRodadas: estado.totalRodadas,
    tempo:        estado.tempoPergunta,
    materia:      estado.materiaAtual,
    modoJogo:     estado.modoJogo
  });

  estado.timerPergunta = setTimeout(encerrarRodadaQuiz, estado.tempoPergunta * 1000);
}

// ============================================================
//  FORCA
// ============================================================
function iniciarForca() {
  const banco = PALAVRAS_FORCA[estado.materiaAtual]?.[estado.nivelAtual] || PALAVRAS_FORCA.portugues['6ano'];
  const pool  = banco.filter(p => !estado.forca.palavrasUsadas.includes(p.palavra));
  const usarPool = pool.length ? pool : banco;
  if (!pool.length) estado.forca.palavrasUsadas = [];
  const escolhida = usarPool[Math.floor(Math.random() * usarPool.length)];
  estado.forca.palavrasUsadas.push(escolhida.palavra);

  estado.forca.palavraAtual   = escolhida.palavra.toUpperCase();
  estado.forca.dicaAtual      = escolhida.dica;
  estado.forca.letrasErradas  = [];
  estado.forca.letrasCorretas = [];
  estado.forca.tentativas     = 6;

  io.emit('forca_nova_palavra', {
    tamanho:    estado.forca.palavraAtual.length,
    dica:       estado.forca.dicaAtual,
    tentativas: estado.forca.tentativas,
    rodada:     estado.rodadaAtual + 1,
    totalRodadas: estado.totalRodadas
  });

  estado.timerPergunta = setTimeout(() => encerrarRodadaForca(false), estado.tempoPergunta * 1000);
}

function encerrarRodadaForca(ganhou) {
  clearTimeout(estado.timerPergunta);
  io.emit('forca_fim_rodada', {
    ganhou,
    palavraCompleta: estado.forca.palavraAtual,
    ranking: getRanking()
  });
  estado.rodadaAtual++;
  if (estado.rodadaAtual >= estado.totalRodadas) {
    setTimeout(() => { estado.fase = 'resultado'; io.emit('fim_jogo', { ranking: getRanking() }); }, 3500);
  } else {
    setTimeout(iniciarForca, 3500);
  }
}

// ============================================================
//  MEMÓRIA
// ============================================================
function iniciarMemoria() {
  const cartasBase = CARTAS_MEMORIA[estado.materiaAtual] || CARTAS_MEMORIA.portugues;
  // Embaralhar
  const embaralhadas = [...cartasBase].sort(() => Math.random() - 0.5);
  estado.memoria.cartas       = embaralhadas.map((c, idx) => ({ ...c, posicao: idx, virada: false, encontrada: false }));
  estado.memoria.viradas      = [];
  estado.memoria.paresFeitos  = [];
  estado.memoria.travada      = false;

  io.emit('memoria_inicio', {
    totalCartas: estado.memoria.cartas.length,
    rodada:      estado.rodadaAtual + 1,
    totalRodadas: estado.totalRodadas
  });

  // Memória: cada round é uma partida completa (sem timer por carta)
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
    modoJogo:     estado.modoJogo
  });

  // ---- LOBBY ----
  socket.on('entrar_lobby', ({ nome, emoji }) => {
    if (!nome || !emoji) return;
    estado.jogadores[socket.id] = { nome: nome.trim().substring(0,20), emoji, pontos:0, respondeu:false };
    console.log(`👤 ${emoji} ${nome} entrou`);
    io.emit('atualizar_lobby', { jogadores: getRanking(), mensagem: `${emoji} ${nome} entrou!` });
  });

  // ---- INICIAR ----
  socket.on('iniciar_jogo', ({ nivel, totalRodadas, materia, modoJogo, tempoPergunta }) => {
    estado.fase          = 'jogando';
    estado.nivelAtual    = nivel        || '6ano';
    estado.totalRodadas  = parseInt(totalRodadas) || 10;
    estado.materiaAtual  = materia      || 'portugues';
    estado.modoJogo      = modoJogo     || 'quiz';
    estado.tempoPergunta = parseInt(tempoPergunta) || 10;
    estado.rodadaAtual   = 0;
    estado.perguntasUsadas = [];
    estado.forca.palavrasUsadas = [];
    Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].pontos = 0; });

    io.emit('jogo_iniciado', {
      nivel: estado.nivelAtual, totalRodadas: estado.totalRodadas,
      materia: estado.materiaAtual, modoJogo: estado.modoJogo,
      tempoPergunta: estado.tempoPergunta
    });
    console.log(`🎮 ${estado.modoJogo.toUpperCase()} | ${estado.materiaAtual} | ${estado.nivelAtual} | ${estado.totalRodadas}R | ${estado.tempoPergunta}s`);

    setTimeout(() => {
      if (estado.modoJogo === 'quiz' || estado.modoJogo === 'velocidade') enviarPerguntaQuiz();
      else if (estado.modoJogo === 'forca') iniciarForca();
      else if (estado.modoJogo === 'memoria') iniciarMemoria();
    }, 2000);
  });

  // ---- PRÓXIMA (professor) ----
  socket.on('proxima_pergunta', () => {
    if (estado.fase !== 'jogando') return;
    clearTimeout(estado.timerPergunta);
    if (estado.modoJogo === 'quiz' || estado.modoJogo === 'velocidade') enviarPerguntaQuiz();
    else if (estado.modoJogo === 'forca') iniciarForca();
    else if (estado.modoJogo === 'memoria') iniciarMemoria();
  });

  // ---- RESPOSTA QUIZ ----
  socket.on('responder', ({ resposta }) => {
    if (estado.fase !== 'jogando') return;
    if (!estado.jogadores[socket.id] || estado.respostasRodada[socket.id]) return;
    const correta = resposta === estado.perguntaAtual.correta;
    estado.respostasRodada[socket.id] = { resposta, tempo: Date.now() - estado.tempoInicio, correta };
    socket.emit('feedback_resposta', { correta, resposta });
    const total = Object.keys(estado.jogadores).length;
    io.emit('progresso_respostas', { responderam: Object.keys(estado.respostasRodada).length, total });
    if (Object.keys(estado.respostasRodada).length >= total) encerrarRodadaQuiz();
  });

  // ---- LETRA FORCA ----
  socket.on('forca_letra', ({ letra }) => {
    if (estado.fase !== 'jogando' || estado.modoJogo !== 'forca') return;
    const L = letra.toUpperCase();
    if (estado.forca.letrasErradas.includes(L) || estado.forca.letrasCorretas.includes(L)) return;

    const acertou = estado.forca.palavraAtual.includes(L);
    if (acertou) {
      estado.forca.letrasCorretas.push(L);
      // Dar pontos a quem acertou
      if (estado.jogadores[socket.id]) estado.jogadores[socket.id].pontos += 5;

      // Verificar se completou a palavra
      const completa = [...estado.forca.palavraAtual].every(c => c === ' ' || estado.forca.letrasCorretas.includes(c));
      if (completa) {
        if (estado.jogadores[socket.id]) estado.jogadores[socket.id].pontos += 20;
        clearTimeout(estado.timerPergunta);
        io.emit('forca_atualizar', {
          letrasCorretas: estado.forca.letrasCorretas,
          letrasErradas:  estado.forca.letrasErradas,
          tentativas:     estado.forca.tentativas,
          ranking:        getRanking(),
          quemAcertou:    socket.id,
          nomeLetter:     L
        });
        setTimeout(() => encerrarRodadaForca(true), 1500);
        return;
      }
    } else {
      estado.forca.letrasErradas.push(L);
      estado.forca.tentativas--;
      if (estado.jogadores[socket.id]) estado.jogadores[socket.id].pontos = Math.max(0, estado.jogadores[socket.id].pontos - 2);

      if (estado.forca.tentativas <= 0) {
        clearTimeout(estado.timerPergunta);
        io.emit('forca_atualizar', {
          letrasCorretas: estado.forca.letrasCorretas,
          letrasErradas:  estado.forca.letrasErradas,
          tentativas:     0,
          ranking:        getRanking(),
          nomeLetter:     L,
          errou:          true
        });
        setTimeout(() => encerrarRodadaForca(false), 1500);
        return;
      }
    }

    io.emit('forca_atualizar', {
      letrasCorretas: estado.forca.letrasCorretas,
      letrasErradas:  estado.forca.letrasErradas,
      tentativas:     estado.forca.tentativas,
      ranking:        getRanking(),
      quemJogou:      socket.id,
      nomeJogador:    estado.jogadores[socket.id]?.nome,
      nomeLetter:     L,
      acertou
    });
  });

  // ---- CARTA MEMÓRIA ----
  socket.on('memoria_carta', ({ posicao }) => {
    if (estado.fase !== 'jogando' || estado.modoJogo !== 'memoria') return;
    if (estado.memoria.travada) return;

    const carta = estado.memoria.cartas[posicao];
    if (!carta || carta.virada || carta.encontrada) return;

    carta.virada = true;
    estado.memoria.viradas.push(posicao);

    io.emit('memoria_virar', { posicao, conteudo: carta.conteudo, jogadorId: socket.id });

    if (estado.memoria.viradas.length === 2) {
      estado.memoria.travada = true;
      const [p1, p2] = estado.memoria.viradas;
      const c1 = estado.memoria.cartas[p1];
      const c2 = estado.memoria.cartas[p2];

      if (c1.par === c2.id) {
        // Par encontrado!
        c1.encontrada = c2.encontrada = true;
        estado.memoria.paresFeitos.push(c1.id, c2.id);
        if (estado.jogadores[socket.id]) estado.jogadores[socket.id].pontos += estado.memoria.pontosPorPar;

        setTimeout(() => {
          estado.memoria.viradas  = [];
          estado.memoria.travada  = false;
          io.emit('memoria_par', { posicoes:[p1,p2], jogadorId:socket.id, ranking: getRanking() });

          // Verificar se acabou
          if (estado.memoria.paresFeitos.length >= estado.memoria.cartas.length) {
            estado.rodadaAtual++;
            if (estado.rodadaAtual >= estado.totalRodadas) {
              setTimeout(() => { estado.fase='resultado'; io.emit('fim_jogo',{ranking:getRanking()}); }, 2000);
            } else {
              setTimeout(iniciarMemoria, 3000);
            }
          }
        }, 600);
      } else {
        // Não é par
        setTimeout(() => {
          c1.virada = c2.virada = false;
          estado.memoria.viradas = [];
          estado.memoria.travada = false;
          io.emit('memoria_erro', { posicoes:[p1,p2] });
        }, 1200);
      }
    }
  });

  // ---- RESET ----
  socket.on('resetar_jogo', () => {
    clearTimeout(estado.timerPergunta);
    estado.fase = 'lobby'; estado.rodadaAtual = 0;
    estado.perguntasUsadas = []; estado.perguntaAtual = null;
    estado.forca.palavrasUsadas = [];
    Object.keys(estado.jogadores).forEach(id => { estado.jogadores[id].pontos = 0; });
    io.emit('jogo_resetado', { ranking: getRanking() });
    console.log('🔄 Jogo resetado');
  });

  // ---- DESCONEXÃO ----
  socket.on('disconnect', () => {
    if (estado.jogadores[socket.id]) {
      const j = estado.jogadores[socket.id];
      delete estado.jogadores[socket.id];
      io.emit('atualizar_lobby', { jogadores: getRanking(), mensagem: `${j.emoji} ${j.nome} saiu` });
    }
  });
});

// ============================================================
//  INICIAR
// ============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const totalQ = Object.values(PERGUNTAS).flatMap(m => Object.values(m)).flat().length;
  const totalP = Object.values(PALAVRAS_FORCA).flatMap(m => Object.values(m)).flat().length;
  console.log(`\n🎮 Batalha do Saber v2 → http://localhost:${PORT}`);
  console.log(`📚 ${totalQ} perguntas | 🔤 ${totalP} palavras da forca | 🃏 Memória incluída\n`);
});