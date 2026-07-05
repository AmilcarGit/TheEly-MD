import fs from 'fs'
import { join } from 'path'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)

    const totalGrupos = Object.keys(global.db.data.chats || {}).filter(id => id.endsWith('@g.us')).length
    const totalUsuarios = Object.keys(global.db.data.users || {}).length

    const ahora = new Date()
    const horaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))

    const date = horaPeru.toLocaleDateString('es', {
      day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
    })

    const time = horaPeru.toLocaleTimeString('es', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })

    let nombreBot = 'TheEly MD'
    let bannerBuffer = null

    const imagePath = join(process.cwd(), 'lib', 'TheElyMD.jpg')
    if (fs.existsSync(imagePath)) {
      bannerBuffer = fs.readFileSync(imagePath)
    } else {
      const rootPath = join(process.cwd(), 'TheElyMD.jpg')
      if (fs.existsSync(rootPath)) bannerBuffer = fs.readFileSync(rootPath)
    }

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join(`./${global.jadi}`, botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
      } catch (e) {}
    }

    const tipo = conn.user.jid === global.conn.user.jid
      ? '𝗕𝗼𝘁 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹'
      : '𝗦𝘂𝗯-𝗕𝗼𝘁'

    const moneda = global.moneda || '🌼 ElyCoins'
    const userCoins = user.coin || 0
    const userBank = user.bank || 0
    const userExp = user.exp || 0

    const texto = `
 ❛ ━━━━━━･❪ 🌼 ❫ ･━━━━━━ ❜
   🂡𝐓 𝐇 𝐄 𝐄 𝐋 𝐘 𓆆 𝐌 𝐃
 ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊ ♡ °̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙˚̩̥̩̥*̩̩̥͙·̩̩̥͙*̩̩̥͙˚̩̥̩̥*̩̩͙‧͙ °̩̥˚̩̩̥͙°̩̥ ♡ ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊

 ‧͙⁺˚*･༓☾ 𝑻𝒉𝒆𝑬𝒍𝒚-𝑴𝑫 ☽༓･*˚⁺‧͙ 
  ║☞ 🤖  𝑩𝒐𝒕☻        ${nombreBot}
  ║☞ 🏷️  𝑴𝒐𝒅𝒐☻      ${tipo}
  ║☞ 📅  𝑭𝒆𝒄𝒉𝒂☻     ${date}
  ║☞ 🕐  𝑯𝒐𝒓𝒂☻      ${time}
  ║☞ 👥  𝑮𝒓𝒖𝒑𝒐𝒔☻    ${totalGrupos}
  ║☞ 👤  𝑼𝒔𝒖𝒂𝒓𝒊𝒐𝒔☻  ${totalUsuarios}
  ❀•°•═════ஓ๑♡๑ஓ═════•°•❀

  𓏲📂 *C A T E G O R Í A S* 𓉳

  📌 *Selecciona una opción en el menú desplegable.*

  ✨ _𝗚𝗥𝗔𝗖𝗜𝗔𝗦 𝗣𝗢𝗥 𝗨𝗦𝗔𝗥 𝗧𝗵𝗲𝗘𝗹𝘆-𝗠𝗗
         ᵇᵒᵗ ᵉⁿ ᵈᵉˢᵃʳʳᵒˡˡᵃᵈᵒ★_
    `.trim()

    const rows = [
      { 
        title: '🎮 𝗝𝘂𝗲𝗴𝗼𝘀', 
        description: '🎲 Juega y gana premios en el bot',
        id: '.menu5' 
      },
      { 
        title: '🧠 𝗜𝗻𝘁𝗲𝗹𝗶𝗴𝗲𝗻𝗰𝗶𝗮 𝗔𝗿𝘁𝗶𝗳𝗶𝗰𝗶𝗮𝗹', 
        description: '🤖 Chatea con IA avanzada y resuelve dudas',
        id: '.menua' 
      },
      { 
        title: '🎨 𝗗𝗶𝘃𝗲𝗿𝘀𝗶𝗼𝗻', 
        description: '😂 Memes, chistes, frases y más para pasar el rato',
        id: '.menufun' 
      },
      { 
        title: '🂽 𝙀𝙨𝙩𝙪𝙙𝙞𝙤 / 𝙀𝙨𝙘𝙪𝙚𝙡𝙖', 
        description: '📚 Herramientas educativas y de aprendizaje',
        id: '.menu3' 
      },
      { 
        title: '𖡹 𝙂𝙖𝙘𝙝𝙖', 
        description: '🎲 Sistema de personajes y colecciones',
        id: '.menu4' 
      },
      { 
        title: '💰 𝙀𝙘𝙤𝙣𝙤𝙢𝙞́𝙖', 
        description: '💵 Gestiona tus monedas, banco y tienda',
        id: '.menu2' 
      },
      { 
        title: '✎ 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨', 
        description: '📥 Descarga música, videos, stickers y más',
        id: '.menu1' 
      },
      { 
        title: '♨️ 𝙂𝙧𝙪𝙥𝙤𝙨 / 𝘼𝙙𝙢𝙞𝙣', 
        description: '⚙️ Herramientas para administrar grupos',
        id: '.menu6' 
      },
      { 
        title: '☕ 𝙊𝙬𝙣𝙚𝙧 / 𝘾𝙧𝙚𝙖𝙙𝙤𝙧', 
        description: '👑 Comandos exclusivos para el creador del bot',
        id: '.menucreador' 
      },
      { 
        title: '𖥸 𝙎𝙩𝙞𝙘𝙠𝙚𝙧𝙨', 
        description: '🖼️ Crea y obtén stickers personalizados',
        id: '.menusticker' 
      },
      { 
        title: '☯️ 𝘽𝙪𝙨𝙘𝙖𝙙𝙤𝙧𝙚𝙨', 
        description: '🔍 Busca contenido en internet desde el bot',
        id: '.menu8' 
      },
      { 
        title: '📊 𝙄𝙣𝙛𝙤𝙧𝙢𝙖𝙘𝙞𝙤́𝙣', 
        description: 'ℹ️ Estado del bot, usuarios y estadísticas',
        id: '.menu7' 
      },
      { 
        title: '☘️ 𝙎𝙪𝙗-𝘽𝙤𝙩𝙨', 
        description: '🤖 Crea y gestiona tus propios Sub-Bots',
        id: '.menu9' 
      },
      { 
        title: '☢️ 𝙃𝙚𝙧𝙧𝙖𝙢𝙞𝙚𝙣𝙩𝙖𝙨', 
        description: '🛠️ Utilidades varias para el día a día',
        id: '.menu10' 
      },
      { 
        title: '꒷ 𝙈𝙪𝙡𝙩𝙞𝙟𝙪𝙜𝙖𝙙𝙤𝙧', 
        description: '👥 Juegos multijugador para compartir con amigos',
        id: '.multiplayer' 
      },
      { 
        title: '🌼 𝙈𝙚𝙣𝙪 𝙋𝙧𝙞𝙣𝙘𝙞𝙥𝙖𝙡', 
        description: '📌 Volver al menú principal',
        id: '.menu' 
      }
    ]

    let imageMessage = null
    if (bannerBuffer) {
      try {
        const media = await prepareWAMessageMedia(
          { image: bannerBuffer },
          { upload: conn.waUploadToServer }
        )
        imageMessage = media.imageMessage
      } catch (e) {
        console.error('❌ Error preparando imagen:', e)
      }
    }

    const buttonsMessage = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: {
              title: '🌼 THEELY-MD',
              subtitle: 'Menú Principal',
              hasMediaAttachment: !!imageMessage,
              ...(imageMessage && { imageMessage })
            },
            body: { text: texto },
            footer: { text: '𝚃𝙷𝙴𝙴𝙻𝚈-𝙼𝙳  ·  𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝙾𝚏𝚒𝚌𝚒𝚊𝚕𝚎𝚜' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: '📂 SELECCIONA UNA CATEGORÍA',
                    sections: [{
                      title: '🔽 Elige una opción',
                      rows
                    }]
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '📢 Canal Oficial TheEly-MD',
                    url: 'https://whatsapp.com/channel/0029Vb8G49lKmCPR44sIOE1i'
                  })
                }
              ]
            }
          })
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, buttonsMessage, { quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🌼')

  } catch (e) {
    console.error('💥 Error en menú principal:', e)
    await conn.reply(m.chat, `❌ Ocurrió un error al cargar el menú principal.`, m)
  }
}

