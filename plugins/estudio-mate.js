import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

function generarEjercicio(tipo) {
  let num1, num2, respuesta, simbolo

  switch (tipo) {
    case 'suma':
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * 50) + 1
      respuesta = num1 + num2
      simbolo = '+'
      break
    case 'resta':
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * num1) + 1
      respuesta = num1 - num2
      simbolo = '-'
      break
    case 'multiplicacion':
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      respuesta = num1 * num2
      simbolo = '×'
      break
    case 'division':
      num2 = Math.floor(Math.random() * 10) + 1
      respuesta = Math.floor(Math.random() * 10) + 1
      num1 = num2 * respuesta
      simbolo = '÷'
      break
    default:
      return null
  }

  return { num1, num2, respuesta, simbolo, tipo }
}

function generarOpciones(respuesta) {
  const opciones = new Set()
  opciones.add(respuesta)

  let intentos = 0
  while (opciones.size < 4 && intentos < 100) {
    let offset = Math.floor(Math.random() * 20) + 1
    if (Math.random() > 0.5) offset = -offset
    const candidato = respuesta + offset
    if (candidato >= 0 && candidato !== respuesta) {
      opciones.add(candidato)
    }
    intentos++
  }

  const arr = Array.from(opciones)
  while (arr.length < 4) {
    arr.push(respuesta + Math.floor(Math.random() * 10) + 1)
  }

  return arr.sort(() => Math.random() - 0.5)
}

function crearMensaje(chat, text, userId, m, opciones) {
  const rows = opciones.map((op, index) => ({
    title: `➡️ ${op}`,
    id: `mate_${index}_${userId}`
  }))

  return generateWAMessageFromContent(chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: '🌼 THEELY-MD — MATE',
            subtitle: 'Elige la respuesta correcta',
            hasMediaAttachment: false
          },
          body: { text },
          footer: { text: '🎮 Powered by TheEly-MD 🌼' },
          nativeFlowMessage: {
            buttons: [{
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '🔢 ELIGE UNA RESPUESTA',
                sections: [{
                  title: '📋 Opciones',
                  rows
                }]
              })
            }]
          }
        })
      }
    }
  }, { quoted: m })
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  const args = m.text.split(' ').slice(1)
  const tipos = ['suma', 'resta', 'multiplicacion', 'division']

  if (!args[0]) {
    const rows = [
      { title: '➕ Suma', id: `${_p}mate suma` },
      { title: '➖ Resta', id: `${_p}mate resta` },
      { title: '✖️ Multiplicación', id: `${_p}mate multiplicacion` },
      { title: '➗ División', id: `${_p}mate division` },
      { title: '🎲 Aleatorio', id: `${_p}mate aleatorio` }
    ]

    const buttonsMessage = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: proto.Message.InteractiveMessage.create({
            header: {
              title: '🌼 THEELY-MD — MATE',
              subtitle: 'Elige una operación',
              hasMediaAttachment: false
            },
            body: {
              text: [
                `╔══〔 🌼 *THEELY-MD — MATE* 〕══╗`,
                `║`,
                `║  🧮 *Elige la operación que quieras practicar*`,
                `║`,
                `║  📌 *Selecciona una opción abajo*`,
                `║`,
                `╚══════════════════════════════════╝`
              ].join('\n')
            },
            footer: { text: '🎮 Powered by TheEly-MD 🌼' },
            nativeFlowMessage: {
              buttons: [{
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📂 SELECCIONA UNA OPERACIÓN',
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
    await m.react('🧮')
    return
  }

  let tipo = args[0].toLowerCase()
  if (tipo === 'aleatorio') {
    const tiposLista = ['suma', 'resta', 'multiplicacion', 'division']
    tipo = tiposLista[Math.floor(Math.random() * tiposLista.length)]
  }

  if (!tipos.includes(tipo)) {
    return m.reply(`❌ *Operación no válida:* ${tipo}\n📌 Usa: suma, resta, multiplicacion, division, aleatorio`)
  }

  global.mate = global.mate || {}
  const ejercicios = generarEjercicio(tipo)
  if (!ejercicios) return m.reply('❌ *Error al generar el ejercicio*')

  const opciones = generarOpciones(ejercicios.respuesta)
  global.mate[m.sender] = {
    respuesta: ejercicios.respuesta,
    tipo: ejercicios.tipo,
    num1: ejercicios.num1,
    num2: ejercicios.num2,
    simbolo: ejercicios.simbolo,
    timestamp: Date.now()
  }

  const texto = [
    `╔══〔 🌼 *THEELY-MD — MATE* 〕══╗`,
    `║`,
    `║  📝 *${ejercicios.tipo.charAt(0).toUpperCase() + ejercicios.tipo.slice(1)}*`,
    `║`,
    `║  🧮 *${ejercicios.num1} ${ejercicios.simbolo} ${ejercicios.num2} = ?*`,
    `║`,
    `║  👇 *Elige la respuesta correcta*`,
    `╚══════════════════════════════════╝`
  ].join('\n')

  const msg = crearMensaje(m.chat, texto, m.sender, m, opciones)
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  await m.react('🧮')
}

handler.before = async (m, { conn }) => {
  const flow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!flow) return

  try {
    const data = JSON.parse(flow.paramsJson || '{}')
    const id = data.id
    if (!id || !id.startsWith('mate_')) return

    const [, opcionIndex, userId] = id.split('_')
    const juego = global.mate?.[userId]
    if (!juego) {
      await conn.sendMessage(m.chat, {
        text: `❌ *No hay ejercicio activo*\n💡 Usa .mate para empezar.`
      }, { quoted: m })
      return true
    }

    const seleccion = parseInt(opcionIndex)
    const respuestaCorrecta = juego.respuesta

    const opciones = generarOpciones(respuestaCorrecta)
    const opcionSeleccionada = opciones[seleccion]
    const acertó = opcionSeleccionada === respuestaCorrecta

    const mensaje = [
      `╔══〔 🌼 *THEELY-MD — RESULTADO* 〕══╗`,
      `║`,
      `║  📝 *${juego.num1} ${juego.simbolo} ${juego.num2} = ?*`,
      `║`,
      acertó ? `║  ✅ *¡CORRECTO!* 🎉` : `║  ❌ *INCORRECTO*`,
      `║`,
      `║  🔢 *Tu respuesta:* ${opcionSeleccionada}`,
      `║  ✅ *Respuesta correcta:* ${respuestaCorrecta}`,
      `║`,
      `║  💡 Usa .mate para otro ejercicio`,
      `╚══════════════════════════════════╝`
    ].join('\n')

    delete global.mate[userId]
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })
    await m.react(acertó ? '✅' : '❌')
    return true

  } catch (e) {
    console.error('❌ Error en mate:', e)
  }
}

handler.command = ['mate', 'matematica', 'matematicas', 'calculo']
handler.tags = ['estudio']
handler.help = ['mate', 'mate <operación>']
handler.desc = 'Ejercicios interactivos de matemáticas con botones'
handler.register = false
handler.limit = false

export default handler