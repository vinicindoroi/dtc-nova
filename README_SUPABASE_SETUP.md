# 🚀 Configuração do Supabase - CORRIGIDA

## 📋 Passos para Configurar o Supabase

### 1. Conectar ao Supabase
1. Clique no botão **"Connect to Supabase"** no canto superior direito do Bolt
2. Faça login na sua conta Supabase
3. Crie um novo projeto ou selecione um existente
4. As variáveis de ambiente serão configuradas automaticamente

### 2. Executar Migração CORRIGIDA
Após conectar ao Supabase, a nova migração será aplicada automaticamente:

```sql
-- A migração 20250105120000_fix_analytics_table.sql irá:
-- 1. Remover tabela existente (se houver conflitos)
-- 2. Criar tabela vsl_analytics com estrutura correta
-- 3. Configurar RLS e políticas
-- 4. Criar índices para performance
```

### 3. Verificar Configuração
- ✅ Tabela `vsl_analytics` criada sem erros
- ✅ Políticas RLS configuradas corretamente
- ✅ Índices criados para performance
- ✅ Constraints de validação aplicadas
- ✅ Permissões concedidas para anon e authenticated

## 🔐 Credenciais de Admin

### Login do Dashboard Admin
- **URL**: `/admin`
- **Email**: `admin@magicbluedrops.com`
- **Senha**: `gotinhaazul`

## 📊 Estrutura da Tabela Analytics (CORRIGIDA)

```sql
vsl_analytics:
- id (uuid) - Chave primária
- session_id (text) - ID único da sessão
- event_type (text) - Tipo do evento (com constraint)
- event_data (jsonb) - Dados adicionais do evento
- timestamp (timestamptz) - Quando o evento ocorreu
- created_at (timestamptz) - Quando foi criado
- ip (text) - IP do visitante
- country_code (text) - Código do país (BR, US, etc)
- country_name (text) - Nome do país
- city (text) - Cidade do visitante
- region (text) - Estado/região
- last_ping (timestamptz) - Último ping (usuários ativos)
- vturb_loaded (boolean) - Se o VTurb carregou
```

## 🎯 Eventos Trackados

1. **page_enter** - Usuário entra na página
2. **video_play** - VTurb carrega com sucesso
3. **video_progress** - Progresso no tempo de página
4. **pitch_reached** - Usuário atinge 35min55s na página
5. **offer_click** - Clique em ofertas de produto
6. **page_exit** - Usuário sai da página

## 🌍 Filtros Geográficos

- ❌ **IPs brasileiros são EXCLUÍDOS** automaticamente
- ✅ Apenas tráfego internacional é contabilizado
- 🔄 Detecção automática via múltiplas APIs de geolocalização

## 🔧 Funcionalidades Especiais

### Live Users
- Atualização a cada 30 segundos
- Usuários ativos nos últimos 2 minutos
- Breakdown por país em tempo real

### Circuit Breakers
- Proteção contra falhas em cascata
- Fallbacks automáticos para APIs
- Monitoramento de saúde dos serviços

## 🚨 Troubleshooting

### ✅ PROBLEMAS CORRIGIDOS:
1. **Constraint já existe** - Resolvido com DROP TABLE IF EXISTS
2. **Política já existe** - Resolvido com DROP POLICY IF EXISTS
3. **Syntax error** - Corrigido usando CHECK inline em vez de ADD CONSTRAINT
4. **Permissões** - Adicionadas permissões USAGE no schema

### Se o tracking não funcionar:
1. Verifique as variáveis de ambiente no `.env`
2. Teste a conexão no painel de Tracking
3. Verifique o console do navegador para erros
4. Confirme que as políticas RLS estão ativas

### Se o admin não conseguir logar:
1. Confirme as credenciais: `admin@magicbluedrops.com` / `gotinhaazul`
2. Limpe o sessionStorage do navegador
3. Tente em uma aba anônima

### Se os dados não aparecerem:
1. Verifique se a migração foi executada
2. Confirme que a tabela `vsl_analytics` existe
3. Teste inserção manual via SQL Editor
4. Verifique filtros de país (Brasil é excluído)

## 📞 Suporte

Se houver problemas na configuração:
1. Verifique os logs do console
2. Teste cada componente individualmente
3. Use o painel de Tracking Test no admin
4. Confirme que todas as migrações foram aplicadas

---

**✅ Após seguir estes passos, todo o sistema de analytics estará funcionando no Supabase!**

## 🔄 Mudanças na Correção

### O que foi corrigido:
1. **Migração limpa**: Remove tabela existente antes de recriar
2. **Constraint inline**: Usa CHECK inline em vez de ADD CONSTRAINT
3. **Políticas seguras**: Remove políticas existentes antes de recriar
4. **Permissões completas**: Adiciona USAGE no schema
5. **Melhor logging**: Logs mais detalhados para debug
6. **Retry logic**: Sistema de retry para operações do banco
7. **Validação de URL**: Verifica formato da URL do Supabase
8. **Teste automático**: Testa conexão automaticamente na inicialização