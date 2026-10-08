# Segurança

Encontrou uma vulnerabilidade? **Não abra uma issue pública.** Envie os
detalhes por mensagem privada no Instagram [@focus.frog](https://www.instagram.com/focus.frog)
ou pelo e-mail de contato do site. Respondemos em até 7 dias.

## Como o app trata os dados

- **Local-first**: tarefas, lagoa, coleção e configurações ficam no aparelho.
- **Sem backup automático do Android**: os dados não vão pra nuvem do Google
  sem você saber (`allowBackup="false"`).
- **Conta é opcional**: com login (Google ou GitHub), os dados são
  sincronizados no Supabase, protegidos por *Row Level Security* — cada
  usuário só lê e escreve as próprias linhas.
- A chave do Supabase no app é a *anon key*, pública por definição; a
  proteção vem das regras de acesso, não do segredo da chave.
- A chave de assinatura do APK **nunca** vai para o repositório.
