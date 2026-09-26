# Santioh — site

Loja headless da Santioh: Next.js 16 + Shopify Storefront API (loja `fccd20-js.myshopify.com`), publicada no Railway (projeto "Santioh", serviço `santioh`).

- Catálogo, variantes e carrinho vêm da Storefront API. O pagamento acontece no checkout da Shopify (`cart.checkoutUrl`).
- Os produtos são publicados na Shopify pela DDF. Este site só lê a Shopify e não escreve na DDF.
- Visual segue o brand book Santioh (preto, cinza e branco; o óculos é a estrela).

## Variáveis de ambiente

| Nome | Exemplo |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `fccd20-js.myshopify.com` |
| `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` | token público do canal Headless |
| `SHOPIFY_API_VERSION` | `2026-07` |
| `NEXT_PUBLIC_SITE_URL` | `https://santioh.com.br` (opcional; usado em SEO) |

## Rodar localmente

```bash
npm install
SHOPIFY_MOCK=1 SHOPIFY_STORE_DOMAIN=x SHOPIFY_STOREFRONT_PUBLIC_TOKEN=x npm run dev   # catálogo de exemplo (fotos em public/mock, fora do git)
npm run build && npm start                                                            # com a Shopify de verdade
```

`/api/health` diz se a Shopify está conectada e se há produtos publicados.

## Regras do catálogo

- Selos: tag `Lançamento` ou `Best Seller` no produto (um por produto).
- Opção de cor: chamada `Cor`. Use o swatch da Shopify (cor ou imagem) quando existir; senão o site usa a foto da variante.
- Fotos 4:5, fundo cinza de estúdio; a 1ª foto é a 3/4 e a 2ª a frontal (aparece ao passar o mouse).
- Vídeos do produto na Shopify aparecem na seção "No rosto" da página do produto.
- O produto precisa estar publicado no canal **Headless** para aparecer aqui.
