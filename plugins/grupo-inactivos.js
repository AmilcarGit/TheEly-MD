import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = (ms) => new Promise(res => setTimeout(res, ms))

var handler = async (m, { conn, text, participants, args, command, usedPrefix }) => {
  try {
    let member = participants.map(u => u.id)
    let sum    = text ? text : member.length
    let total  = 0
    let sider  = []

    for (let i = 0; i < sum; i++) {
      let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
      if (
        (typeof global.db.data.users[member[i]] == 'undefined' ||
        global.db.data.users[member[i]].chat == 0) &&
        !users?.isAdmin && !users?.isSuperAdmin
      ) {
        if (typeof global.db.data.users[member[i]] !== 'undefined') {
          if (global.db.data.users[member[i]].whitelist == false) {
            total++
            sider.push(member[i])
          }
        } else {
          total++
          sider.push(member[i])
        }
      }
    }

    switch (command) {
      case 'inactivos':
      case 'fantasmas': {
        if (total == 0) return conn.reply(m.chat, [
          `╔══〔 🌼 *THEELY-MD — INACTIVOS* 〕══╗`,
          `║`,
          `║ ✅ *¡Este grupo es activo!*`,
          `║ No se encontraron fantasmas~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n'), m)

        m.reply([
          `╔══〔 🌼 *THEELY-MD — INACTIVOS* 〕══╗`,
          `║`,
          `║ 👻 *Lista de fantasmas:*`,
          `║ ${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n║ ')}`,
          `║`,
          `║ 👥 *Total:* ${total}`,
          `║`,
          `║ 💡 *Nota:* El conteo inicia desde`,
          `║ que el bot se activó en el grupo~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n'), null, { mentions: sider })
        break
      }

      case 'kickinactivos':
      case 'kickfantasmas': {
        if (total == 0) return conn.reply(m.chat, [
          `╔══〔 🌼 *THEELY-MD — INACTIVOS* 〕══╗`,
          `║`,
          `║ ✅ *¡Este grupo es activo!*`,
          `║ No hay fantasmas que expulsar~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n'), m)

        await m.reply([
          `╔══〔 🌼 *THEELY-MD — KICK INACTIVOS* 〕══╗`,
          `║`,
          `║ 🚫 *Eliminando inactivos...*`,
          `║`,
          `║ 👻 *Lista de fantasmas:*`,
          `║ ${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n║ ')}`,
          `║`,
          `║ ⏳ Se expulsará uno cada 10s~`,
          `║`,
          `╚══════════════════════════════════╝`
        ].join('\n'), null, { mentions: sider })

        await delay(10000)

        let chat = global.db.data.chats[m.chat]
        chat.welcome = false

        try {
          let users      = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))
          let kickedGhost = sider.map(v => v.id).filter(v => v !== conn.user.jid)

          for (let user of users) {
            if (
              user.endsWith('@s.whatsapp.net') &&
              !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin
            ) {
              let res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
              kickedGhost.concat(res)
              await delay(10000)
            }
          }

          await conn.reply(m.chat, [
            `╔══〔 🌼 *THEELY-MD — KICK INACTIVOS* 〕══╗`,
            `║`,
            `║ ✅ *¡Limpieza completada!*`,
            `║ Los fantasmas fueron expulsados~`,
            `║`,
            `╚══════════════════════════════════╝`
          ].join('\n'), m)

        } finally {
          chat.welcome = true
        }
        break
      }
    }

  } catch (e) {
    m.reply([
      `╔══〔 🌼 *THEELY-MD — ERROR* 〕══╗`,
      `║`,
      `║ ❌ *Se produjo un problema~*`,
      `║ ${e.message.slice(0, 80)}`,
      `║`,
      `║ 💡 Usa *${usedPrefix}report* para`,
      `║ informarlo~`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }
}

handler.tags     = ['grupo']
handler.command  = ['inactivos', 'fantasmas', 'kickinactivos', 'kickfantasmas']
handler.group    = true
handler.botAdmin = true
handler.admin    = true
handler.desc     = 'Lista y expulsa miembros inactivos del grupo'

export default handler
