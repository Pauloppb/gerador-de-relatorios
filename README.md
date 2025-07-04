# 🧠 Gerador Automático de Relato de Atendimento

![Hospedado na Vercel](https://img.shields.io/badge/Hospedado%20na-Vercel-black?style=for-the-badge&logo=vercel)
![JavaScript](https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

Este projeto é uma ferramenta web que utiliza **Inteligência Artificial** para transformar transcrições de conversas de atendimento em relatórios estruturados e profissionais de forma instantânea.

A aplicação é flexível e moderna, permitindo escolher entre as **APIs da Google (Gemini)** ou da **Groq (Llama 3)** para a geração dos relatórios.

---

## ✨ Funcionalidades

- **🧠 Geração Automática:** Cole o texto da conversa e a IA gera um relatório formatado e conciso, extraindo as informações mais importantes.
- **🎨 Interface Limpa:** Design simples e direto ao ponto para máxima eficiência e facilidade de uso.
- **⚡ Botões de Ação Rápida:** Copiar ou Limpar os campos com apenas um clique.
- **🔐 Seguro:** A chave da API é mantida de forma segura no backend, sem exposição no navegador.
- **🌐 Multi-Provider:** Suporte a múltiplas APIs de IA (Gemini ou Groq), com seleção via variável de ambiente.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma arquitetura moderna e eficiente:

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend:** Node.js, implementado como uma função serverless (ex: [Vercel Serverless Function](https://vercel.com/docs/functions))
- **APIs de IA:**
  - 🧠 **Google Gemini** – `gemini-1.5-flash-latest`
  - 🦙 **Groq (LLaMA 3)** – `llama3-8b-8192`
- **📦 Estratégia de Prompt:** Comunicação com a IA feita por prompt estruturado com retorno em formato `JSON`, garantindo consistência e precisão no relatório.
- **☁️ Hospedagem:** Vercel (ou outro serviço com suporte a funções serverless)

---

## 🚀 Como Rodar o Projeto

Você pode rodar o projeto localmente ou hospedar com facilidade usando a [Vercel](https://vercel.com/):

### 1. Clonar o Repositório

```bash
git clone https://github.com/Pauloppb/gerador-de-relatorios.git
cd gerador-de-relatorios
```

### 2. Instalar as Dependências (caso necessário)

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com as suas chaves de API:

```env
GROQ_API_KEY=sua-chave-aqui
GEMINI_API_KEY=sua-chave-aqui
AI_PROVIDER=groq # ou gemini
```

### 4. Rodar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📌 Exemplo de JSON Gerado

```json
{
  "relato_cliente": "Cliente informou que sua TV não estava ligando.",
  "procedimentos_realizados": "Realizei o reinício do sinal remotamente. Orientei a cliente a desligar o aparelho da tomada por 1 minuto como procedimento de teste.",
  "nome_cliente": "Maria",
  "telefone_cliente": "-",
  "protocolo_opa": "12345"
}
```

---

## 🧑‍💻 Autor

Desenvolvido por **Paulo Pereira** – 2025  
Com o apoio das APIs **Google Gemini** e **Groq LLaMA 3**.