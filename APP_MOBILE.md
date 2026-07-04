# Rede Inspire — App Mobile (Capacitor)

## Setup

O app mobile usa **Capacitor** para empacotar o frontend React como app nativo.

### Pré-requisitos

- **Android:** Android Studio instalado
- **iOS:** Xcode instalado (somente macOS)
- **Node.js** 18+

### Configuração inicial (já feita)

```bash
cd frontend
npm install
npx cap add android
npx cap add ios
```

## Workflow diário

### 1. Desenvolver normalmente no web

```bash
cd frontend
npm run dev
```

### 2. Build + Sync para os apps

```bash
cd frontend
npm run build:app
```

Isso faz: build do React → copia para android/ e ios/

### 3. Abrir no Android Studio

```bash
cd frontend
npm run cap:android
```

No Android Studio: Run no emulador ou dispositivo.

### 4. Abrir no Xcode

```bash
cd frontend
npm run cap:ios
```

No Xcode: Selecionar dispositivo/simulador → Run.

### 5. Apenas sincronizar (após mudanças web)

```bash
cd frontend
npm run cap:sync
```

## Publicação nas lojas

### Google Play Store

1. No Android Studio: Build → Generate Signed Bundle/APK
2. Criar conta no [Google Play Console](https://play.google.com/console) ($25 única vez)
3. Upload do AAB (Android App Bundle)

### Apple App Store

1. No Xcode: Product → Archive
2. Criar conta no [Apple Developer Program](https://developer.apple.com) ($99/ano)
3. Upload via Xcode Organizer → App Store Connect

## Estrutura

```
frontend/
├── capacitor.config.ts    # Configuração do Capacitor
├── android/               # Projeto Android (Android Studio)
├── ios/                   # Projeto iOS (Xcode)
├── dist/                  # Build web (copiado para os apps)
└── src/                   # Código React (compartilhado)
```

## Plugins instalados

| Plugin | Função |
|--------|--------|
| @capacitor/splash-screen | Tela de loading ao abrir o app |
| @capacitor/status-bar | Controle da barra de status |
| @capacitor/keyboard | Comportamento do teclado |
| @capacitor/push-notifications | Notificações push |
| @capacitor/haptics | Feedback tátil |
| @capacitor/app | Lifecycle do app (back button, etc.) |

## Live Update (opcional futuro)

Para atualizar o app sem republicar nas lojas, considere:
- [Capgo](https://capgo.app/) — updates OTA gratuitos até 1000 users
- [Appflow](https://ionic.io/appflow) — solução Ionic oficial

Com live update, o deploy do frontend automaticamente atualiza o app na próxima abertura.
