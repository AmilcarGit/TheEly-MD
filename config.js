require('dotenv').config();

module.exports = {
    nombre: 'MiNuevoBot-MD',
    prefijo: process.env.PREFIX || '#',
    ownerNumero: process.env.OWNER_NUMBER || '51912345678',
    ownerNombre: 'TuNombre',
    
    // Funciones
    antiLink: true,
    bienvenida: true,
    
    // Mensajes personalizables
    mensajes: {
        bienvenida: '🌟 ¡Bienvenido {user} a {grupo}!',
        despedida: '👋 Adiós {user}...',
        soloOwner: '❌ Este comando es solo para mi creador',
        errorComando: '⚠️ Ocurrió un error al ejecutar el comando'
    }
};