<div align="center">
  <img src="./src/assets/icon.png" width="256" alt="FocusFrog Icon" />
  <h1>🐸 FocusFrog</h1>
  <p><strong>Produtividade para Mentes Criativas</strong></p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
    <img alt="Capacitor" src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white"/>

  </p>
</div>

FocusFrog é uma caixa de ferramentas de produtividade, desenhada para acalmar mentes criativas e com TDAH. Em vez de apenas listar tarefas, o aplicativo oferece um sistema de apoio com ferramentas específicas para os desafios do dia a dia.

---

### ✨ As Ferramentas na sua Caixa

<table>
  <!-- ... (table content) ... -->
</table>

### 🤔 Como Usar no Dia a Dia

<!-- ... (usage guide) ... -->

---

## 🚀 Como Começar (Para Desenvolvedores)

Este projeto usa React (Vite) para o front-end e **Capacitor** para a compilação nativa (Android/iOS).

### 1. Configuração Essencial do Firebase

Antes de rodar, você precisa de um backend Firebase para que o aplicativo funcione.

1.  **Crie um Projeto no Firebase:** Vá para o [console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2.  **Obtenha as Chaves de Configuração:** Nas configurações do seu projeto, adicione um novo "App da Web" e copie o objeto `firebaseConfig` que será gerado.
3.  **Atualize o Código:** Abra o arquivo `src/firebase.ts` e substitua o objeto `firebaseConfig` que está lá pelo objeto que você copiou do seu próprio projeto.

> **Aviso:** O repositório contém chaves de exemplo para facilitar um primeiro teste rápido, mas você **deve** usar seu próprio projeto Firebase para que a autenticação e o banco de dados funcionem corretamente.

### 2. Rodando para Desenvolvimento Web

Esta é a forma mais rápida de ver o aplicativo em ação no seu navegador.

1.  **Clone o repositório e entre na pasta:**
    '''bash
    git clone <URL_DO_REPOSITÓRIO>
    cd focusfrog
    '''

2.  **Instale as dependências:**
    '''bash
    npm install
    '''

3.  **Rode o servidor de desenvolvimento:**
    '''bash
    npm run dev
    '''
    O aplicativo estará rodando em `http://localhost:5173`.

### 3. Rodando em um Dispositivo Android

Para testar as funcionalidades nativas, siga os passos abaixo (após completar a instalação para web).

1.  **Instale o Capacitor CLI (se ainda não tiver):**
    '''bash
    npm install -g @capacitor/cli
    '''

2.  **Sincronize o projeto:** Este comando compila o app web e copia os arquivos para o projeto nativo do Android.
    '''bash
    npx cap sync
    '''

3.  **Abra o projeto no Android Studio:**
    '''bash
    npx cap open android
    '''

4.  **Rode o App:** Com o Android Studio aberto, você pode rodar o aplicativo em um emulador ou em um dispositivo físico conectado.

## 🏛️ Arquitetura do Projeto ("Arquitetura da Casa")

<!-- ... (architecture details) ... -->
