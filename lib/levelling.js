// lib/levelling.js
// 🌼 Sistema de niveles de TheEly-MD 🌼

/**
 * Calcula el rango de XP de un nivel determinado.
 * @param {number} level - Nivel actual del usuario
 * @param {number} multiplier - Multiplicador global de dificultad (default 1)
 * @returns {{ min: number, xp: number, max: number }}
 *   min = XP acumulado necesario para llegar a este nivel
 *   xp  = XP que se necesita ganar dentro de este nivel (max - min)
 *   max = XP acumulado necesario para llegar al siguiente nivel
 */
export function xpRange(level, multiplier = 1) {
  const min = xpNeeded(level, multiplier)
  const max = xpNeeded(level + 1, multiplier)
  const xp  = max - min
  return { min, xp, max }
}

/**
 * XP acumulado total necesario para alcanzar un nivel.
 * Fórmula cuadrática suave: crece más cada nivel, sin volverse imposible.
 * Ajustada para que el Nivel 1 requiera ~50 XP.
 */
function xpNeeded(level, multiplier = 1) {
  if (level <= 0) return 0
  return Math.round(
    (2 * Math.pow(level, 2) + 30 * level + 20) * multiplier
  )
}

/**
 * Calcula el nivel actual a partir del XP total acumulado.
 * @param {number} totalExp
 * @param {number} multiplier
 * @returns {number} nivel actual
 */
export function levelFromExp(totalExp, multiplier = 1) {
  let level = 0
  while (xpNeeded(level + 1, multiplier) <= totalExp) {
    level++
  }
  return level
}

/**
 * Aplica XP ganado a un usuario y detecta si subió de nivel.
 * Muta el objeto `user` directamente (exp y level).
 * @param {object} user - objeto user de global.db.data.users[jid]
 * @param {number} gainedExp - XP ganado en esta interacción
 * @param {number} multiplier - multiplicador global
 * @returns {{ leveledUp: boolean, oldLevel: number, newLevel: number, totalExp: number }}
 */
export function applyExp(user, gainedExp, multiplier = 1) {
  const oldLevel = isNumber(user.level) ? user.level : 0

  user.exp = (isNumber(user.exp) ? user.exp : 0) + (gainedExp || 0)

  const newLevel = levelFromExp(user.exp, multiplier)
  const leveledUp = newLevel > oldLevel

  user.level = newLevel

  return { leveledUp, oldLevel, newLevel, totalExp: user.exp }
}

function isNumber(x) {
  return typeof x === 'number' && !isNaN(x)
}
