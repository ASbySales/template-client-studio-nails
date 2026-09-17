# 💅 Studio Nails — Link-na-Bio & Catálogo Interativo (Cliente)

> **Solução Digital e Comercial desenvolvida por [Albert Sales & Development](https://asnamanga.vercel.app/).**  
> Aplicação web moderna, responsiva e de alta conversão para Nail Designers, Studios de Beleza e Estética.

---

## 🚀 Funcionalidades

- **📱 Link-na-Bio Elegante:** Apresentação refinada com identidade visual premium (Navy & Gold), logo suspensa e links de contato rápido.
- **✨ Catálogo Interativo:** Visualização de serviços por categorias (*Alongamentos, Esmaltação, Nail Art, SPA*).
- **🔎 Modal de Detalhes:** Seleção personalizada de opcionais e adicionais de procedimento.
- **🛒 Carrinho de Agendamento:** Cálculo dinâmico de valores, preenchimento de dados da cliente com proteção anti-spam (Honeypot).
- **📲 Integração com WhatsApp & Banco:** Gravação de pedidos no banco de dados e redirecionamento automático com mensagem formatada e código do pedido (`#AG-XXXX`).
- **⚡ Mobile-First & Responsivo:** Experiência nativa em smartphones (iOS e Android) e monitores desktop.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Roteamento:** [React Router DOM v7](https://reactrouter.com/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) + Tipografia Google Fonts (*Cinzel* e *Inter*)
- **Banco de Dados & API:** [Supabase](https://supabase.com/) / [PostgREST Docker](https://postgrest.org/)
- **Controle de Versão:** Git & GitHub

---

## ⚙️ Configuração e Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/AsBySales/studio-nails-cliente.git
cd studio-nails-cliente
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
# URL da API / Supabase
VITE_SUPABASE_URL=http://localhost:3001
VITE_SUPABASE_ANON_KEY=anon

# Número do WhatsApp para onde os pedidos serão enviados (DDD + Número)
VITE_WHATSAPP_NUMBER=5583982301526
```

### 4. Executar localmente
```bash
npm run dev
```
Acesse no navegador: `http://localhost:5173`

---

## 📦 Build de Produção

Para gerar os arquivos estáticos otimizados para produção:
```bash
npm run build
```
Os arquivos prontos para deploy serão gerados na pasta `dist/`.

---

## 👨‍💻 Autor & Direitos

Desenvolvido por **[Albert Sales](https://asnamanga.vercel.app/)** — *Albert Sales & Development*.  
Todos os direitos reservados.
