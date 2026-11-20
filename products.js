/* =====================================================
   ESTOQUE DA ÓTICA KB
   -----------------------------------------------------
   Para adicionar, editar ou remover um modelo, mexa só
   neste arquivo. Cada item é um bloco { ... }.

   - id:        número único
   - nome:      nome do modelo
   - categoria: "grau" ou "sol"
   - cor:       cor principal (texto livre)
   - preco:     número (ex: 129.9) ou null para "Consulte o valor"
   - estoque:   true = disponível | false = esgotado
   - destaque:  true = aparece com selo "Novo"
   - imagem:    caminho da foto (ex: "assets/produtos/meu-modelo.jpg")
                Se a foto não existir, aparece um desenho no lugar.
   - tom:       cores do fundo do cartão [cor1, cor2]
   ===================================================== */

window.KB_CONFIG = {
  whatsapp: "5581991370415",
  instagram: "https://www.instagram.com/otica.kb",
  telefone: "(81) 99137-0415",
};

window.KB_PRODUTOS = [
  {
    id: 1,
    nome: "Gatinho Nude",
    categoria: "grau",
    cor: "Nude",
    preco: null,
    estoque: true,
    destaque: true,
    imagem: "assets/produtos/gatinho-nude.jpg",
    tom: ["#e9cfc9", "#b98f92"],
  },
  {
    id: 2,
    nome: "Gatinho Branco & Rosé",
    categoria: "grau",
    cor: "Branco / Rosé",
    preco: null,
    estoque: true,
    destaque: false,
    imagem: "assets/produtos/gatinho-branco.jpg",
    tom: ["#f5eef3", "#d9b5c4"],
  },
  {
    id: 3,
    nome: "Gatinho Vinho Mesclado",
    categoria: "grau",
    cor: "Vinho",
    preco: null,
    estoque: true,
    destaque: true,
    imagem: "assets/produtos/gatinho-vinho.jpg",
    tom: ["#c0505f", "#6e1c2e"],
  },
  /* ---- EXEMPLOS (troque pelas fotos reais em assets/produtos/) ---- */
  {
    id: 4,
    nome: "Retrô Mel",
    categoria: "sol",
    cor: "Mel degradê",
    preco: null,
    estoque: true,
    destaque: true,
    imagem: "assets/produtos/retro-mel.jpg",
    tom: ["#f1d9a0", "#c8963e"],
  },
  {
    id: 5,
    nome: "Retrô Tartaruga",
    categoria: "sol",
    cor: "Tartaruga",
    preco: null,
    estoque: true,
    destaque: false,
    imagem: "assets/produtos/retro-tartaruga.jpg",
    tom: ["#d79a55", "#7a4a1f"],
  },
  {
    id: 6,
    nome: "Retrô Preto Clássico",
    categoria: "sol",
    cor: "Preto",
    preco: null,
    estoque: false,
    destaque: false,
    imagem: "assets/produtos/retro-preto.jpg",
    tom: ["#4b4b57", "#14141a"],
  },
];
