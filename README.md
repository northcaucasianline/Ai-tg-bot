# \# AiTGAida — Anna AI

# 

# AI-персонаж для Telegram на базе \*\*Node.js + Telegram + Polza AI\*\*.

# 

# Анна — 23-летняя студентка стоматологического факультета из Ставрополя. Приложение поддерживает не просто генерацию ответов, а полноценное состояние персонажа и мира.

# 

# \## Возможности

# 

# \* 💬 AI-общение через Telegram

# \* 🧠 память и история диалогов

# \* ❤️ индивидуальная система отношений

# \* 🎭 настроение, энергия и социальность

# \* 🕐 динамическое расписание и недели A/B

# \* 🌙 сон, учёба, работа, отдых и другие активности

# \* 🌍 глобальные события персонажа

# \* 🔐 постепенное раскрытие личных деталей

# \* 🛡️ Response Guard для проверки ответов

# \* 📥 постоянная очередь сообщений

# \* 🔄 повторная обработка после ошибок

# \* 📊 статистика

# \* 👑 административные команды `/anna`

# \* 🧪 локальный режим тестирования

# \* 🌐 SOCKS5 / Xray / VLESS Reality

# \* 📦 сборка в portable Windows `.exe`

# 

# \## Архитектура

# 

# ```text

# Telegram

# &#x20;  ↓

# Message Queue

# &#x20;  ↓

# Character

# &#x20;├─ Persona

# &#x20;├─ Routine

# &#x20;├─ Mood

# &#x20;├─ Relationships

# &#x20;├─ Memory

# &#x20;├─ Secrets

# &#x20;├─ World / Events

# &#x20;└─ AI Engine

# &#x20;      ↓

# Response Guard

# &#x20;      ↓

# Telegram

# ```

# 

# Состояние приложения сохраняется в:

# 

# ```text

# data/character.json

# ```

# 

# Благодаря этому память, отношения и очередь сообщений сохраняются после перезапуска.

# 

# \## Требования

# 

# Для запуска из исходников:

# 

# \* Windows / Linux / macOS

# \* Node.js 20.6+

# \* Telegram API credentials

# \* Polza AI API key

# 

# \## Установка

# 

# ```bash

# npm install

# ```

# 

# Создайте `.env`:

# 

# ```env

# TELEGRAM\_API\_ID=

# TELEGRAM\_API\_HASH=

# TELEGRAM\_SESSION=

# OWNER\_TELEGRAM\_ID=

# 

# POLZA\_API\_KEY=

# POLZA\_BASE\_URL=https://polza.ai/api/v1

# POLZA\_MODEL=qwen/qwen3-30b-a3b

# AI\_TIMEOUT\_MS=45000

# 

# TELEGRAM\_PROXY\_HOST=

# TELEGRAM\_PROXY\_PORT=10808

# 

# DRY\_RUN=false

# ```

# 

# \### Авторизация Telegram

# 

# ```bash

# npm run login

# ```

# 

# После авторизации полученную `TELEGRAM\_SESSION` добавьте в `.env`.

# 

# \### Запуск

# 

# ```bash

# npm start

# ```

# 

# \### Локальное тестирование

# 

# ```bash

# npm run test-chat

# ```

# 

# \## Прокси

# 

# Приложение подключается к локальному SOCKS5-прокси. Например:

# 

# ```env

# TELEGRAM\_PROXY\_HOST=127.0.0.1

# TELEGRAM\_PROXY\_PORT=10808

# ```

# 

# Xray / sing-box при этом работает отдельно и уже устанавливает VLESS/Reality-соединение.

# 

# Если прокси не нужен:

# 

# ```env

# TELEGRAM\_PROXY\_HOST=

# ```

# 

# \## Администрирование

# 

# Владелец определяется через:

# 

# ```env

# OWNER\_TELEGRAM\_ID=

# ```

# 

# Основные команды:

# 

# ```text

# /anna status

# /anna routine

# /anna stats

# /anna users

# /anna info ID

# /anna pause ID

# /anna resume ID

# /anna stop

# /anna start

# /anna mood ID настроение

# /anna set ID key value

# /anna send ID текст

# ```

# 

# \## Сборка EXE

# 

# ```powershell

# Set-ExecutionPolicy -Scope Process Bypass

# .\\build-exe.ps1

# ```

# 

# Готовый файл:

# 

# ```text

# dist/AiTGAida-Anna.exe

# ```

# 

# Для запуска готового EXE Node.js не требуется.

# 

# Минимальная структура:

# 

# ```text

# AiTGAida/

# ├── AiTGAida-Anna.exe

# ├── .env

# └── data/

# ```

# 

# \## Безопасность

# 

# Никогда не публикуйте:

# 

# \* `.env`

# \* `TELEGRAM\_SESSION`

# \* `POLZA\_API\_KEY`

# \* Telegram API credentials

# 

# Эти данные дают доступ к внешним сервисам и должны храниться только локально.

# 

# \## License

# 

# Private / Personal Use.



