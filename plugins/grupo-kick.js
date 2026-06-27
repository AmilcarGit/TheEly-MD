let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ SOLO DISPONIBLE EN GRUPOS
╚══════════════════════╝

💫 Este comando solo funciona en chats de grupo.`
    })
  }

  if (!isAdmin) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ⚡ ACCESO DENEGADO
╚══════════════════════╝

💫 Solo los administradores pueden usar este comando.`
    })
  }

  if (!isBotAdmin) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ⚠️ PERMISOS INSUFICIENTES
╚══════════════════════╝

💫 El bot necesita ser administrador para expulsar usuarios.`
    })
  }

  // Obtener usuario a expulsar
  let who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)
  if (!who) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❓ USO CORRECTO
╚══════════════════════╝

💫 Menciona al usuario o responde a su mensaje:
• .kick @usuario
• .sacar @usuario`
    })
  }

  // Obtener datos del grupo
  const metadata = await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ ERROR AL CARGAR DATOS
╚══════════════════════╝

💫 No se pudo obtener la información del grupo.`
    })
  }

  const whoData = metadata.participants.find(p => p.id === who)
  if (!whoData) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ USUARIO NO ENCONTRADO
╚══════════════════════╝

💫 Esa persona no es miembro de este grupo.`
    })
  }

  // Protecciones
  const botJid = conn.user.jid.includes(':')
    ? conn.user.jid.split(':')[0] + '@s.whatsapp.net'
    : conn.user.jid

  if (who === botJid) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ 💖 NO PUEDO EXPULSARME
╚══════════════════════╝

💫 No tengo permiso para quitarme a mí mismo.`
    })
  }

  const isOwnerBot = global.owner?.some(o => (o[0] + '@s.whatsapp.net') === who)
  if (isOwnerBot) {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ 👑 NO SE PUEDE EXPULSAR
╚══════════════════════╝

💫 No puedes expulsar al dueño del bot.`
    })
  }

  if (whoData.admin === 'superadmin') {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ 👑 PROTECCIÓN ACTIVA
╚══════════════════════╝

💫 No se puede expulsar al creador del grupo.`
    })
  }

  if (whoData.admin === 'admin') {
    return await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ⚠️ ADMINISTRADOR
╚══════════════════════╝

💫 No tengo permiso para expulsar a otro administrador.`
    })
  }

  try {
    await m.react('🚫')
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove')

    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ✅ USUARIO EXPULSADO
╚══════════════════════╝

👤 Usuario: @${who.split('@')[0]}
💫 El grupo queda más ordenado
✨ Acción completada con éxito`,
      mentions: [who]
    })

    await m.react('✅')
    await m.react('👋')

  } catch (e) {
    console.error('Error al expulsar:', e)
    await m.react('❌')
    await conn.sendMessage(m.chat, {
      text: `╔══〔 🌼 *THEELY-MD* 〕══╗
║ ❌ NO SE PUDO EXPULSAR
╚══════════════════════╝

💡 Verifica que el bot tenga rango de administrador.`
    })
  }
}

handler.help     = ['kick @usuario', 'sacar @usuario', 'echar @usuario', 'expulsar @usuario']
handler.tags     = ['grupo']
handler.command  = /^(kick|sacar|echar|expulsar)$/i
handler.group    = true
handler.admin    = true
handler.botAdmin = true
handler.desc     = 'Expulsa a un usuario del grupo'

export default handler