# 🎴 Amigo Trunfo XP

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Amigo Trunfo XP Banner" width="800" />
  
  **Um jogo de cartas colecionáveis com visual nostálgico Windows XP!**
</div>

---

## 🎮 Sobre o Projeto

Amigo Trunfo XP é um jogo de cartas colecionáveis onde você:

- 🔐 **Login com Google** - Autenticação segura via Supabase
- 🎨 **Cria sua Carta Mestre** - Com selo exclusivo de Fundador
- 🎁 **Abre Packs** - Ganhe cartas aleatórias de NPCs famosos
- ⚔️ **Batalha** (em breve) - Compare atributos e ganhe XP

### Visual Nostálgico Windows XP
Todo o design é inspirado na estética dos anos 2000, com cores e elementos que remetem ao Windows XP.

---

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Estilo:** TailwindCSS
- **Backend:** Supabase (Auth + Database)
- **IA:** Google Gemini API (geração de atributos)
- **Imagens:** html-to-image (download/share)

---

## ⚙️ Configuração Local

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- API Key do [Google AI Studio](https://aistudio.google.com)

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/amigo-trunfo-xp.git
cd amigo-trunfo-xp
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz:
```env
GEMINI_API_KEY=sua_chave_gemini
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Configure o Supabase
1. Crie um projeto no Supabase
2. Execute o SQL em `database/schema.sql` no SQL Editor
3. Configure Google OAuth em Authentication → Providers

### 5. Inicie o servidor
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🌐 Deploy no GitHub Pages

### 1. Configure o `vite.config.ts`
Adicione o `base` com o nome do seu repositório:
```ts
export default defineConfig({
  base: '/amigo-trunfo-xp/', // Nome do seu repositório
  // ... resto da config
})
```

### 2. Build do projeto
```bash
npm run build
```

### 3. Deploy manual
```bash
npm install -g gh-pages
gh-pages -d dist
```

### 4. Configure o GitHub
1. Vá em Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / root
4. Aguarde alguns minutos

Seu app estará em: `https://SEU_USUARIO.github.io/amigo-trunfo-xp/`

### ⚠️ Importante para GitHub Pages
O GitHub Pages só serve arquivos estáticos. Certifique-se de:
- Configurar a URL do Supabase OAuth para incluir o domínio do GitHub Pages
- As variáveis `VITE_*` estarão expostas no código (isso é normal para client-side)

---

## 📁 Estrutura do Projeto

```
amigo-trunfo-xp/
├── components/           # Componentes React
│   ├── Dashboard.tsx     # Tela principal
│   ├── LoginScreen.tsx   # Login Windows XP
│   ├── OnboardingScreen.tsx
│   ├── PackOpening.tsx   # Abertura de packs
│   ├── CardPlayground.tsx # Modo diversão
│   └── HoloCard.tsx      # Componente da carta
├── services/
│   └── geminiService.ts  # Integração com Gemini AI
├── lib/
│   └── supabase.ts       # Cliente Supabase
├── database/
│   └── schema.sql        # Schema do banco
├── App.tsx               # Componente raiz
└── types.ts              # Tipos TypeScript
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com ❤️ e muita nostalgia dos anos 2000
</div>