handler.before = async (m, { conn }) => {
  const flow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!flow) return

  try {
    const data = JSON.parse(flow.paramsJson || '{}')
    const id = data.id
    if (!id) return

    if (id.startsWith('.')) {
      const cmdName = id.slice(1)
      const plugin = global.plugins ? Object.values(global.plugins).find(p => {
        if (p.command) {
          const cmds = Array.isArray(p.command) ? p.command : [p.command]
          return cmds.includes(cmdName)
        }
        return false
      }) : null

      if (plugin && typeof plugin.handler === 'function') {
        const fakeM = {
          ...m,
          text: id,
          body: id,
          quoted: m.quoted || null
        }
        await plugin.handler(fakeM, { conn, text: cmdName, usedPrefix: '.', command: cmdName })
        return true
      } else {
        const fakeMessage = {
          key: {
            remoteJid: m.chat,
            fromMe: false,
            id: 'fake-' + Date.now()
          },
          message: {
            conversation: id
          },
          pushName: 'Usuario',
          sender: m.sender
        }
        conn.ev.emit('messages.upsert', {
          messages: [fakeMessage],
          type: 'notify'
        })
        return true
      }
    }
  } catch (e) {
    console.error('❌ Error procesando botón del menú:', e)
  }
}

handler.command = ['menu', 'help', 'menú', 'ayuda', 'comandos', 'inicio']
handler.tags = ['main']
handler.help = ['menu']
handler.desc = 'Muestra el menú principal del bot con botones interactivos'
handler.register = false
handler.limit = false

