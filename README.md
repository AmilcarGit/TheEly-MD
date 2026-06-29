<div align="center">

# 🤖 TheEly‑MD
**Bot de WhatsApp Multi‑Dispositivo ligero, modular y fácil de extender**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green?logo=nodedotjs&style=for-the-badge)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-Latest-blue?style=for-the-badge)](https://github.com/WhiskeySockets/Baileys)
[![GitHub](https://img.shields.io/badge/GitHub-Repositorio-black?logo=github&style=for-the-badge)](https://github.com/AmilcarGit/TheEly-MD)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)](./LICENSE)
[![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-brightgreen?style=for-the-badge)]()

> Basado en **@whiskeysockets/baileys**, construido con **Node.js**, diseñado para ser rápido, estable y muy sencillo de personalizar.

</div>
---

<details>
  <summary><b>🌼 Recomendaciones</b></summary>

 <details>
  <summary><b>Sobre TheEly-MD</b></summary>
  
| Tema | Descripción | Atajo |
|------|-------------|-------|
| 🔑 **Owners** | *Define quiénes tendrán control total del bot.* | [![Here](https://img.shields.io/badge/Aquí-green)](https://github.com/AmilcarGit/TheEly-MD/blob/main/config.js) |
| ✏️ **Modificar nombre** | *Modifica el nombre del bot de manera sencilla.* | [![Here](https://img.shields.io/badge/Aquí-green)](https://github.com/AmilcarGit/TheEly-MD/blob/main/config.js) |
| 📲 **Conectar con código (opcional)** | *Vincula directamente tu número para recibir código de 8 dígitos.* | [![Here](https://img.shields.io/badge/Aquí-green)](https://github.com/AmilcarGit/TheEly-MD/blob/main/config.js) |
| 🆙 **Nivel de usuarios** | *Ajusta la dificultad para que los usuarios suban de nivel en el bot.* | [![Here](https://img.shields.io/badge/Aquí-green)](https://github.com/AmilcarGit/TheEly-MD/blob/main/config.js) |
| 😎 **Clonar proyecto** | *Crea tu propia versión usando como base este proyecto.* | [![Here](https://img.shields.io/badge/Aquí-green)](https://github.com/AmilcarGit/TheEly-MD/fork) |
| 🐈 **Política** | *Descubre el compromiso y la dedicación detrás de este proyecto.* | [![Here](https://img.shields.io/badge/Aquí-green)](pronto/master/terms.md) |
| ✅ **Colaboradores** | *Conoce a los implicados que hacen posible este proyecto.* | [![Here](https://img.shields.io/badge/Aquí-green)](pronto/contributors) |
</details>  
</details>

---

## 🚀 Instalación paso a paso


## Instalación por Termux

> [!IMPORTANT]
> **No garantizamos un funcionamiento perfecto en Termux, aunque trabajamos constantemente para asegurar una buena compatibilidad. Si experimentas lentitud o errores, por favor envía una solicitud con la evidencia correspondiente para que nuestro equipo pueda solucionarlo. Si el problema persiste, te recomendamos considerar los servicios de alojamiento de bots de nuestros patrocinadores.**

<details>
  <summary><b>Instalación Manual</b></summary>
 
[![blog](prontovideo)](https://youtube.com/shorts/PESW8LXXlOI?feature=share)
> *Comandos para instalar de formaa Manual en Termux*
```bash
termux-setup-storage
```
```bash
apt update && apt upgrade && pkg install -y git nodejs ffmpeg imagemagick yarn
```
```bash
git clone https://github.com/AmilcarGit/TheEly-MD.git && cd TheEly-MD
```
```bash
 npm install
```
```bash
npm start
```
> *Si aparece **(Y/I/N/O/D/Z) [default=N] ?** use la letra **"y"** y luego **"ENTER"** para continuar con la instalación.*
</details>

</details>

> *Descarga y Descomprime*

----
### 🙀 Noticias del momento 
> **En este espacio se publicará comunicados espontáneos, por lo que recuerda visitar frecuentemente el repositorio para estar al tanto del proyecto.**
### **Cualquier novedad al respecto será anunciada a través de nuestras redes oficiales. [Más información.](https://whatsapp.com/channel/0029Vb8G49lKmCPR44sIOE1i)**
----
---

## 📌 Descripción
**TheEly‑MD** es un bot para WhatsApp que funciona en el modo oficial multi‑dispositivo, sin necesidad de mantener el teléfono conectado permanentemente. Cuenta con un sistema de **plugins independientes**, por lo que agregar, modificar o desactivar funciones es extremadamente sencillo. Ideal para gestión de grupos, automatizaciones, descargas y herramientas útiles para la comunidad.

✅ 100% código abierto  
✅ Sistema modular por carpetas  
✅ Bajo consumo de memoria y recursos  
✅ Compatible con Termux, VPS, Windows, Linux y servicios en la nube  
✅ Conexión por código QR o código de emparejamiento de 8 dígitos

---

## ✨ Características principales

### 🛡️ Administración y grupos
- Agregar, expulsar y promover participantes
- Sistema de advertencias con expulsión automática
- Configurar bienvenidas, despedidas y reglas personalizadas
- Bloquear enlaces, palabras prohibidas y contenido no deseado
- Modo solo administradores / solo dueño / solo grupos

### 📥 Descargas multimedia
- YouTube: audio, video, cortos
- TikTok, Instagram, Facebook, X / Twitter
- Imágenes, stickers y documentos directos

### 🛠️ Herramientas generales
- Convertir imágenes a stickers y viceversa
- Edición de audio: velocidad, tono, recorte
- Generador de textos, códigos QR y datos de prueba
- Información de números, grupos y perfiles
- Limpieza automática de archivos temporales

### ⚙️ Técnicas y personalización
- Cargar comandos dinámicamente desde `./plugins`
- Configuración centralizada en un solo archivo
- Auto‑lectura y auto‑respuesta configurable
- Registro detallado de eventos y errores en consola

---

## 📋 Requisitos previos
Antes de instalar, asegúrate de tener instalado en tu sistema:

| Herramienta | Versión mínima | Descripción |
|---|---|---|
| **Node.js** | `18.x` o superior | Entorno de ejecución |
| **Git** | Cualquiera | Para clonar el repositorio |
| **FFmpeg** | 5.x o superior | Procesamiento de audio y video |
| **ImageMagick** | 7.x o superior | Manipulación de imágenes y stickers |

> En sistemas Linux / Termux se instalan directamente desde el gestor de paquetes.

