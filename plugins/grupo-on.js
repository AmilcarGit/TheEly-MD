import fs from 'fs'
import path from 'path'

const settingsPath = path.resolve('./json/settings.json')
const defaultImage = 'https://i.postimg.cc/qqFLyv2W/1000536576.jpg'

function readSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
      fs.writeFileSync(settingsPath, JSON.stringify({}, null, 2))
    }
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  } catch {
    return {}
  }
}

function saveSettings(data) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('❌ Error guardando settings:', e.message)
  }
}

function getChatConfig(botNumber, chatId) {
  const settings = readSettings()
  if (!settings[botNumber]) settings[botNumber] = {}
  if (!settings[botNumber][chatId]) {
    settings[botNumber][chatId] = {
      antilink: false,
      welcome: false,
      antiarabe: false,
      modoadmin: false,
      antiflood: false
    }
    saveSettings(settings)
  }
  return settings
}

function getBotNumber(conn) {
  return conn.user?.jid?.split(':')[0] + '@s.whatsapp.net' || 'bot'
}

function isAdminP(participants, jid) {
  const p = participants.find(p =>
    p.id === jid ||
    p.id?.split(':')[0] + '@s.whatsapp.net' === jid
  )
  return p?.admin === 'admin' || p?.admin === 'superadmin'
}

const linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
const channelRegex = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const prefijosArabes = ['212', '20', '971', '965', '966', '974', '973', '962']

const validTypes = {
  antilink:   '🔗 Anti-Link',
  welcome:    '👋 Bienvenida',
  antiarabe:  '🌍 Anti-Árabe',
  modoadmin:  '👑 Modo Admin',
  antiflood:  '🌊 Anti-Flood'
}

const handler = async (m, { conn, command, args }) => {
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!validTypes[type]) {
    const lista = Object.entries(validTypes)
      .map(([k, v]) => `║ ${v}: *${k}*`)
      .join('\n')

    return m.reply(
      `╔══〔 🌼 *THEELY-MD — SISTEMA* 〕══╗\n║\n${lista}\n║\n║ 💡 Uso: *.on <función>*\n║       *.off <función>*\n║\n╚══════════════════════════════════╝`
    )
  }

  const botNumber = getBotNumber(conn)
  const settings = getChatConfig(botNumber, m.chat)

  settings[botNumber][m.chat][type] = enable
  saveSettings(settings)

  return m.reply(
    `╔══〔 🌼 *THEELY-MD* 〕══╗\n║\n║ ${enable ? '🟢 *ACTIVADO*' : '🔴 *DESACTIVADO*'}\n║\n║ ⚙️ Función: *${validTypes[type]}*\n║ 📍 Chat configurado~\n║\n╚══════════════════════╝`
  )
}

handler.command = ['on', 'off']
handler.group = true
handler.admin = true
handler.tags = ['grupo']
handler.help = ['on <función>', 'off <función>']
handler.desc = 'Activa/desactiva funciones del grupo'

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return

  const botNumber = getBotNumber(conn)
  const settings = getChatConfig(botNumber, m.chat)
  const chat = settings[botNumber][m.chat]

  let groupMetadata = null
  const getMetadata = async () => {
    if (!groupMetadata) {
      groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    }
    return groupMetadata
  }

  if (chat.modoadmin && !m.fromMe) {
    const meta = await getMetadata()
    if (!meta) return
    const adminCheck = isAdminP(meta.participants, m.sender)
    if (!adminCheck) return true
  }

  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    const number = newJid.split('@')[0]
    const esArabe = prefijosArabes.some(p => number.startsWith(p))

    if (esArabe) {
      const meta = await getMetadata()
      if (!meta) return

      const esAdmin = isAdminP(meta.participants, newJid)
      if (esAdmin) return

      await conn.sendMessage(m.chat, {
        text: `╔══〔 🚫 *ANTI-ÁRABE* 〕══╗\n║\n║ ⚠️ Usuario sospechoso detectado\n║ 👤 @${number}\n║ ❌ Acción: Expulsado\n║\n║ 🌼 *TheEly-MD*\n╚══════════════════════╝`,
        mentions: [newJid]
      })

      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove').catch(() => {})
      return true
    }
  }

  if (chat.antilink) {
    const text = m.text || ''
    if (!linkRegex.test(text) && !channelRegex.test(text)) return

    const meta = await getMetadata()
    if (!meta) return

    const esAdmin = isAdminP(meta.participants, m.sender)
    if (esAdmin) return

    try {
      const ownCode = await conn.groupInviteCode(m.chat)
      if (text.includes(`chat.whatsapp.com/${ownCode}`)) return
    } catch {}

    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    await conn.sendMessage(m.chat, {
      text: `╔══〔 🚫 *ANTI-LINK* 〕══╗\n║\n║ ⚠️ @${m.sender.split('@')[0]}\n║ No se permiten enlaces~\n║\n║ ❌ Mensaje eliminado\n║\n║ 🌼 *TheEly-MD*\n╚══════════════════════╝`,
      mentions: [m.sender]
    }, { quoted: m })

    return true
  }

  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const meta = await getMetadata()
    if (!meta) return

    const userId = m.messageStubParameters?.[0] || m.sender
    const tag = `@${userId.split('@')[0]}`
    const groupSize = meta.participants.length

    let pp = defaultImage
    try {
      pp = await conn.profilePictureUrl(userId, 'image')
    } catch {}

    if (m.messageStubType === 27) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: `╔══〔 🌼 *BIENVENIDO/A* 〕══╗\n║\n║ 👋 Hola ${tag}~\n║ ✨ Bienvenid@ a *${meta.subject}*\n║\n║ 🌼 Eres el miembro #${groupSize}\n║ 💬 ¡Disfruta tu estancia!\n║\n║ 💫 *TheEly-MD*\n╚══════════════════════╝`,
        mentions: [userId]
      })
    }

    if ([28, 32].includes(m.messageStubType)) {
      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption: `╔══〔 💔 *DESPEDIDA* 〕══╗\n║\n║ 👋 ${tag} ha salido~\n║\n║ 💔 ¡Esperamos verte pronto!\n║ 👥 Miembros: ${groupSize}\n║\n║ 💫 *TheEly-MD*\n╚══════════════════════╝`,
        mentions: [userId]
      })
    }
  }
}

export default handler
