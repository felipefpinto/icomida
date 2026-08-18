
# E-commerce — Frontend

Frontend da aplicação de e-commerce desenvolvido com **Next.js**.

## Tecnologias utilizadas

* Next.js
* React
* TypeScript/JavaScript
* Tailwind CSS
* Lucide React

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/) — versão 18 ou superior
* npm

Para verificar as versões:

```bash
node --version
npm --version
```

## Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO_FRONTEND>
```

Entre na pasta do projeto:

```bash
cd <NOME_DO_PROJETO>
```

Instale as dependências:

```bash
npm install
```

## Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

A variável `NEXT_PUBLIC_API_URL` deve apontar para a URL onde a API do backend está sendo executada.

## Executando o projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Por padrão, o frontend estará disponível em:

```text
http://localhost:3000
```

Abra o endereço no navegador.

## Estrutura básica

```text
frontend/
├── app/
│   ├── cadastro/
│   ├── login/
│   └── ...
├── public/
├── .env.local
├── package.json
├── package-lock.json
└── README.md
```

## Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

### Build

```bash
npm run build
```

Gera a versão de produção da aplicação.

### Produção

Após executar o build:

```bash
npm start
```

## Integração com o Backend

O frontend realiza requisições HTTP para a API desenvolvida em FastAPI.

Por padrão:

```text
Frontend
http://localhost:3000
       │
       │ HTTP
       ▼
Backend
http://localhost:8000
```

Certifique-se de que o backend esteja executando antes de utilizar funcionalidades que dependem da API.

## Problemas comuns

### Erro ao instalar dependências

Remova `node_modules` e o arquivo de lock e instale novamente:

```bash
rm -rf node_modules
npm install
```

No Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### API não responde

Verifique se o backend está executando:

```text
http://localhost:8000
```

Também confira a variável:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Equipe

Projeto acadêmico de desenvolvimento de uma aplicação de e-commerce.
