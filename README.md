<div align="center">
  <img src="./src/assets/icon.png" width="256" alt="FocusFrog Icon" />
  <h1>🐸 FocusFrog</h1>
  <p><strong>Produtividade para Mentes Criativas</strong></p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  </p>
</div>

FocusFrog é uma caixa de ferramentas de produtividade, desenhada para acalmar mentes criativas e com TDAH. Em vez de apenas listar tarefas, o aplicativo oferece um sistema de apoio com ferramentas específicas para os desafios do dia a dia.

---

### ✨ As Ferramentas na sua Caixa

<table>
  <tr>
    <td width="80" align="center">🐸</td>
    <td><strong>Engula o Sapo do Dia</strong><br>Baseado na ideia de que completar a tarefa mais difícil primeiro torna o resto do dia mais fácil, o app te ajuda a definir UMA prioridade diária. Concluí-la já é uma vitória.</td>
  </tr>
  <tr>
    <td width="80" align="center">📝</td>
    <td><strong>Matriz de Decisão Clara</strong><br>Para combater a paralisia de "não sei por onde começar", use a Matriz de Prioridades para organizar suas ideias. Ela te ajuda a separar o que é para <strong>FAZER AGORA</strong> do que pode ser <strong>AGENDADO</strong>, dando clareza imediata.</td>
  </tr>
  <tr>
    <td width="80" align="center">⚡️</td>
    <td><strong>Rotinas que Pensam por Você</strong><br>Use rotinas pré-montadas (como "arrumar em 5 min" ou "preparar para dormir") que quebram tarefas assustadoras em passos rápidos e gerenciáveis para você apenas seguir.</td>
  </tr>
    <tr>
    <td width="80" align="center">✅</td>
    <td><strong>Checklist "Já Pegou?"</strong><br>Uma ferramenta simples para ajudar sua memória de trabalho antes de sair. Verifique rapidamente itens essenciais como chaves e carteira para evitar o estresse de ter que voltar.</td>
  </tr>
</table>

---

## 🚀 Como Começar

Siga os passos abaixo para rodar o projeto localmente na sua máquina.

**Pré-requisitos:**
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)

**Instalação:**

1.  **Clone o repositório:**
    Obtenha a URL (HTTPS ou SSH) clicando no botão "Code" no topo desta página e execute o comando abaixo em seu terminal.
    '''bash
    git clone <URL_DO_REPOSITÓRIO>
    '''

2.  **Entre na pasta do projeto:**
    '''bash
    cd focusfrog
    '''

3.  **Instale as dependências:**
    '''bash
    npm install
    '''

4.  **Rode o servidor de desenvolvimento:**
    '''bash
    npm run dev
    '''

Após esses passos, o aplicativo estará rodando em `http://localhost:5173`.

## 🏛️ Arquitetura do Projeto ("Arquitetura da Casa")

O projeto segue uma filosofia de organização clara para garantir escalabilidade e manutenção:

*   **/src/components**: Componentes de UI reutilizáveis (a "Mobília").
*   **/src/screens**: As telas principais do aplicativo (os "Cômodos").
*   **/src/context**: Gerenciadores de estado global (os "Cérebros").
*   **/src/hooks**: Hooks customizados para lógica reutilizável (as "Caixas de Ferramentas").
*   **/src/global-styles.css**: Estilos globais e de base (a "Fundação").
*   **`[Componente].module.css`**: Estilos específicos para um componente ou tela (a "Decoração").
