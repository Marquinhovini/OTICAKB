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
