# OCA Arquitetos — Site institucional

Site estático em **HTML/CSS/JS** com integração opcional ao **Supabase** para
gestão de portfólio, configurações e quiz.

## Como abrir

Basta abrir `index.html` em um navegador moderno ou servir a pasta
`oca_admin/` por qualquer servidor estático (ex.: `python -m http.server`).

A área administrativa fica em `login.html` → `admin.html`. As credenciais e
chaves públicas vivem em `supabase-config.js` e **não foram alteradas**.

## Estrutura

```
oca_admin/
├── index.html          Site público
├── style.css           Estilos (claro + escuro)
├── script.js           Lógica do site, portfólio e formulário
├── login.html          Login do painel
├── admin.html          Painel administrativo
├── admin.js            Lógica do painel
├── supabase-config.js  Chave pública e URL do Supabase
└── assets/
    ├── images/
    └── videos/         (vazio — vídeos podem ser adicionados pelo admin)
```

## Portfólio

- Cada projeto pode ter **status** (Concluído / Em andamento), **categoria**
  (Residencial, Comercial, Interiores, Reforma, Retrofit, Visualização),
  imagem principal, galeria, vídeo, antes/depois, local, ano, área,
  desafio, solução e resultado.
- Os filtros na home funcionam em três eixos: **status**, **tipo** e **mídia**
  (com vídeo / antes-depois).
- O clique em um card abre o **modal de detalhes** com galeria, vídeo,
  slider antes/depois e CTA do WhatsApp pré-preenchido com o nome do
  projeto.
- Campos opcionais só aparecem quando preenchidos; os projetos existentes
  continuam funcionando normalmente.

### Suporte a vídeo

Cada projeto pode informar uma URL ou caminho local (`assets/videos/...`)
no campo "Vídeo" do admin. O vídeo aparece no modal de detalhes, com
controles, sem autoplay com áudio.

### Suporte a Antes/Depois

Basta preencher os campos "Imagem Antes" e "Imagem Depois" no admin.
Quando ambos existem, o site mostra um **slider comparador** dentro do
modal de projeto, com rótulos "Antes" e "Depois" e suporte ao toque.

## Formulário de WhatsApp

A seção **Solicitar orçamento** (`#orcamento`) é um briefing rápido que
gera uma mensagem organizada e abre o WhatsApp da OCA Arquitetos. Não
depende de backend.

## Sobre Olavo

A seção `#olavo` apresenta Olavo Henrique de Almeida Canarim com foto e
chips com as credenciais (Mestre, Pós em IA, Pós em Sustentabilidade,
Graduado em Arquitetura e Urbanismo).

## Supabase — colunas opcionais do portfólio

A tabela `projects` continua funcionando com o esquema original. Para
aproveitar as novas funcionalidades de portfólio, adicione (quando quiser)
as seguintes colunas opcionais:

| Coluna           | Tipo            | Uso                          |
|------------------|-----------------|------------------------------|
| `status`         | `text`          | `concluido` / `andamento`    |
| `location`       | `text`          | Cidade/estado                |
| `year`           | `text`          | Ano do projeto               |
| `area`           | `text`          | Área (ex.: "120 m²")         |
| `challenge`      | `text`          | Desafio do projeto           |
| `solution`       | `text`          | Solução adotada              |
| `result`         | `text`          | Resultado obtido             |
| `gallery_images` | `text[]`        | Galeria de imagens           |
| `video_url`      | `text`          | URL ou caminho local         |
| `before_image`   | `text`          | Imagem "antes"               |
| `after_image`    | `text`          | Imagem "depois"              |

Se alguma coluna ainda não existir, o painel **detecta e reenvia o
projeto sem o campo** automaticamente — nada quebra.

## Acessibilidade

- Modal com `role="dialog"`, fecha por **Esc**, clique fora e botão
  dedicado, com retorno de foco ao elemento que abriu.
- Filtros são `<button>` reais, com rolagem horizontal em telas pequenas.
- Slider antes/depois é controlado por `<input type="range">` (teclado +
  toque + mouse).
- `prefers-reduced-motion` é respeitado nas animações do modal.

## O que mudou nesta versão

- ❌ Removido o chatbot (não estava mais em uso).
- ❌ Removido o vídeo de apresentação fixo — pode ser adicionado pelo admin futuramente.
- ✅ Portfólio com status, categorias ampliadas e filtros multi-eixo.
- ✅ Modal de projeto premium com galeria, vídeo e antes/depois.
- ✅ Slider comparador antes/depois.
- ✅ Seção "Quem assina" com Olavo e suas credenciais.
- ✅ Briefing rápido → WhatsApp.
- ✅ Painel administrativo expandido com campos opcionais (backward-compatible).
