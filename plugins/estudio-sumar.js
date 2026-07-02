const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args.length || args[0] === 'help' || args[0] === '?') {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — SUMA* 〕══╗`,
      `║`,
      `║  📝 *Suma dos o más números*`,
      `║`,
      `║  💡 *Uso:* ${usedPrefix}sumar <n1> <n2> <n3...>`,
      `║  📌 *Ejemplo:* ${usedPrefix}sumar 5 10 3.5 7`,
      `║  📊 *Salida:* 5 + 10 + 3.5 + 7 = 25.5`,
      `║`,
      `║  🧮 *Flags opcionales:*`,
      `║  -p  →  muestra el promedio`,
      `║  -s  →  muestra solo el resultado (resumido)`,
      `║  -d  →  modo detallado (paso a paso)`,
      `║`,
      `║  📌 *Ejemplos avanzados:*`,
      `║  ${usedPrefix}sumar 10 20 30 -p`,
      `║  ${usedPrefix}sumar 2.5 3.7 1.8 -d`,
      `║  ${usedPrefix}sumar 100 200 300 -s`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const flags = { promedio: false, simple: false, detallado: false }
  const numeros = []

  for (const arg of args) {
    if (arg === '-p' || arg === '--promedio') {
      flags.promedio = true
    } else if (arg === '-s' || arg === '--simple') {
      flags.simple = true
    } else if (arg === '-d' || arg === '--detallado') {
      flags.detallado = true
    } else {
      const num = parseFloat(arg.replace(',', '.'))
      if (!isNaN(num)) numeros.push(num)
    }
  }

  if (numeros.length < 2) {
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — SUMA* 〕══╗`,
      `║`,
      `║  ❌ *Necesitas al menos 2 números*`,
      `║  💡 Usa ${usedPrefix}sumar help para ayuda`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  const total = numeros.reduce((a, b) => a + b, 0)
  const operacion = numeros.join(' + ')
  const promedio = total / numeros.length

  if (flags.simple) {
    await m.react('➕')
    return m.reply(`✅ *Resultado:* ${total}`)
  }

  if (flags.detallado) {
    let pasos = numeros.map((n, i) => {
      const parcial = numeros.slice(0, i + 1).reduce((a, b) => a + b, 0)
      return `║  Paso ${i+1}: ${numeros.slice(0, i + 1).join(' + ')} = ${parcial}`
    })

    await m.react('➕')
    return m.reply([
      `╔══〔 🌼 *THEELY-MD — SUMA (DETALLADA)* 〕══╗`,
      `║`,
      ...pasos,
      `║`,
      `║  ✅ *Resultado final:* ${total}`,
      ...(flags.promedio ? [`║  📊 *Promedio:* ${promedio}`] : []),
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n'))
  }

  await m.react('➕')
  await m.reply([
    `╔══〔 🌼 *THEELY-MD — SUMA* 〕══╗`,
    `║`,
    `║  📝 *Operación:*`,
    `║  ${operacion} = ${total}`,
    `║`,
    ...(flags.promedio ? [`║  📊 *Promedio:* ${promedio}`] : []),
    `║`,
    `║  ✅ *Resultado:* ${total}`,
    `║`,
    `╚══════════════════════════════════╝`
  ].join('\n'))
}

handler.help = ['sumar <n1> <n2> ...']
handler.tags = ['estudio']
handler.command = ['sumar', 'suma', '+']
handler.register = true
handler.desc = 'Suma dos o más números'
export default handler