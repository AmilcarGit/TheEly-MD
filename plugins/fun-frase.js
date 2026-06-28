const FRASES = [
  { texto: 'El poder no viene de nada fácil. Se forja en el dolor y la determinación.', autor: 'Goku — Dragon Ball' },
  { texto: 'Si no luchas por lo que quieres, no llores por lo que pierdes.', autor: 'Proverbio' },
  { texto: 'El fracaso es simplemente la oportunidad de comenzar de nuevo, pero con más inteligencia.', autor: 'Henry Ford' },
  { texto: 'No importa cuántas veces caigas, sino cuántas veces te levantes.', autor: 'Naruto Uzumaki' },
  { texto: 'La diferencia entre lo posible y lo imposible está en la determinación.', autor: 'Tommy Lasorda' },
  { texto: 'No llores porque terminó, sonríe porque sucedió.', autor: 'Dr. Seuss' },
  { texto: 'El único modo de hacer un gran trabajo es amar lo que haces.', autor: 'Steve Jobs' },
  { texto: 'Sé el cambio que quieres ver en el mundo.', autor: 'Gandhi' },
  { texto: 'Los sueños no funcionan si tú no lo haces.', autor: 'John C. Maxwell' },
  { texto: 'No busques encontrarte a ti mismo. Crea quién quieres ser.', autor: 'Anónimo' },
  { texto: 'La fuerza no viene del cuerpo físico, viene de una voluntad indomable.', autor: 'Mahatma Gandhi' },
  { texto: 'Nunca sabrás de lo que eres capaz hasta que lo intentes.', autor: 'Anónimo' },
  { texto: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', autor: 'Robert Collier' },
  { texto: 'La vida es lo que pasa mientras estás ocupado haciendo otros planes.', autor: 'John Lennon' },
  { texto: 'En medio de las dificultades yace la oportunidad.', autor: 'Albert Einstein' },
]

const handler = async (m, { conn }) => {
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)]

  await conn.sendMessage(m.chat, {
    text: [
      `╔══〔 🌼 *THEELY-MD — FRASE* 〕══╗`,
      `║`,
      `║ 💬 *"${frase.texto}"*`,
      `║`,
      `║ ✍️ — ${frase.autor}`,
      `║`,
      `╚══════════════════════════════════╝`
    ].join('\n')
  }, { quoted: m })

  await m.react('✨')
}

handler.help    = ['frase']
handler.tags    = ['fun']
handler.command = ['frase', 'quote', 'motivacion']
handler.desc    = 'Frase motivacional o de anime aleatoria'
export default handler
