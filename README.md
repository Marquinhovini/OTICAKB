# Ótica KB — Site

Site estático (HTML + CSS + JS). Sem build, sem dependências.

## Estrutura

```
index.html      página principal
style.css       visual (tema claro/escuro, gradientes)
script.js       catálogo, filtros, WhatsApp, tema
products.js     ESTOQUE — edite aqui para adicionar/remover modelos
assets/         logo.png, hero.jpg e produtos/
```

## Como atualizar o estoque

1. Coloque a foto em `assets/produtos/` (ex: `retro-mel.jpg`).
2. Abra `products.js` e copie um bloco `{ ... }`, mudando nome, cor e `imagem`.
3. `estoque: false` marca como esgotado.
4. Faça commit/push no GitHub — o Render publica sozinho.

O número do WhatsApp fica em `products.js` (`KB_CONFIG.whatsapp`).

## Estoque pela planilha do Google (opcional, sem mexer em código)

1. Crie uma planilha com a primeira linha: `nome, categoria, cor, preco, estoque, destaque, imagem, medidas`.
   - `categoria`: grau ou sol · `estoque` e `destaque`: sim ou nao · `preco`: 129,90 (ou vazio)
   - `imagem`: caminho da foto (ex: `assets/produtos/modelo.jpg`)
2. Arquivo > Compartilhar > **Publicar na web** > formato **CSV**.
3. Cole o link em `products.js`, no campo `planilha`.
Se a planilha ficar fora do ar, o site usa a lista de `products.js`.

## Dicas de foto

Fotos quadradas (1:1) ou 4:5, com o óculos ocupando ~80% da imagem e o mesmo fundo claro em todas, ficam melhores no celular. Fotos muito largas (panorâmicas) aparecem inteiras, porém menores.

## Publicar

### GitHub
```bash
git init
git add .
git commit -m "Site Ótica KB"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/otica-kb.git
git push -u origin main
```

### Render (Static Site)
1. render.com → **New +** → **Static Site** → conecte o repositório.
2. **Build Command:** deixe vazio (ou `echo ok`)
3. **Publish Directory:** `.`
4. **Create Static Site**. Cada push atualiza o site.

Para testar localmente: `python3 -m http.server 8000` e abra http://localhost:8000
