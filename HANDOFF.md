# HANDOFF — Santioh site

## Estado (26/09/2026)
- Site completo: home, listagem (/produtos com filtros Lançamentos e Best Sellers), página de produto, sacola em gaveta, checkout Shopify, políticas da loja, sitemap, robots, OG.
- Canal Headless instalado na loja; token público salvo no Railway.
- A loja ainda não tem produtos publicados: o site mostra o estado "Os novos modelos chegam em breve".

## Pendências
1. DDF precisa publicar os produtos também na publicação "Headless" (senão a Storefront API não enxerga).
2. Domínio santioh.com.br ainda aponta para a loja Shopify antiga (fora do ar): apontar o DNS para o Railway.
3. Região do serviço no Railway está em Singapura; mover para US East reduz a latência para o Brasil.
4. Quando houver produtos com tags `Magnifico`, `Gipsy`, `Voltage` no handle/título, os reels da home passam a linkar para eles.
