# 💑 FinCouple — Sistema Financeiro do Casal

Sistema web de gestão financeira pessoal para casais, com finanças mistas (pessoal + compartilhado).

## ✨ Funcionalidades

- **Dashboard** — Visão geral do casal e individual, gráficos, alertas de orçamento
- **Lançamentos** — Registre receitas e despesas (pessoal ou compartilhado)
- **Divisão** — Controle quem pagou o quê e calcule automaticamente o saldo
- **Metas** — Metas do casal e individuais com progresso e aportes
- **Planejamento** — Reserva de emergência, simulador de imóvel (PRICE), "Posso Comprar?", limites de orçamento
- **Configurações** — Perfis e gerenciamento de dados

## 🚀 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🌐 Deploy na Vercel (gratuito)

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e conecte sua conta GitHub
3. Clique em "New Project" → selecione o repositório
4. Clique em "Deploy" — a Vercel detecta Vite automaticamente
5. Pronto! URL gerada automaticamente

## 🌐 Deploy no Netlify (gratuito)

1. Build: `npm run build`
2. Arraste a pasta `dist/` para [app.netlify.com/drop](https://app.netlify.com/drop)
3. Ou conecte via GitHub para deploy automático a cada push

## 📦 Stack

- **React 18** + TypeScript + Vite
- **Recharts** para gráficos
- **date-fns** para datas
- **localStorage** para persistência (sem backend, sem custos)
- **Lucide React** para ícones
- Design 100% customizado (dark theme, fontes Syne + DM Sans)

## 📝 Notas

- Os dados ficam salvos no navegador (localStorage)
- Cada pessoa usa no próprio dispositivo e atualiza manualmente os dados do parceiro
- Para sincronização real entre dispositivos, futuramente pode integrar Firebase Firestore (gratuito até certo limite)
