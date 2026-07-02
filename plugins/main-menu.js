
import fs from 'fs'
import { join } from 'path'
import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { xpRange } from '../lib/levelling.js'

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user    = global.db.data.users[m.sender] || {}
    const name    = await conn.getName(m.sender)
    const moneda  = global.moneda || 'ElyCoins'

    const totalGrupos   = Object.keys(global.db.data.chats || {}).filter(id => id.endsWith('@g.us')).length
    const totalUsuarios = Object.keys(global.db.data.users || {}).length
    const totalPlugins  = Object.keys(global.plugins || {}).length
    const totalSubBots  = (global.conns || []).filter(c => c?.user).length

    const ahora    = new Date()
    const horaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))

    const date = horaPeru.toLocaleDateString('es', {
      day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
    })

    const time = horaPeru.toLocaleTimeString('es', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })

    // ── Datos del usuario ──
    const nivel    = user.level || 0
    const exp      = user.exp || 0
    const coins    = user.coin || 0
    const bank     = user.bank || 0
    const premium  = user.premium
    const { min, xp } = xpRange(nivel, global.multiplier || 1)
    const expActual = exp - min
    const bloques   = 10
    const lleno     = Math.min(Math.round((expActual / xp) * bloques), bloques)
    const barraExp  = '█'.repeat(lleno) + '░'.repeat(bloques - lleno)

    // ── Nombre e imagen del bot ──
    let nombreBot   = 'TheEly-MD'
    let bannerBuffer = null

    const imagePath = join(process.cwd(), 'lib', 'TheElyMD.jpg')
    if (fs.existsSync(imagePath)) {
      bannerBuffer = fs.readFileSync(imagePath)
    } else {
      const rootPath = join(process.cwd(), 'TheElyMD.jpg')
      if (fs.existsSync(rootPath)) bannerBuffer = fs.readFileSync(rootPath)
    }

    const botActual  = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
      } catch {}
    }

    const tipo = conn.user.jid === global.conn.user.jid ? '🌟 Bot Principal' : '⚡ Sub-Bot'

    // ── Texto del menú ──
    const texto = [
      `❛ ━━━━━━･❪ 🌼 ❫ ･━━━━━━ ❜`,
      `  𝐓 𝐇 𝐄 𝐄 𝐋 𝐘 ✦ 𝐌 𝐃`,
      `❜ ━━━━━━･❪ 🌼 ❫ ･━━━━━━ ❛`,
      ``,
      `🌼 *¡Hola, ${name}!*`,
      `   _${getGreeting(horaPeru.getHours())}_`,
      ``,
      `╔══〔 👤 *TU PERFIL* 〕══╗`,
      `║ ⭐ *Nivel:*   ${nivel}`,
      `║ ${barraExp} ${Math.round((expActual / xp) * 100)}%`,
      `║ 💰 *Coins:*  ${coins} ${moneda}`,
      `║ 🏦 *Banco:*  ${bank} ${moneda}`,
      `║ 👑 *VIP:*    ${premium ? '✅ Activo' : '❌ Sin VIP'}`,
      `╚══════════════════════╝`,
      ``,
      `╔══〔 🤖 *SISTEMA* 〕══════╗`,
      `║ 🏷️  *Bot:*       ${nombreBot}`,
      `║ 🔰  *Modo:*      ${tipo}`,
      `║ 📅  *Fecha:*     ${date}`,
      `║ 🕐  *Hora:*      ${time}`,
      `║ 👥  *Grupos:*    ${totalGrupos}`,
      `║ 👤  *Usuarios:*  ${totalUsuarios}`,
      `║ 🔌  *Plugins:*   ${totalPlugins}`,
      `║ 🤖  *Sub-Bots:*  ${totalSubBots}`,
      `╚══════════════════════╝`,
      ``,
      `📂 *Selecciona una categoría*`,
      `_Usa el menú desplegable~_ 👇`,
    ].join('\n')

    // ── Botones del menú ──
    const rows = [
      { title: '💰 RPG / Economía',        description: 'daily, minar, banco, tienda...', id: '.menu eco'       },
      { title: '🎮 Juegos',                description: 'trivia, ahorcado, blackjack...', id: '.menu game'      },
      { title: '🎲 Multijugador',           description: 'ttt, ruleta rusa, duelos...',    id: '.menu multijugador' },
      { title: '🎴 Gacha',                 description: 'gacha, colección, banner...',     id: '.menu gacha'     },
      { title: '🤖 Inteligencia Artificial',description: 'gemini, copilot, ia...',          id: '.menu ia'        },
      { title: '😄 Diversión',             description: 'chiste, ship, roleplay...',        id: '.menu fun'       },
      { title: '📥 Descargas',             description: 'play, tiktok, ytmp4...',           id: '.menu descargas' },
      { title: '🛠️ Herramientas',          description: 'qr, ocr, traducir, clima...',     id: '.menu tools'     },
      { title: '👥 Grupos / Admin',         description: 'kick, ban, tag, admins...',        id: '.menu group'     },
      { title: '📌 Stickers',              description: 'sticker, sticker2img...',          id: '.menu sticker'   },
      { title: '🌸 Sub-Bots',              description: 'qr, code, settheely...',           id: '.menu jadibot'   },
      { title: '👑 Owner',                 description: 'ban, restart, darcoins...',         id: '.menu owner'     },
      { title: 'ℹ️  Información',           description: 'perfil, status, ping...',          id: '.menu info'      },
    ]

    // ── Preparar imagen ──
    let imageMessage = null
    if (bannerBuffer) {
      try {
        const media = await prepareWAMessageMedia(
          { image: bannerBuffer },
          { upload: conn.waUploadToServer }
        )
        imageMessage = media.imageMessage
      } catch {}
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '🌼 THEELY-MD',
        subtitle: 'Menú Principal',
        hasMediaAttachment: !!imageMessage,
        ...(imageMessage && { imageMessage })
      },
      body: { text: texto },
      footer: { text: '𝚃𝙷𝙴𝙴𝙻𝚈-𝙼𝙳 · 𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝙾𝚏𝚒𝚌𝚒𝚊𝚕𝚎𝚜 🌼' },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📂 CATEGORÍAS',
            sections: [{
              title: '🌼 TheEly-MD — Menú',
              rows
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: { messageContextInfo: {}, interactiveMessage }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await m.react('🌼')

  } catch (e) {
    console.error('💥 Error en menú:', e)
    await conn.reply(m.chat, `❌ Ocurrió un error al cargar el menú~`, m)
  }
}

handler.before = async (m, { conn }) => {
  const flow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!flow) return

  try {
    const data = JSON.parse(flow.paramsJson || '{}')
    const id   = data.id
    if (!id?.startsWith('.')) return

    const fakeMessage = {
      key: { remoteJid: m.chat, fromMe: false, id: 'menu-' + Date.now() },
      message: { conversation: id },
      pushName: m.pushName || 'Usuario',
      sender: m.sender
    }

    conn.ev.emit('messages.upsert', {
      messages: [fakeMessage],
      type: 'notify'
    })

    return true

  } catch (e) {
    console.error('❌ Error en botón del menú:', e)
  }
}

handler.command  = ['menu', 'help', 'menú', 'ayuda', 'comandos', 'inicio']
handler.tags     = ['main']
handler.help     = ['menu']
handler.desc     = 'Menú principal con botones interactivos'
handler.register = false
handler.limit    = false

export default handler

function getGreeting(hour) {
  const g = {
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
  return g[hour] || 'que tengas un día increíble~'
}