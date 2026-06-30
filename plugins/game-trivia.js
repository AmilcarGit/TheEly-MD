import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// ========== BASE DE DATOS DE PREGUNTAS ==========
const categorias = {
  '🌍 Cultura General': [
    { pregunta: '¿Cuál es el país más grande del mundo?', opciones: ['Rusia', 'Canadá', 'China', 'EE.UU.'], correcta: 0 },
    { pregunta: '¿Quién pintó la Mona Lisa?', opciones: ['Van Gogh', 'Picasso', 'Da Vinci', 'Miguel Ángel'], correcta: 2 },
    { pregunta: '¿En qué año llegó el hombre a la Luna?', opciones: ['1967', '1968', '1969', '1970'], correcta: 2 },
    { pregunta: '¿Cuál es el río más largo del mundo?', opciones: ['Nilo', 'Amazonas', 'Yangtsé', 'Misisipi'], correcta: 0 },
    { pregunta: '¿Qué planeta es conocido como el "Planeta Rojo"?', opciones: ['Venus', 'Marte', 'Júpiter', 'Saturno'], correcta: 1 },
    { pregunta: '¿Cuántos huesos tiene el cuerpo humano adulto?', opciones: ['196', '206', '216', '226'], correcta: 1 },
    { pregunta: '¿Quién escribió "Cien años de soledad"?', opciones: ['Mario Vargas Llosa', 'Gabriel García Márquez', 'Julio Cortázar', 'Pablo Neruda'], correcta: 1 },
    { pregunta: '¿En qué continente está Egipto?', opciones: ['Asia', 'África', 'Europa', 'Oceanía'], correcta: 1 },
    { pregunta: '¿Cuál es el animal más rápido del mundo?', opciones: ['Guepardo', 'León', 'Antílope', 'Avestruz'], correcta: 0 },
    { pregunta: '¿Qué gas es el más abundante en la atmósfera terrestre?', opciones: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Argón'], correcta: 1 }
  ],
  '🎮 Videojuegos': [
    { pregunta: '¿En qué año se lanzó Minecraft?', opciones: ['2007', '2008', '2009', '2010'], correcta: 2 },
    { pregunta: '¿Cuál es el personaje principal de la saga Zelda?', opciones: ['Link', 'Zelda', 'Ganondorf', 'Epona'], correcta: 0 },
    { pregunta: '¿Qué compañía creó Fortnite?', opciones: ['EA', 'Ubisoft', 'Epic Games', 'Blizzard'], correcta: 2 },
    { pregunta: '¿Cuál es el Pokémon número 1?', opciones: ['Pikachu', 'Bulbasaur', 'Charmander', 'Squirtle'], correcta: 1 },
    { pregunta: '¿En qué plataforma se estrenó God of War (2018)?', opciones: ['PS4', 'Xbox One', 'PC', 'Switch'], correcta: 0 },
    { pregunta: '¿Qué significa "RPG" en el mundo de los videojuegos?', opciones: ['Role-Playing Game', 'Real-Player Game', 'Rapid-Play Game', 'Retro-Play Game'], correcta: 0 },
    { pregunta: '¿Cuál es el juego más vendido de la historia?', opciones: ['Minecraft', 'Grand Theft Auto V', 'Tetris', 'PUBG'], correcta: 0 },
    { pregunta: '¿Quién es el protagonista de la saga Halo?', opciones: ['Master Chief', 'Doom Slayer', 'Marcus Fenix', 'Commander Shepard'], correcta: 0 },
    { pregunta: '¿En qué año apareció por primera vez Super Mario?', opciones: ['1983', '1984', '1985', '1986'], correcta: 2 },
    { pregunta: '¿Cuál es el nombre del villano principal de Metroid?', opciones: ['Ridley', 'Kraid', 'Mother Brain', 'Samus'], correcta: 0 }
  ],
  '🧠 Ciencia': [
    { pregunta: '¿Cuál es la fórmula del agua?', opciones: ['H2O', 'CO2', 'NaCl', 'HCl'], correcta: 0 },
    { pregunta: '¿Qué partícula subatómica tiene carga negativa?', opciones: ['Protón', 'Neutrón', 'Electrón', 'Fotón'], correcta: 2 },
    { pregunta: '¿A qué velocidad viaja la luz aproximadamente?', opciones: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correcta: 0 },
    { pregunta: '¿Cuál es el elemento más abundante en el universo?', opciones: ['Helio', 'Hidrógeno', 'Oxígeno', 'Carbono'], correcta: 1 },
    { pregunta: '¿Qué tipo de sangre es considerado donante universal?', opciones: ['A', 'B', 'AB', 'O'], correcta: 3 },
    { pregunta: '¿En qué capa de la atmósfera se encuentra la capa de ozono?', opciones: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Termosfera'], correcta: 1 },
    { pregunta: '¿Cuál es el animal más longevo del mundo?', opciones: ['Ballena boreal', 'Tortuga gigante', 'Medusa Turritopsis', 'Elefante'], correcta: 0 },
    { pregunta: '¿Qué proceso realizan las plantas para obtener energía?', opciones: ['Fotosíntesis', 'Respiración', 'Fermentación', 'Transpiración'], correcta: 0 },
    { pregunta: '¿Cuántos planetas tiene el sistema solar?', opciones: ['7', '8', '9', '10'], correcta: 1 },
    { pregunta: '¿Qué ciencia estudia los fósiles?', opciones: ['Arqueología', 'Paleontología', 'Geología', 'Biología'], correcta: 1 }
  ],
  '🏛️ Historia': [
    { pregunta: '¿En qué año cayó el Imperio Romano de Occidente?', opciones: ['410 d.C.', '476 d.C.', '500 d.C.', '530 d.C.'], correcta: 1 },
    { pregunta: '¿Quién fue el primer presidente de Estados Unidos?', opciones: ['George Washington', 'Thomas Jefferson', 'John Adams', 'Benjamin Franklin'], correcta: 0 },
    { pregunta: '¿Qué imperio construyó Machu Picchu?', opciones: ['Inca', 'Azteca', 'Maya', 'Chibcha'], correcta: 0 },
    { pregunta: '¿En qué guerra se utilizó la primera bomba atómica?', opciones: ['Primera Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra de Vietnam', 'Guerra de Corea'], correcta: 1 },
    { pregunta: '¿Quién fue el líder de la Revolución Rusa de 1917?', opciones: ['Lenin', 'Stalin', 'Trotsky', 'Kerensky'], correcta: 0 },
    { pregunta: '¿Qué civilización construyó las pirámides de Giza?', opciones: ['Mesopotámica', 'Egipcia', 'Griega', 'Romana'], correcta: 1 },
    { pregunta: '¿En qué año se independizó Colombia?', opciones: ['1810', '1819', '1821', '1830'], correcta: 1 },
    { pregunta: '¿Quién fue el primer emperador de China?', opciones: ['Qin Shi Huang', 'Han Wudi', 'Tang Taizong', 'Song Taizu'], correcta: 0 },
    { pregunta: '¿Qué evento marcó el inicio de la Edad Media?', opciones: ['Caída de Roma', 'Nacimiento de Cristo', 'Invasión de los hunos', 'Coronación de Carlomagno'], correcta: 0 },
    { pregunta: '¿Cuál fue la primera civilización de la humanidad?', opciones: ['Sumeria', 'Egipcia', 'Indus', 'China'], correcta: 0 }
  ],
  '🌼 TheEly': [
    { pregunta: '¿Cómo se llama el creador de TheEly-MD?', opciones: ['Amilcar', 'Alex', 'Andrea', 'Carlos'], correcta: 0 },
    { pregunta: '¿Qué lenguaje está escrito el bot?', opciones: ['Python', 'JavaScript', 'Java', 'C++'], correcta: 1 },
    { pregunta: '¿Qué librería usa TheEly-MD para WhatsApp?', opciones: ['Baileys', 'WhatsApp-Web', 'Puppeteer', 'Selenium'], correcta: 0 },
    { pregunta: '¿Cuál es el nombre de la moneda del bot?', opciones: ['ElyCoins', 'TheCoins', 'BotCoins', 'Elysium'], correcta: 0 },
    { pregunta: '¿Qué emoji identifica a TheEly-MD?', opciones: ['🌼', '🌸', '🌻', '🌺'], correcta: 0 },
    { pregunta: '¿Cuántos plugins tiene actualmente TheEly-MD?', opciones: ['Más de 50', 'Más de 80', 'Más de 100', 'Más de 120'], correcta: 2 },
    { pregunta: '¿Qué sistema de juegos se ha añadido recientemente?', opciones: ['Gacha', 'Trivia', 'Ahorcado', 'Todos los anteriores'], correcta: 3 },
    { pregunta: '¿Cuál es el comando para ver los comandos disponibles?', opciones: ['.menu', '.help', '.comandos', 'Todos los anteriores'], correcta: 3 },
    { pregunta: '¿Qué tipo de bot es TheEly-MD?', opciones: ['Bot de WhatsApp', 'Bot de Telegram', 'Bot de Discord', 'Bot de Messenger'], correcta: 0 },
    { pregunta: '¿En qué plataforma se puede encontrar TheEly-MD?', opciones: ['GitHub', 'GitLab', 'Bitbucket', 'SourceForge'], correcta: 0 }
  ]
}

// ========== FUNCIÓN PARA CREAR MENSAJE INTERACTIVO ==========
function crearMensaje(chat, text, userId, m, opciones = []) {
  const rows = opciones.map((opcion, index) => ({
    title: opcion,
    id: `trivia_${index}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '📋 ELIGE UNA RESPUESTA',
      sections: [{
        title: '🔽 Opciones disponibles',
        rows
      }]
    })
  }]

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — TRIVIA',
            subtitle: 'Demuestra tu conocimiento',
            hasMediaAttachment: false
          },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: { buttons }
        })
      }
    }
  }, { quoted: m })
}

// ========== HANDLER PRINCIPAL ==========
let handler = async (m, { conn }) => {
  const categoriasLista = Object.keys(categorias)
  const menuText = [
    `╔══〔 🌼 *TRIVIA ELY* 〕══╗`,
    `║`,
    `║ 🎯 *Elige una categoría:*`,
    `║`,
    ...categoriasLista.map((cat, i) => `║ ${i+1}. ${cat}`),
    `║`,
    `║ 💡 Escribe: .trivia <número>`,
    `║ Ejemplo: .trivia 1`,
    `║`,
    `║ 🏆 *Premios:* XP + monedas`,
    `║ ❤️ *3 vidas* — ¡no falles!`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const args = m.text.split(' ').slice(1)
  if (!args.length) {
    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m })
    return
  }

  const index = parseInt(args[0]) - 1
  if (isNaN(index) || index < 0 || index >= categoriasLista.length) {
    await conn.sendMessage(m.chat, { text: '❌ *Categoría no válida.* Usa .trivia para ver las opciones.' }, { quoted: m })
    return
  }

  const categoriaSeleccionada = categoriasLista[index]
  const preguntas = categorias[categoriaSeleccionada]
  const randomPreguntas = preguntas.sort(() => Math.random() - 0.5).slice(0, 5) // 5 preguntas aleatorias

  global.trivia = global.trivia || {}
  global.trivia[m.sender] = {
    categoria: categoriaSeleccionada,
    preguntas: randomPreguntas,
    actual: 0,
    vidas: 3,
    aciertos: 0,
    inicio: Date.now()
  }

  await enviarPregunta(m, conn, m.sender)
}

// ========== FUNCIÓN PARA ENVIAR PREGUNTA ==========
async function enviarPregunta(m, conn, userId) {
  const juego = global.trivia?.[userId]
  if (!juego) return

  const { preguntas, actual, vidas, categoria } = juego
  if (actual >= preguntas.length || vidas <= 0) {
    await finalizarTrivia(m, conn, userId)
    return
  }

  const pregunta = preguntas[actual]
  const opciones = pregunta.opciones.map((op, i) => `${String.fromCharCode(65 + i)}. ${op}`)
  const texto = [
    `╔══〔 🌼 *TRIVIA ELY* 〕══╗`,
    `║`,
    `║ 📂 *Categoría:* ${categoria}`,
    `║ ❤️ *Vidas:* ${'❤️'.repeat(vidas)}${'🖤'.repeat(3 - vidas)}`,
    `║ 🏆 *Aciertos:* ${juego.aciertos}/${preguntas.length}`,
    `║ 📊 *Pregunta:* ${actual+1}/${preguntas.length}`,
    `║`,
    `║ 📝 *${pregunta.pregunta}*`,
    `║`,
    ...opciones.map(o => `║ ${o}`),
    `║`,
    `║ 👇 *Selecciona tu respuesta*`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, texto, userId, m, pregunta.opciones)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

// ========== FINALIZAR TRIVIA ==========
async function finalizarTrivia(m, conn, userId) {
  const juego = global.trivia?.[userId]
  if (!juego) return

  const { aciertos, preguntas, vidas, inicio } = juego
  const total = preguntas.length
  const tiempoSeg = Math.floor((Date.now() - inicio) / 1000)
  const moneda = global.moneda || '🌼 ElyCoins'

  // Calcular premios
  let xp = 0, coins = 0
  if (aciertos > 0) {
    xp = Math.floor((aciertos / total) * 80) + 10
    coins = Math.floor((aciertos / total) * 150) + 20
  }

  const user = global.db.data.users[userId]
  if (!user) global.db.data.users[userId] = { exp: 0, coin: 0 }
  user.exp = (user.exp || 0) + xp
  user.coin = (user.coin || 0) + coins
  await global.db.write()

  const mensajeFinal = [
    `╔══〔 🌼 *TRIVIA FINALIZADA* 〕══╗`,
    `║`,
    `║ 📊 *Resultados:*`,
    `║ ✅ Aciertos: ${aciertos}/${total}`,
    `║ ❤️ Vidas restantes: ${vidas}/3`,
    `║ ⏱️ Tiempo: ${tiempoSeg}s`,
    `║`,
    `║ 🎁 *Premios:*`,
    `║ ✨ +${xp} XP`,
    `║ 💰 +${coins} ${moneda}`,
    `║`,
    `║ ${aciertos === total ? '🏆 ¡PERFECTO! 🎉' : vidas > 0 ? '😊 ¡Buen intento!' : '💀 ¡No te rindas!'}`,
    `║`,
    `║ 💡 Usa .trivia para jugar otra vez`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  delete global.trivia[userId]
  await conn.sendMessage(m.chat, { text: mensajeFinal }, { quoted: m })
  await m.react('🏆')
}

// ========== MANEJADOR DE RESPUESTAS ==========
handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('trivia_')) return

    const [, respuestaIndex, userId] = id.split('_')
    const juego = global.trivia?.[userId]
    if (!juego) {
      await conn.sendMessage(m.chat, { text: '❌ *No hay trivia activa.* Usa .trivia para empezar.' }, { quoted: m })
      return true
    }

    const { preguntas, actual, vidas } = juego
    const pregunta = preguntas[actual]
    const correcta = pregunta.correcta
    const seleccion = parseInt(respuestaIndex)

    let acierto = seleccion === correcta
    if (acierto) {
      juego.aciertos++
      await m.react('✅')
    } else {
      juego.vidas--
      await m.react('❌')
    }

    juego.actual++

    if (juego.actual >= preguntas.length || juego.vidas <= 0) {
      await finalizarTrivia(m, conn, userId)
    } else {
      await enviarPregunta(m, conn, userId)
    }

    return true

  } catch (e) {
    console.error('❌ Error en trivia:', e.message)
  }
}

handler.command = ['trivia']
handler.tags    = ['game']
handler.help    = ['trivia [categoría]']
handler.register = true
handler.desc    = 'Juego de preguntas y respuestas con premios'

export default handler