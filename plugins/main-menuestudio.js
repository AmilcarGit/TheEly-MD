import fs from 'fs'
import { join } from 'path'

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender] || {}
    const name = await conn.getName(m.sender)

    const ahora = new Date()
    const horaPeru = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Lima' }))

    const help = Object.values(global.plugins || {})
      .filter(p => !p.disabled && p.tags && p.tags.includes('estudio'))
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
        desc: p.desc || p.description || 'Sin descripción',
        register: p.register || false
      }))

    let bannerFinal = null

    const imagePath = join(process.cwd(), 'lib', 'TheElyMD.jpg')
    if (fs.existsSync(imagePath)) {
      bannerFinal = fs.readFileSync(imagePath)
    } else {
      const rootPath = join(process.cwd(), 'TheElyMD.jpg')
      if (fs.existsSync(rootPath)) bannerFinal = fs.readFileSync(rootPath)
    }

    const moneda = global.moneda || '🌼 ElyCoins'
    const userCoins = user.coin || 0
    const userBank = user.bank || 0
    const userExp = user.exp || 0

    const comandosEstudio = help.map(menu => {
      return menu.help.map(h => {
        const cmd = menu.prefix ? h : `${_p}${h}`
        const limit = menu.limit ? '🔒' : '🔓'
        const premium = menu.premium ? '💎' : '🆓'
        const registro = menu.register ? '✅' : '❌'
        return `  ${cmd}\n  ➥ ${menu.desc} ${limit} ${premium} ${registro}`
      }).join('\n')
    }).filter(Boolean).join('\n\n')

    const before = `
 ❛ ━━━━━━･❪ 🂽 ❫ ･━━━━━━ ❜
   🂡𝐓 𝐇 𝐄 𝐄 𝐋 𝐘 𓆆 𝐌 𝐃
   ─── 𝙀𝙨𝙘𝙪𝙚𝙡𝙖 ───
 ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊ ♡ °̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙˚̩̥̩̥*̩̩̥͙·̩̩̥͙*̩̩̥͙˚̩̥̩̥*̩̩͙‧͙ °̩̥˚̩̩̥͙°̩̥ ♡ ‧̍̊·̊‧̥°̩̥˚̩̩̥͙°̩̥‧̥·̊‧̍̊

  🌼 *¡Hola,* *${name}!*
   ${getGreeting(horaPeru.getHours())}

  🂽 *HERRAMIENTAS DE ESTUDIO:*
  📚 Aprende, practica y mejora tus habilidades.
  🧮 Matemáticas, conversiones y más.
  💰 ${moneda}: ${userCoins}
  🏦 Banco: ${userBank}
  ✨ Experiencia: ${userExp}

  ❀•°•═════ஓ๑♡๑ஓ═════•°•❀
  𓏲🇨 🇴 🇲 🇦 🇳 🇩 🇮 🇹 🇴 🇸𓉳
    🇪 🇸 🇹 🇺 🇩 🇮 🇴 
    ✐☡✐☡✐☡✐☡✐☡✐☡✐☡✐☡
`

    const after = `
  ˏ⸉ˋ‿̩͙‿̩̩̽‿̩͙‿̩̥̩‿̩̩̽‿̩͙‿̩͙‿̩̩̽‿̩͙‿̩͙‿̩̩̽‿̩͙‿̩̥̩‿̩̩̽‿̩͙‘⸊ˎ

  𖥸 𝗧 𝗛 𝗘 𝗘 𝗟 𝗬 𖧷 𝗠 𝗗⇱

  _╭ᵇᵒᵗ ᴺᵘᵉᵛᵒ ᵉⁿ ᵗᵘ ʷʰᵃᵗˢᵃᵖᵖ╮_
       ᵈᵉˢᵃʳʳᵒˡˡᵃᵈᵒ ᵖᵒʳ
    ٭ᴀ ᴍ ɪ ʟ ᴄ ᴀ ʀ ɢ ɪ ᴛ
 𝑐𝑜𝑛𝑡𝑎𝑐𝑡𝑜: 51910227479 ⃝⃟
 ┈┈┈┈․° ☣ °․┈┈┈┈

  ✨ _𝗚𝗥𝗔𝗖𝗜𝗔𝗦 𝗣𝗢𝗥 𝗨𝗦𝗔𝗥 𝗧𝗵𝗲𝗘𝗹𝘆-𝗠𝗗 ⃝_
  💡 Usa .menu para ver todos los comandos
`

    const texto = `${before}\n${comandosEstudio}\n${after}`

    if (bannerFinal) {
      await conn.sendMessage(m.chat, {
        image: bannerFinal,
        caption: texto.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: texto.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m })
    }

    await m.react('🂽')

  } catch (e) {
    console.error('💥 Error en menú estudio:', e)
    await conn.reply(m.chat, `❌ Ocurrió un error al cargar el menú de estudio.`, m)
  }
}

handler.command = ['menuestudio', 'estudio', 'escuela']
handler.tags = ['main']
handler.help = ['menuestudio']
handler.desc = 'Muestra el menú de herramientas de estudio del bot'
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