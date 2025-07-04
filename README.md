# Gerador Automático de Relato de Atendimento

![Vercel](https://img.shields.io/badge/Hospedado%20na-Vercel-black?style=for-the-badge&logo=vercel)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

Este projeto é uma ferramenta web que utiliza Inteligência Artificial para transformar transcrições de conversas de atendimento em relatórios estruturados e profissionais de forma instantânea. A aplicação é flexível, permitindo escolher entre as APIs da **Google (Gemini)** ou da **Groq (Llama 3)** para a geração dos relatórios.

---

## Funcionalidades

-   **Geração Automática**: Cole o texto da conversa e a IA gera um relatório formatado e conciso, extraindo as informações mais importantes.
-   **Interface Limpa**: Design simples e direto ao ponto para máxima eficiência e facilidade de uso.
-   **Botões de Ação Rápida**: Funcionalidades para "Copiar" o resultado e "Limpar" os campos com um único clique.
-   **Seguro**: A chave da API é mantida de forma segura no servidor (backend), garantindo que ela não seja exposta no navegador do usuário.
-   **Multi-Provider**: Suporte para múltiplas APIs de IA, selecionáveis através de variáveis de ambiente, garantindo redundância e a possibilidade de escolher a melhor performance.

---

## Tecnologias Utilizadas

Este projeto foi construído com uma arquitetura moderna e eficiente:

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
-   **Backend**: Node.js, implementado como uma **Vercel Serverless Function**, o que permite um backend poderoso sem a necessidade de gerenciar um servidor tradicional.
-   **APIs de IA**:
    -   **Google Gemini**: `gemini-1.5-flash-latest`
    -   **Groq**: `llama3-8b-8192`
-   **Estratégia de Prompt**: A comunicação com as IAs é feita através de uma técnica robusta que solicita a saída em formato **JSON**. Isso garante que o relatório final seja sempre consistente e perfeitamente formatado, eliminando erros e alucinações da IA.
-   **Hospedagem**: Vercel

---

## Como Rodar o Projeto

Para rodar este projeto localmente ou fazer o deploy em sua própria conta da Vercel, siga os passos abaixo.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Paulobb/nome-do-seu-repositorio.git](https://github.com/Paulobb/nome-do-seu-repositorio.git)
cd nome-do-seu-repositorio