export default handler

function getGreeting(hour) {
  const greetings = {
    0: [
      'Una madrugada tranquila para ti~',
      'La noche aún joven, descansa bien~',
      'Silencio y paz en la madrugada~',
      'Las estrellas te cuidan esta noche~',
      'La oscuridad es solo el preludio del amanecer~'
    ],
    1: [
      'La noche está en su punto más sereno~',
      'Hora de sueños profundos~',
      'El mundo descansa, tú también~',
      'La luna te acompaña en esta hora~',
      'Todo está en calma, disfruta~'
    ],
    2: [
      'Hora perfecta para descansar la mente~',
      'La noche te envuelve en su manto~',
      'Es el momento de soltar preocupaciones~',
      'El silencio es tu mejor aliado~',
      'Duerme, que mañana será otro día~'
    ],
    3: [
      'Aún de madrugada, pero aquí estoy contigo~',
      'La noche profunda, pero no estás solo~',
      'Hora de introspección y calma~',
      'El mundo duerme, tú sueñas~',
      'La oscuridad da paso a la esperanza~'
    ],
    4: [
      'El amanecer ya casi llega~',
      'La noche se despide lentamente~',
      'Las primeras luces del alba~',
      'Hora de renovarse y comenzar~',
      'La esperanza brilla en el horizonte~'
    ],
    5: [
      'Buenos días tempraneros~',
      'El sol despierta y tú también~',
      'Hora de empezar con energía~',
      'El nuevo día te espera, aprovecha~',
      'Madrugar tiene su recompensa~'
    ],
    6: [
      'El cielo empieza a iluminarse~',
      'Buenos días, el sol te saluda~',
      'Hora de activarse y brillar~',
      'El amanecer te llena de vida~',
      'Un nuevo día, nuevas oportunidades~'
    ],
    7: [
      '¡Buenos días! Que tengas un excelente día~',
      'El despertar es el primer paso al éxito~',
      'Hora de desayunar y sonreír~',
      'El día comienza, hazlo grande~',
      'La mañana te regala su frescura~'
    ],
    8: [
      'Hora del desayuno, no lo olvides~',
      'La mañana avanza con fuerza~',
      'Energía para cumplir tus metas~',
      'El café y la buena vibra~',
      'Aprovecha cada minuto de esta hora~'
    ],
    9: [
      'Una mañana productiva te espera~',
      'El día está en su mejor momento~',
      'Hora de trabajar en tus sueños~',
      'La creatividad fluye a esta hora~',
      'Cada acción cuenta, hazla valer~'
    ],
    10: [
      'Media mañana llena de energía~',
      'Sigue adelante, vas bien~',
      'El sol brilla para ti~',
      'Hora de dar lo mejor de ti~',
      'El esfuerzo de hoy es el éxito de mañana~'
    ],
    11: [
      'Ya casi es mediodía, sigue así~',
      'La mañana se despide con fuerza~',
      'Prepara el almuerzo y la sonrisa~',
      'Hora de cerrar metas matutinas~',
      'El mediodía se acerca, no te detengas~'
    ],
    12: [
      '¡Feliz mediodía! Hora de almorzar~',
      'El sol en su punto más alto~',
      'Recarga energías para la tarde~',
      'El día está en su ecuador~',
      'Disfruta de la luz del mediodía~'
    ],
    13: [
      'Buenas tardes, espero la estés pasando bien~',
      'La tarde comienza con calma~',
      'Hora de seguir con buen ritmo~',
      'El sol te acompaña en esta hora~',
      'Cada minuto cuenta, sigue adelante~'
    ],
    14: [
      'Una tarde tranquila y agradable~',
      'El calor te invita a relajarte~',
      'Hora de ser productivo sin prisa~',
      'La brisa de la tarde te acaricia~',
      'Aprovecha la luz que aún queda~'
    ],
    15: [
      'Momento perfecto para un café~',
      'La tarde avanza, pero tú brillas~',
      'Hora de reflexionar y planear~',
      'El sol se inclina, pero tú no~',
      'Disfruta de la calma de la tarde~'
    ],
    16: [
      'La tarde avanza, no te canses~',
      'El día se despide lentamente~',
      'Sigue con la misma energía~',
      'La hora dorada de la tarde~',
      'Cada paso te acerca a tus metas~'
    ],
    17: [
      'El atardecer se acerca, disfrútalo~',
      'La luz se vuelve cálida y suave~',
      'Hora de cerrar el día con alegría~',
      'El cielo se pinta de colores~',
      'Disfruta de la magia del atardecer~'
    ],
    18: [
      'Hora de relajarse un poco~',
      'El día se va, la noche llega~',
      'Descansa, que has trabajado bien~',
      'El atardecer te regala paz~',
      'Prepara tu corazón para la noche~'
    ],
    19: [
      'La noche se acerca poco a poco~',
      'El cielo se oscurece, tú brillas~',
      'Hora de compartir con los tuyos~',
      'La luna comienza a aparecer~',
      'Disfruta de la tranquilidad nocturna~'
    ],
    20: [
      'Buenas noches, cuídate mucho~',
      'La noche te envuelve con suavidad~',
      'Hora de descansar y recargar~',
      'El día fue bueno, el descanso será mejor~',
      'Las estrellas te vigilan esta noche~'
    ],
    21: [
      'La noche ha comenzado, descansa pronto~',
      'El silencio te invita a soñar~',
      'Hora de desconectar y relajarte~',
      'La oscuridad trae consigo la paz~',
      'Mañana será otro día, descansa~'
    ],
    22: [
      'Hora de ir bajando el ritmo~',
      'La noche se vuelve profunda~',
      'Duerme bien, sueña bonito~',
      'El descanso es la clave del éxito~',
      'La luna te guía en la noche~'
    ],
    23: [
      'Último tramo del día, ¡buenas noches!',
      'La noche está en su máximo esplendor~',
      'Descansa, que mañana será mejor~',
      'Hora de cerrar los ojos y soñar~',
      'El día termina, pero la esperanza no~'
    ]
  }

  const hourGreetings = greetings[hour] || greetings[0]
  return hourGreetings[Math.floor(Math.random() * hourGreetings.length)]
}