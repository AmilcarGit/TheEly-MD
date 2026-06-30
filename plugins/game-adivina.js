import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const personajes = [
  { nombre: 'Goku', pistas: ['Es un saiyajin', 'Le encanta pelear y comer', 'Tiene el pelo negro y amarillo', 'Su técnica más famosa es el Kamehameha'], categoria: '🌌 Anime' },
  { nombre: 'Naruto', pistas: ['Es un ninja', 'Quiere ser Hokage', 'Tiene un zorro dentro de él', 'Su técnica es el Rasengan'], categoria: '🌌 Anime' },
  { nombre: 'Luffy', pistas: ['Es un pirata', 'Usa sombrero de paja', 'Quiere ser el Rey de los Piratas', 'Es de goma y usa el Gear 5'], categoria: '🌌 Anime' },
  { nombre: 'Pikachu', pistas: ['Es un Pokémon', 'Es amarillo', 'Tiene rayas en la espalda', 'Su ataque más famoso es el Impactrueno'], categoria: '🎮 Videojuegos' },
  { nombre: 'Mario', pistas: ['Es un fontanero', 'Usa un gorro rojo', 'Salta sobre hongos', 'Rescata a la princesa Peach'], categoria: '🎮 Videojuegos' },
  { nombre: 'Sonic', pistas: ['Es un erizo', 'Es muy rápido', 'Es de color azul', 'Corre a velocidad supersónica'], categoria: '🎮 Videojuegos' },
  { nombre: 'Harry Potter', pistas: ['Es un mago', 'Tiene una cicatriz en la frente', 'Va a una escuela de magia', 'Su varita es de acebo y pluma de fénix'], categoria: '🎬 Series/Películas' },
  { nombre: 'Spider-Man', pistas: ['Es un superhéroe', 'Fue mordido por una araña', 'Lanza telarañas', 'Su tío Ben le dijo "Un gran poder conlleva una gran responsabilidad"'], categoria: '🎬 Series/Películas' },
  { nombre: 'Iron Man', pistas: ['Es un superhéroe', 'Es multimillonario', 'Usa una armadura tecnológica', 'Su nombre real es Tony Stark'], categoria: '🎬 Series/Películas' },
  { nombre: 'Batman', pistas: ['Es un superhéroe', 'Es multimillonario', 'Vive en Gotham', 'Su identidad secreta es Bruce Wayne'], categoria: '🎬 Series/Películas' },
  { nombre: 'Superman', pistas: ['Es un superhéroe', 'Viene de Krypton', 'Es casi invencible', 'Su debilidad es la kriptonita'], categoria: '🎬 Series/Películas' },
  { nombre: 'Wonder Woman', pistas: ['Es una superheroína', 'Viene de Themyscira', 'Tiene un lazo de la verdad', 'Su nombre es Diana Prince'], categoria: '🎬 Series/Películas' },
  { nombre: 'Messi', pistas: ['Es un futbolista', 'Es argentino', 'Jugó en el Barcelona', 'Es zurdo y ha ganado 8 Balones de Oro'], categoria: '⚽ Deportes' },
  { nombre: 'Ronaldo', pistas: ['Es un futbolista', 'Es portugués', 'Jugó en el Real Madrid', 'Su famoso grito es "Siiiiii"'], categoria: '⚽ Deportes' },
  { nombre: 'Michael Jordan', pistas: ['Es un basquetbolista', 'Estadounidense', 'Jugó en los Chicago Bulls', 'Su número era el 23'], categoria: '⚽ Deportes' },
  { nombre: 'Albert Einstein', pistas: ['Fue un científico', 'Tenía el pelo desordenado', 'Su ecuación más famosa es E=mc²', 'Ganó el Nobel de Física en 1921'], categoria: '🧠 Historia' },
  { nombre: 'Leonardo Da Vinci', pistas: ['Fue un artista e inventor', 'Pintó la Mona Lisa', 'Era zurdo', 'También fue un gran anatomista'], categoria: '🧠 Historia' },
  { nombre: 'Cleopatra', pistas: ['Fue una reina', 'Era egipcia', 'Fue amante de Julio César', 'Murió por la mordedura de una serpiente'], categoria: '🧠 Historia' },
  { nombre: 'Cristóbal Colón', pistas: ['Fue un explorador', 'Era italiano', 'Descubrió América en 1492', 'Sus barcos eran la Niña, la Pinta y la Santa María'], categoria: '🧠 Historia' },
  { nombre: 'Shrek', pistas: ['Es un ogro', 'Vive en un pantano', 'Tiene un burro como amigo', 'Su frase famosa es "Esto es como un ogro, tiene capas"'], categoria: '🎬 Series/Películas' }
]

