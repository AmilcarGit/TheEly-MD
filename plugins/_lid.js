// plugins/_lid.js
/**
 * 🛡️ Control de límites para evitar errores rate-overlimit
 */

const cooldowns = new Map();
const TIEMPO_ESPERA = 1500; // 1.5 segundos entre acciones

// ✅ Verifica si el usuario puede enviar mensajes
export async function puedeEnviar(usuario) {
  if (!cooldowns.has(usuario)) {
    cooldowns.set(usuario, Date.now() + TIEMPO_ESPERA);
    return true;
  }
  const tiempoRestante = cooldowns.get(usuario) - Date.now();
  if (tiempoRestante <= 0) {
    cooldowns.set(usuario, Date.now() + TIEMPO_ESPERA);
    return true;
  }
  return false;
}

// ✅ Función de pausa segura
export function esperar(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ Limpieza automática de registros antiguos
setInterval(() => {
  const ahora = Date.now();
  for (const [usuario, tiempo] of cooldowns.entries()) {
    if (tiempo < ahora) cooldowns.delete(usuario);
  }
}, 30000);