import fs from 'fs'
import { join } from 'path'

const tags = {
  premium:      '𓅖 Premium𓅓',
  jadibot:      '☘︎ Sub-Bots⚘',
  search:       '☯︎ Buscador⚡︎',
  descargas:    '✎ Descargas☔︎︎',
  info:         '✉ Información♾︎', 
  grupo:        '♨︎ Grupos☠︎',
  eco:          '☎︎ RPG/Economía☣︎',
  tools:        '☢︎ Herramientas♯',
  game:         '𝄞 Juegos',
  multijugador: '꒷ Multijugador☪︎',
  gacha:        '𖡹 Gacha𖣇',
  reacciones:   '𖣐 Reacciones𖦃',
  estudio:      '🂽 Escuela🃁', 
  sticker:      '𖥸 Stickers𖧶',
  ia:           '♞ 𝐈𝐀♔',
  fun:          '𓅋 Diversión𓅍',
  creador:        '☕︎︎ Owner',
}

const defaultMenu = {
  before: `
 ❛ ━━━━━━･❪ ❁ ❫ ･━━━━━━ ❜
   🂡𝐓 𝐇 𝐄 𝐄 𝐋 𝐘 𓆆 𝐌 𝐃
 ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊ ♡ °̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙˚̩̥̩̥*̩̩̥͙·̩̩̥͙*̩̩̥͙˚̩̥̩̥*̩̩͙‧͙ °̩̥˚̩̩̥͙°̩̥ ♡ ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊


  🌼 *¡Hola,* *%name*! 
   *%greeting*

 ‧͙⁺˚*･༓☾ 𝑻𝒉𝒆𝑬𝒍𝒚-𝑴𝑫 𝘀𝗶𝘀𝘁𝗲𝗺𝗮 ☽༓･*˚⁺‧͙ 
  ║☞ 🤖  𝑩𝒐𝒕☻        %botname
  ║☞ 🏷️  𝑴𝒐𝒅𝒐☻      %tipo
  ║☞ 📅  𝑭𝒆𝒄𝒉𝒂☻     %date
  ║☞ 🕐  𝑯𝒐𝒓𝒂☻      %time
  ║☞ ⏱️  𝑨𝒄𝒕𝒊𝒗𝒊𝒅𝒂𝒅☻ %uptime
  ║☞ 👥  𝑮𝒓𝒖𝒑𝒐𝒔☻    %grupos
  ║☞ 👤  𝑼𝒔𝒖𝒂𝒓𝒊𝒐𝒔☻  %usuarios
  ❀•°•═════ஓ๑♡๑ஓ═════•°•❀
𓏲🇨 🇴 🇲 🇦 🇳 🇩 🇮 🇹 🇴 🇸 𓉳
    ✐☡✐☡✐☡✐☡✐☡✐☡✐☡✐☡
%readmore`.trimStart(),

  header: '\n  _*𓅇༼ %category ༽𓅇*_\n',
  body:   '  ═❧☛  *%cmd* %islimit %isPremium\n  ➥ ☄︎➫    %desc𓆪',
  footer: '',

  after: ` 
  ˏ⸉ˋ‿̩͙‿̩̩̽‿̩͙‿̩̥̩‿̩̩̽‿̩͙‿̩͙‿̩̩̽‿̩͙‿̩͙‿̩̩̽‿̩͙‿̩̥̩‿̩̩̽‿̩͙‘⸊ˎ

  𖥸 𝗧 𝗛 𝗘 𝗘 𝗟 𝗬 𖧷 𝗠 𝗗⇱

  _╭ᵇᵒᵗ ᴺᵘᵉᵛᵒ ᵉⁿ ᵗᵘ ʷʰᵃᵗˢᵃᵖᵖ╮_
       ᵈᵉˢᵃʳʳᵒˡˡᵃᵈᵒ ᵖᵒʳ
    ٭ᴀ ᴍ ɪ ʟ ᴄ ᴀ ʀ ɢ ɪ ᴛ
𝑐𝑜𝑛𝑡𝑎𝑐𝑡𝑜: 51910227479 ⃝⃟
 ┈┈┈┈․° ☣ °․┈┈┈┈

  ✨ _𝗚𝗥𝗔𝗖𝗜𝗔𝗦 𝗣𝗢𝗥 𝗨𝗦𝗔𝗥 𝗧𝗵𝗲𝗘𝗹𝘆-𝗠𝗗 ⃝_`.trim(),
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)

    const totalGrupos   = Object.keys(global.db.data.chats || {}).filter(id => id.endsWith('@g.us')).length
    const totalUsuarios = Object.keys(global.db.data.users || {}).length

    const ahora    = new Date()
    const horaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))

    const date = horaPeru.toLocaleDateString('es', {
      day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
    })

    const time = horaPeru.toLocaleTimeString('es', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    })

    const help = Object.values(global.plugins || {})
      .filter(p => !p.disabled)
      .map(p => ({
        help:    Array.isArray(p.help) ? p.help : [p.help],
        tags:    Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix:  'customPrefix' in p,
        limit:   p.limit,
        premium: p.premium,
        desc:    p.desc || p.description || 'Sin descripción'
      }))

    let nombreBot   = 'TheEly MD'
    let bannerFinal = null

    const imagePath = join(process.cwd(), 'lib', 'TheElyMD.jpg')
    if (fs.existsSync(imagePath)) {
      bannerFinal = fs.readFileSync(imagePath)
    } else {
      const rootPath = join(process.cwd(), 'TheElyMD.jpg')
      if (fs.existsSync(rootPath)) bannerFinal = fs.readFileSync(rootPath)
    }

    const botActual  = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
      } catch (e) {
        console.error('👑 Error leyendo config:', e)
      }
    }

    const tipo = conn.user.jid === global.conn.user.jid
      ? '𝗕𝗼𝘁 𝗣𝗿𝗶𝗻𝗰𝗶𝗽𝗮𝗹'
      : '𝗦𝘂𝗯-𝗕𝗼𝘁'

    const menuConfig = conn.menu || defaultMenu

    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        const cmds = help
          .filter(menu => menu.tags?.includes(tag))
          .map(menu => menu.help.map(h =>
            menuConfig.body
              .replace(/%cmd/g, menu.prefix ? h : `${_p}${h}`)
              .replace(/%islimit/g, menu.limit ? '🔒' : '')
              .replace(/%isPremium/g, menu.premium ? '💎' : '')
              .replace(/%desc/g, menu.desc)
          ).join('\n')).join('\n')

        return cmds
          ? [menuConfig.header.replace(/%category/g, tags[tag]), cmds, menuConfig.footer].join('\n')
          : ''
      }).filter(Boolean),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      name,
      date,
      time,
      uptime: clockString(process.uptime() * 1000),
      tipo,
      grupos: totalGrupos,
      usuarios: totalUsuarios,
      readmore: readMore,
      greeting: getGreeting(horaPeru.getHours()),
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    const buttons = [
      { buttonId: '.code', buttonText: { displayText: '🌼 𝗖𝗿𝗲𝗮𝗿 𝗦𝘂𝗯-𝗕𝗼𝘁𖨆' }, type: 1 }
    ]

    const messageContent = {
      caption:     text.trim(),
      footer:      '𝚃𝙷𝙴𝙴𝙻𝚈-𝙼𝙳  ·  𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝙾𝚏𝚒𝚌𝚒𝚊𝚕𝚎𝚜',
      buttons,
      headerType:  4,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    }

    if (bannerFinal) {
      messageContent.image = bannerFinal
    } else {
      messageContent.text = text.trim()
      delete messageContent.caption
      delete messageContent.headerType
    }

    await conn.sendMessage(m.chat, messageContent, { quoted: m })
    await m.react('🌼')

  } catch (e) {
    console.error('💥 Error en el menú:', e)
    await conn.reply(
      m.chat,
      [
        ` ╔═════════════════════`,
        `   🌼  T H E E L Y - M D`,
        ` ╚═════════════════════`,
        ``,
        `  Ocurrió un problema al cargar`,
        `  el menú. Por favor intenta`,
        `  de nuevo en un momento.`,
        ``,
        `  💡 Mientras tanto usa:`,
        `  *${_p}help simple*`,
      ].join('\n'),
      m
    )
  }
}

handler.command  = ['menu', 'help', 'menú', 'ayuda', 'comandos']
handler.alias    = ['menuu', 'ayudame', 'comanditos']
handler.tags     = ['main']
handler.help     = ['menu']
handler.desc     = 'Muestra el menú principal del bot'
handler.register = false
handler.limit    = false

export default handler

const more     = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  if (isNaN(ms)) return '--:--:--'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function getGreeting(hour) {
  const greetings = {
    0:  'Una madrugada tranquila para ti~',
    1:  'La noche está en su punto más sereno~',
    2:  'Hora perfecta para descansar la mente~',
    3:  'Aún de madrugada, pero aquí estoy contigo~',
    4:  'El amanecer ya casi llega~',
    5:  'Buenos días tempraneros~',
    6:  'El cielo empieza a iluminarse~',
    7:  '¡Buenos días! Que tengas un excelente día~',
    8:  'Hora del desayuno, no lo olvides~',
    9:  'Una mañana productiva te espera~',
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
