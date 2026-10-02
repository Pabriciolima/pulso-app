# Pulso 💜
Diário único de pressão, HTML/CSS/JS sem build. PC e celular acessam os mesmos registros automaticamente.

## Acesso aberto autorizado
Sem login, senha, link pessoal ou código. Qualquer pessoa que acessar o app pode consultar, editar e excluir os registros deste diário. O proprietário aceitou expressamente esse acesso em 02/10/2026. A função Edge restringe as operações ao diário unificado do Pulso; tabelas e outros aplicativos do projeto Supabase continuam protegidos por RLS. Chave de serviço somente no servidor.

## Sincronização
Trigger do Postgres envia evento de mudança via Supabase Realtime Broadcast. WebSocket recebe o evento e recarrega os registros confirmados pelo servidor. Inclui criação, edição e exclusão. Eventos contêm somente o tipo da operação, sem valores ou sintomas. Reconexão automática, atualização ao recuperar foco/conexão e fallback de 30 segundos quando WebSocket indisponível. Internet necessária; navegadores suspensos atualizam ao reabrir.

## Retenção e infraestrutura
Mesmo Supabase Champion Team SaaS, sem projeto novo ou contratação paga. Retenção de 60 dias desde created_at; editar não renova prazo. Limpeza horária. Dados originais de todos os diários do Pulso foram reunidos sem exclusão.

## Saúde
Alertas de sintomas têm prioridade sobre números. Sem diagnóstico ou prescrição. Fontes AHA e CDC no app. `node tests/safety.test.mjs`: 14 verificações.

## Publicação
GitHub Pabriciolima/pulso-app, main, Vercel estática Other sem build. Chave publicável no config.js, nenhuma chave secreta no cliente. Migrações SQL anteriores documentam a evolução; não reaplicar instalações antigas sobre produção.
