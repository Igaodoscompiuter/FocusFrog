# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]
### Adicionado
- Loja do Sapo (Jardim e Ajustes → Aparência): 7 temas novos, sons de fundo
  durante o foco e o "Coaxo da vitória", tudo com pontos de foco.
- Voltar do Android fecha o que está aberto; widget Sapo do Dia; compartilhar
  sapo novo como imagem.
- Conta opcional com Google ou Facebook e sincronização diária com a nuvem
  (Configurações → Conta e Sincronização), com cópia de segurança de 7 dias.
- Site oficial versionado em `site/`, com modal de download, SEO e
  `update.json` lido pelo app.
- Link `focusfrog://open` para o botão "Abrir o FocusFrog" do site.
- Aviso de nova versão disponível no app (APK).
- Licença proprietária, diretrizes de propriedade intelectual, guia de
  contribuição e política de segurança.
### Corrigido
- Tamanho de fonte agora vale pro app todo.
- Card Especial não aparece mais no começo do tutorial após resetar.
- Sapos não somem mais da lagoa; raridade respeitada no sorteio.
### Removido
- Sobras do Firebase e arquivos soltos sem uso.

## [1.4.0] — 2026-10-08
### Adicionado
- Modal de tarefa simplificado: passos, "Quando" (Hoje/Amanhã/Sem data/Escolher), tipo e pomodoros numa linha.
- Agenda de Hoje traz tarefas de dias anteriores com etiqueta "de ontem / há N dias".
- "Já pegou?" e Agenda recolhíveis na Home.
- Interruptor "Proteger o foco" nas Configurações.
- Chave de assinatura definitiva.
### Corrigido
- Tutorial travava quando o Card Especial era o Sapo do Dia.
- Modelos salvos sempre em "Personalizado".
- Dados voltavam após reinstalar (backup automático do Android).
- Nova tarefa abria sem data.

## [1.3.0] — 2026-10-07
### Adicionado
- Foco limpo: cutucada ao sair pra outro app e sapo só sem distração.
- Mascote com nome, tutorial interativo com o sapinho, Pix.
- Vida dos sapos e efeitos de fusão portados da Lagoa Zen.
### Corrigido
- Notificação de foco concluído, ícone com bordas escuras, lagoa/viveiro duplicando sapos.

[Não lançado]: https://github.com/Igaodoscompiuter/FocusFrog/compare/v1.4.0...develop
[1.4.0]: https://github.com/Igaodoscompiuter/FocusFrog/releases/tag/v1.4.0
