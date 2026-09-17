# Сборка одного EXE

Старый вариант через `pkg` удалён. Он мог пытаться собирать Node.js из исходников и требовать `patch.exe`.

Теперь используется официальный механизм Node.js Single Executable Application (SEA) + esbuild + postject.

## Требования только на компьютере сборки

- Windows x64
- Node.js 20.6 или новее
- интернет на время `npm install`

VS Code, Python, Git и отдельный `patch.exe` не нужны.

## Сборка

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\build-exe.ps1
```

Готовый файл:

```text
dist\AiTGAida-Anna.exe
```

## Компьютер пользователя

Нужен только:

```text
AiTGAida-Anna.exe
.env
data\
```

Node.js/npm/VS Code/Python/Git на нём не нужны.

`.env` должен содержать Telegram и Polza ключи. Секреты не вшиваются в EXE.