function crearMensaje(chat, text, userId, m, opciones = []) {
  const rows = opciones.map((nombre, index) => ({
    title: nombre,
    id: `adivina_${index}_${userId}`
  }))

  const buttons = [{
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: '🎯 ELIGE UN PERSONAJE',
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
            title: '🌼 THEELY-MD — ADIVINA',
            subtitle: '¿Quién es el personaje?',
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

let handler = async (m, { conn }) => {
  const randomPersonaje = personajes[Math.floor(Math.random() * personajes.length)]
  const opciones = personajes.sort(() => Math.random() - 0.5).slice(0, 4)
  if (!opciones.includes(randomPersonaje)) opciones[Math.floor(Math.random() * 4)] = randomPersonaje

  global.adivina = global.adivina || {}
  global.adivina[m.sender] = {
    personaje: randomPersonaje,
    opciones: opciones,
    pistaNivel: 0,
    inicio: Date.now()
  }

  const pista = randomPersonaje.pistas[0]
  const texto = [
    `╔══〔 🌼 *ADIVINA EL PERSONAJE* 〕══╗`,
    `║`,
    `║ 📂 *Categoría:* ${randomPersonaje.categoria}`,
    `║ 🔍 *Pista 1/4:* ${pista}`,
    `║ ⭐ *Pistas usadas:* 0/4`,
    `║`,
    `║ 👇 *Elige el personaje que creas*`,
    `║`,
    ...opciones.map(o => `║ • ${o}`),
    `║`,
    `║ 💡 *Tienes 4 pistas disponibles*`,
    `║ 📌 *Escribe .pista para más ayuda*`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, texto, m.sender, m, opciones)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id
    if (!id?.startsWith('adivina_')) return

    const [, respuestaIndex, userId] = id.split('_')
    const juego = global.adivina?.[userId]
    if (!juego) {
      await conn.sendMessage(m.chat, { text: '❌ *No hay juego activo.* Usa .adivina para empezar.' }, { quoted: m })
      return true
    }

    const seleccion = parseInt(respuestaIndex)
    const opcionElegida = juego.opciones[seleccion]
    const correcta = opcionElegida === juego.personaje.nombre

    const tiempoSeg = Math.floor((Date.now() - juego.inicio) / 1000)
    const moneda = global.moneda || '🌼 ElyCoins'

    let mensaje = [
      `╔══〔 🌼 *ADIVINA EL PERSONAJE* 〕══╗`,
      `║`,
      correcta ? `║ ✅ *¡CORRECTO!* 🎉` : `║ ❌ *¡INCORRECTO!*`,
      `║`,
      `║ 🎯 *Personaje:* ${juego.personaje.nombre}`,
      `║ 📂 *Categoría:* ${juego.personaje.categoria}`,
      `║ ⏱️ *Tiempo:* ${tiempoSeg}s`,
      `║`
    ]

    if (correcta) {
      const xp = Math.floor(Math.random() * 40) + 20
      const coins = Math.floor(Math.random() * 80) + 30
      const user = global.db.data.users[userId]
      if (!user) global.db.data.users[userId] = { exp: 0, coin: 0 }
      user.exp = (user.exp || 0) + xp
      user.coin = (user.coin || 0) + coins
      await global.db.write()
      mensaje.push(`║ 🎁 *Premios:* +${xp} XP  +${coins} ${moneda}`)
    } else {
      mensaje.push(`║ 💡 *Pistas disponibles: 4/4*`)
    }

    mensaje.push(
      `║`,
      `║ 💡 Usa .adivina para jugar otra vez`,
      `╚══════════════════════════════════╝`
    )

    delete global.adivina[userId]
    await conn.sendMessage(m.chat, { text: mensaje.join('\n') }, { quoted: m })
    await m.react(correcta ? '✅' : '❌')
    return true

  } catch (e) {
    console.error('❌ Error en adivina:', e.message)
  }
}

handler.command = ['adivina']
handler.tags    = ['game']
handler.help    = ['adivina']
handler.register = true
handler.desc    = 'Adivina el personaje con pistas'

export default handler