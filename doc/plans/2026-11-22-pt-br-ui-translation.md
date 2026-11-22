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

- Análise das alternativas `ancora-auto` e `MaxPaperclipPlugin` concluída. Vamos reaproveitar as traduções compatíveis como memória de tradução, revisar cada frase no contexto atual e manter a integração nativa via i18next.
  - `ancora-auto` tem 299 pares no catálogo `ui/src/lib/i18n.ts`; o repositório declara MIT.
  - `MaxPaperclipPlugin` tem 2.554 pares no dicionário atual; o `package.json` declara MIT e o autor como MaxVue contributors. O mecanismo DOM e as permissões do plugin não serão incorporados.
  - Frases curtas aproveitadas do dicionário do Max estão registradas em `ui/src/i18n/THIRD_PARTY_NOTICES.md` junto com o aviso MIT.
  - Correspondências literais são pistas para revisão, não prova de que a string é texto visível ou de que a tradução serve sem ajuste.
- Lote atual: roster de agentes nas variantes clássica e simplificada, filtros compartilhados e estados/labels.
  - [x] Traduzir toolbar, filtros, lista em lote, status e badges de ciclo de vida.
  - [x] Traduzir estados vazios, ações, hierarquia, acessibilidade e informações de ambiente nas variantes clássica e simplificada.
  - [x] Manter chaves e plurais compatíveis nos catálogos `en` e `pt-BR`.
  - [x] Validar catálogos e tipos da UI.
- Criação de agente em andamento:
  - [x] Traduzir a tela principal de setup, etapas, confirmação, campos do provedor e validações locais.
  - [x] Traduzir dicas de login e mensagens de fallback do próprio fluxo.
  - [x] Traduzir o diálogo inicial de nome e escolha de adaptador, reaproveitando frases da memória MIT.
  - [x] Traduzir a tela de conexão, credenciais salvas e controles compartilhados de login.
  - [x] Traduzir as mensagens do painel OAuth herdado de `AgentConfigForm`, incluindo login, associação de conta, expiração e conexão insegura.
  - [ ] Concluir a tradução de `AgentConfigForm`.
    - [x] Traduzir as dicas de ajuda do formulário, identidade, ambiente e seção de executor.
    - [x] Preservar placeholders de templates dentro das dicas e placeholders de interpolação i18next.
    - [x] Traduzir opções avançadas, políticas de execução, estados do seletor de modelos e depuração.
    - [x] Traduzir o campo compartilhado de arquivo de instruções e a janela de seleção de caminho para macOS, Windows e Linux.
    - [ ] Traduzir os campos específicos dos adaptadores e revisar todas as ações restantes do formulário.
    - [x] Traduzir o painel OAuth embutido, estados de autenticação e resultados do teste do ambiente.
    - [ ] Revisar os fluxos completos de conexão e os campos específicos dos adaptadores.
  - [ ] Validar visualmente a criação em pt-BR.
- Próximo depois da criação: telas de detalhes, abas, ferramentas, skills, histórico e custos do agente.
