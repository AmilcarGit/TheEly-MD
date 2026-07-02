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

    // Buscar la imagen del banner
    const imagePath = join(process.cwd(), 'lib', 'TheElyMD.jpg')
    if (fs.existsSync(imagePath)) {
      bannerBuffer = fs.readFileSync(imagePath)
    } else {
      const rootPath = join(process.cwd(), 'TheElyMD.jpg')
      if (fs.existsSync(rootPath)) bannerBuffer = fs.readFileSync(rootPath)
    }

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
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

    // ========== TEXTO DEL MENÚ ==========
    const texto = `
 ❛ ━━━━━━･❪ 🌼 ❫ ･━━━━━━ ❜
   🂡𝐓 𝐇 𝐄 𝐄 𝐋 𝐘 𓆆 𝐌 𝐃
 ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊ ♡ °̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙˚̩̥̩̥*̩̩̥͙·̩̩̥͙*̩̩̥͙˚̩̥̩̥*̩̩͙‧͙ °̩̥˚̩̩̥͙°̩̥ ♡ ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊

  🌼 *¡Hola,* *${name}!* 
   ${getGreeting(horaPeru.getHours())}

  📊 *TU PROGRESO:*
  💰 ${moneda}: ${userCoins}
  🏦 Banco: ${userBank}
  ✨ Experiencia: ${userExp}

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
  💡 *Los comandos también funcionan escribiéndolos.*

  ✨ _𝗚𝗥𝗔𝗖𝗜𝗔𝗦 𝗣𝗢𝗥 𝗨𝗦𝗔𝗥 𝗧𝗵𝗲𝗘𝗹𝘆-𝗠𝗗 ⃝_
    `.trim()

    // ========== BOTONES INTERACTIVOS ==========
    const rows = [
      { title: '🎮 Juegos', id: '.menu5' },
      { title: '🧠 Inteligencia Artificial', id: '.menua' },
      { title: '🎨 Diversión', id: '.menufun' },
      { title: '🂽 Estudio / Escuela', id: '.menu3' },
      { title: '𖡹 Gacha', id: '.menu4' },
      { title: '💰 Economía', id: '.menu2' },
      { title: '✎ Descargas', id: '.menu1' },
      { title: '♨️ Grupos / Admin', id: '.menu6' },
      { title: '☕ Owner / Creador', id: '.menucreador' },
      { title: '𖥸 Stickers', id: '.menusticker' },
      { title: '☯️ Buscadores', id: '.menu8' },
      { title: '📊 Información', id: '.menu7' },
      { title: '☘️ Sub-Bots', id: '.menu9' },
      { title: '☢️ Herramientas', id: '.menu10' },
      { title: '꒷ Multijugador', id: '.multiplayer' },
      { title: '🌼 Menú Principal', id: '.menu' }
    ]

    // ========== PREPARAR IMAGEN PARA EL HEADER ==========
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
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📂 SELECCIONA UNA CATEGORÍA',
                  sections: [{
                    title: '🔽 Elige una opción',
                    rows
                  }]
                })
              }]
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

// ========== MANEJADOR DE RESPUESTAS DE BOTONES ==========
handler.before = async (m, { conn }) => {
  const flow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!flow) return

  try {
    const data = JSON.parse(flow.paramsJson || '{}')
    const id = data.id
    if (!id) return

    if (id.startsWith('.')) {
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
    0: 'Una madrugada tranquila para ti~',
    1: 'La noche está en su punto más sereno~',
    2: 'Hora perfecta para descansar la mente~',
    3: 'Aún de madrugada, pero aquí estoy contigo~',
    4: 'El amanecer ya casi llega~',
    5: 'Buenos días tempraneros~',
    6: 'El cielo empieza a iluminarse~',
    7: '¡Buenos días! Que tengas un excelente día~',
    8: 'Hora del desayuno, no lo olvides~',
    9: 'Una mañana productiva te espera~',
    10: 'Media mañana llena de energía~',
    11: 'Ya casi es mediodía, sigue así~',
    12: '¡Feliz mediodía! Hora de almorzar~',
    13: 'Buenas tardes, espero la estés pasando bien~',
    14: 'Una tarde tranquila y agradable~',
    15: 'Momento perfecto para un café~',
    16: 'La tarde avanza, no te canses~',
    17: 'El atardecer se acerca, disfrútalo~',
    18: 'Hora de relajarse un poco~',
    19: 'La noche se acerca poco a poco~',
    20: 'Buenas noches, cuídate mucho~',
    21: 'La noche ha comenzado, descansa pronto~',
    22: 'Hora de ir bajando el ritmo~',
    23: 'Último tramo del día, ¡buenas noches!'
  }
  return greetings[hour] || 'que tengas un día increíble~'
}