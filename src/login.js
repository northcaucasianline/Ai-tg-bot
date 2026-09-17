
const {envFile}=require("./runtime");
require("dotenv").config({path:envFile});

const input = require("input");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const qrcode = require("qrcode-terminal");

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiId || !apiHash) {
    console.error("Не найдены TELEGRAM_API_ID или TELEGRAM_API_HASH в .env");
    process.exit(1);
}

const session = new StringSession("");

const client = new TelegramClient(
    session,
    apiId,
    apiHash,
    {
        connectionRetries: 5,
        retryDelay: 1000,
        timeout: 15,

        proxy: process.env.TELEGRAM_PROXY_HOST ? {
            socksType: 5,
            ip: process.env.TELEGRAM_PROXY_HOST,
            port: Number(process.env.TELEGRAM_PROXY_PORT || 1080)
        } : undefined
    }
);

async function main() {
    console.log("");
    console.log("========================================");
    console.log(" Telegram AI Character");
    console.log(" QR АВТОРИЗАЦИЯ");
    console.log("========================================");
    console.log("");
    console.log(process.env.TELEGRAM_PROXY_HOST ? `SOCKS5: ${process.env.TELEGRAM_PROXY_HOST}:${process.env.TELEGRAM_PROXY_PORT || 1080}` : "SOCKS5: не используется (прямое подключение)");
    console.log("Подключение к Telegram...");
    console.log("");

    await client.connect();

    console.log("Соединение установлено.");
    console.log("");
    console.log("Ожидаю QR-код...");
    console.log("");

    await client.signInUserWithQrCode(
        {
            apiId,
            apiHash
        },
        {
            onError: async (error) => {
                console.error("");
                console.error("Ошибка QR авторизации:");
                console.error(error);
                return true;
            },

            qrCode: async (code) => {
                console.clear();

                console.log("========================================");
                console.log(" TELEGRAM QR АВТОРИЗАЦИЯ");
                console.log("========================================");
                console.log("");
                console.log("На телефоне открой:");
                console.log("");
                console.log("Telegram → Настройки → Устройства");
                console.log("→ Подключить устройство");
                console.log("");
                console.log("Отсканируй QR-код:");
                console.log("");

                const token = code.token.toString("base64url");
                const loginUrl = `tg://login?token=${token}`;

                qrcode.generate(loginUrl, {
                    small: false
                });

                console.log("");
                console.log("QR обновляется автоматически.");
                console.log("");
            },

            password: async () => {
                console.log("");
                console.log("========================================");
                console.log(" ТРЕБУЕТСЯ ПАРОЛЬ 2FA");
                console.log("========================================");
                console.log("");
                console.log("Введи пароль двухэтапной проверки Telegram.");
                console.log("");

                return await input.password("Пароль 2FA: ");
            }
        }
    );

    console.clear();

    console.log("");
    console.log("========================================");
    console.log(" УСПЕШНО АВТОРИЗОВАНО");
    console.log("========================================");
    console.log("");

    const me = await client.getMe();

    console.log(`ID: ${me.id}`);
    console.log(`Имя: ${me.firstName || ""} ${me.lastName || ""}`);
    console.log(`Username: ${me.username ? "@" + me.username : "нет"}`);

    const savedSession = client.session.save();

    console.log("");
    console.log("========================================");
    console.log(" TELEGRAM_SESSION");
    console.log("========================================");
    console.log("");

    console.log(savedSession);

    console.log("");
    console.log("========================================");
    console.log(" ДОБАВЬ В .env");
    console.log("========================================");
    console.log("");
    console.log(`TELEGRAM_SESSION=${savedSession}`);
    console.log("");

    await client.disconnect();
}

main().catch((error) => {
    console.error("");
    console.error("========================================");
    console.error(" ОШИБКА");
    console.error("========================================");
    console.error("");
    console.error(error);
    console.error("");

    process.exit(1);
});

