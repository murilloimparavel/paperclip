# Tradução completa da interface para pt-BR

## Objetivo

Traduzir todas as superfícies de produto do Paperclip para português do Brasil usando a localização nativa do app. Preservar nomes próprios, conteúdo escrito por usuários, identificadores e termos técnicos que devam continuar em inglês.

## Checklist de cobertura

- [ ] Infraestrutura i18n: catálogos, idioma padrão, atributo `lang`, fallback, formatação, pluralização e validação de chaves/placeholders.
- [ ] Agentes: roster, filtros, hierarquia, criação, configuração, detalhes, abas, ferramentas, skills, histórico, custos, orçamento e ações.
- [ ] Tarefas e inbox: listas, filtros, estados, ações em lote, inbox, detalhe, comentários, chat, anexos, execuções, bloqueios e erros.
- [ ] Projetos e workspaces: listas, detalhes, configuração, orçamento e workspaces isolados/de execução.
- [ ] Organização do trabalho: dashboard, busca, metas, responsabilidades, decisões, aprovações, rotinas, atividade, auditoria, timeline, casos, status cards e artefatos.
- [ ] Administração: configurações de organização/instância, membros, convites, acesso, conexões, ambientes, importação/exportação, perfil e segredos/cofres.
- [ ] Integrações e ferramentas: apps/conectores, OAuth, chat, gateways, MCP, perfis, CLI, plugins e skills.
- [ ] Conta e entrada: login, onboarding, convites, pedidos de acesso, perfil e telas de erro/não encontrado.
- [ ] Componentes compartilhados: diálogos, menus, tooltips, toasts, banners, carregamento, estados vazios/erro/sucesso e acessibilidade.
- [ ] Superfícies alternativas: variantes `production`, layouts clássico/novo, responsividade e fluxos condicionais.
- [ ] Revisão final: busca por strings visíveis em inglês, revisão visual de rotas principais e validação de todos os catálogos.

## Processo

- Traduzir por fluxo e marcar cada área aqui após a implementação e validação.
- Criar commits pequenos por área concluída, sem mudanças não relacionadas.
- Manter `en.json` e `pt-BR.json` com a mesma estrutura e placeholders compatíveis.
- Validar cada lote de forma focada e revisar a interface renderizada em pt-BR.
- Fazer deploy somente depois da cobertura ampla, validação final e preparação do rollback.

## Andamento

- Análise das alternativas `ancora-auto` e `MaxPaperclipPlugin` concluída. A implementação seguirá o i18next nativo do fork; os outros projetos ficam como referência terminológica.
- Lote atual: roster de agentes nas variantes clássica e simplificada, filtros compartilhados e estados/labels.
  - [x] Traduzir toolbar, filtros, lista em lote, status e badges de ciclo de vida.
  - [x] Traduzir estados vazios, ações, hierarquia, acessibilidade e informações de ambiente nas variantes clássica e simplificada.
  - [x] Manter chaves e plurais compatíveis nos catálogos `en` e `pt-BR`.
  - [x] Validar catálogos e tipos da UI.
- Próximo lote: formulários de criação/configuração e telas de detalhes do agente.
