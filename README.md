# MooSPA

Demo de produto da estação automatizada ECV-01, com React, TypeScript e Vite. Mobile-first, em português, com dados fictícios e estado somente na memória da aba. Não usa backend, banco de dados, cookies ou localStorage.

- **Demo:** https://marciamateuspastore-boop.github.io/MooSPA/
- **Repositório:** https://github.com/marciamateuspastore-boop/MooSPA

## Rodar localmente

No Windows, dê dois cliques em **Iniciar-MooSPA.cmd** e abra o endereço mostrado no terminal. O atalho procura pnpm, o runtime local do Codex ou npm. Mantenha a janela aberta enquanto explora.

Use Node.js 24 e pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

```sh
pnpm test       # regras da simulação
pnpm build     # TypeScript + produção em dist/
pnpm preview   # servir o build de produção
```

Também é possível usar `npm install` e os mesmos scripts com `npm run`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie esta pasta, incluindo `.github/workflows/deploy.yml` e `pnpm-lock.yaml`, para a branch `main` ou `master`.
2. No repositório, abra **Settings → Pages → Build and deployment → Source** e selecione **GitHub Actions**.
3. Abra **Actions → Deploy MooSPA to GitHub Pages** e execute **Run workflow** se necessário.
4. A execução publica `dist/` e mostra o endereço final na etapa `deploy`.

O `base: './'` do Vite permite publicar na raiz ou em `https://usuario.github.io/nome-do-repositorio/`. A navegação interna usa estado React e não depende de rotas no servidor. Os recursos visuais e as fontes são servidos junto do site.

Neste repositório, a publicação usa GitHub Actions. Novos pushes para `main` executam os testes, geram o build e atualizam o GitHub Pages automaticamente.

## O que explorar

- Visão geral, períodos de indicadores e gráfico interativo.
- Estação: ciclo acelerado de identificação, validação, escovação, lavagem, ventilação e saída.
- Cenários de RFID ausente, ocupação ambígua, pausa e interrupção.
- Rebanho com busca, filtros e ficha individual.
- Agenda com inclusão, conclusão e reabertura de cuidados.
- Relatórios e exportação CSV do histórico de hoje.
- Notificações e reinício da demonstração.

## Escopo da demonstração

Baseado no PDF `Projeto_Estacao_Automatizada_Vacas_Leiteiras_10_paginas.pdf` fornecido pelo solicitante. O projeto físico é conceitual. A interface não representa equipamento construído, desempenho medido ou liberação técnica.

A data da fazenda é fixa em 14/10/2026. Animais, operador e registros são fictícios. As mudanças são perdidas ao recarregar. A lavagem é consumida ao entrar na etapa correspondente, inclusive quando a passagem é interrompida depois. Outra passagem do mesmo animal não repete a lavagem. O módulo veterinário é apenas informativo; não há seleção de produto, dose ou aplicação.

Os totais de sete e trinta dias são cenários ilustrativos. O gráfico de hoje adiciona as novas passagens concluídas às 10h, horário da sessão simulada. A lista de histórico é um recorte inicial mais os ciclos realizados na sessão; não contém todos os registros agregados dos indicadores. Lavagens interrompidas ficam em revisão, sem liberar nova lavagem e sem contar como higienização concluída.

## Estrutura

- `src/App.tsx`: estado da sessão, navegação, regras de interação e modais.
- `src/pages.tsx`: as cinco áreas da experiência.
- `src/ui.tsx`: componentes compartilhados.
- `src/model.ts`: dados fictícios, guardas do ciclo e exportação CSV.
- `src/styles.css`: design responsivo, navegação mobile e acessibilidade.
- `src/model.test.ts`: verificação das regras centrais do ciclo.

## Créditos visuais

- Ilustração conceitual da ECV-01 extraída do PDF fornecido pelo solicitante.
- Fotografia do pasto: [Kevin Luke / Unsplash](https://unsplash.com/photos/a-herd-of-cows-grazing-on-a-lush-green-field-r3vVsK4kCAY).
- Fontes: DM Sans e Manrope, distribuídas localmente via Fontsource (SIL OFL).
- Ícones: Lucide (ISC). Marca MooSPA e avatares vetoriais criados para esta demo.
