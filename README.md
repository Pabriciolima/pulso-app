# Pulso 💜
Diário de pressão em português, HTML/CSS/JavaScript, sem build. Visual carinhoso com a coelhinha Lili; manhã/tarde/noite, sintomas, histórico, gráfico, edição, exclusão, CSV e impressão/PDF.

## Entrada direta sem cadastro
Os campos ficam na tela inicial, com orientações durante a digitação. Cada navegador gera automaticamente uma chave aleatória e provisiona seu próprio diário no banco existente, sem dados de outros aparelhos. A chave fica no armazenamento do navegador; apagar os dados do navegador pode perder o acesso. Registros anteriores do diário original são preservados e não transferidos automaticamente. O endpoint start limita novas criações a 20 por minuto no total.

## Compatibilidade com acesso anterior
Um link pessoal contém uma chave aleatória de 256 bits no fragmento da URL. O navegador lembra a chave localmente. A chave nunca é incluída no repositório, nem enviada no endereço HTTP. A função Supabase `pulso-diary` recebe a chave num cabeçalho, verifica seu SHA-256 e restringe todas as operações ao diário correspondente. Quem possui o link pode ler e modificar esse diário. Não compartilhar publicamente.

A função usa a chave de serviço apenas no servidor. A tabela de diários não é acessível a `anon` ou `authenticated`; RLS das medições continua ativa. Acesso sem link é recusado. Sem cache local de medições. Internet obrigatória, salvamento confirmado somente após resposta do servidor. Não modifica configurações Auth de outros aplicativos.

## Infraestrutura
Reutiliza o Supabase existente Champion Team SaaS. Nenhum projeto novo ou serviço pago contratado. GitHub `Pabriciolima/pulso-app`, branch main; publicação estática na Vercel via integração Git. Chave publicável em config.js; nenhuma chave de serviço no cliente.

`schema.sql` documenta a instalação original com contas. `private-link.sql` documenta a migração para diários privados sem cadastro; não executar novamente a instalação antiga em produção. A chave pessoal é provisionada separadamente por administrador, usando apenas seu hash no banco.

## Retenção
Cada medição fica disponível por 60 dias desde `created_at`, definido no servidor. A API oculta expirados e o cron `pulso_retention_60_days` executa a limpeza no minuto 17 de cada hora. Editar não renova o prazo. A rotina não altera backups administrados pelo provedor.

## Segurança clínica
Sintomas de alarme têm prioridade sobre os números. Pressão/dor forte no peito, falta de ar, desmaio, dor de cabeça súbita intensa, alterações de visão/fala ou fraqueza levam à orientação de atendimento imediato. Pressão ≥180 sistólica ou ≥120 diastólica sem alarme: repetir após pelo menos um minuto e contatar imediatamente a equipe se persistir. Sem diagnóstico, prescrição ou recomendação de dose extra. Gestação/pós-parto exige avaliação específica. Orientações com links AHA e CDC no app.

## Verificação
`node tests/safety.test.mjs`: 14 verificações de alertas e validação. API testada com dados sintéticos: chave ausente/inválida recusada, validação, salvar/ler/editar/excluir e tentativa de exclusão de ID alheio. Dados sintéticos removidos após teste. Sem notificações automáticas; os períodos são atalhos, não uma meta clínica.

## Sincronização entre dispositivos
No menu Meu diário e dados, gere um código no aparelho com o histórico e digite no outro. Código aleatório de 72 bits, uso único e validade de 10 minutos. Apenas hashes no banco. Aparelhos vinculados usam o mesmo diary_id; autoatualização a cada 30 segundos com página visível, ao recuperar foco, voltar online e reabrir. Requer internet; não é atualização instantânea em segundo plano. Diário anterior do aparelho fica preservado sem transferência automática. Chaves de dispositivo e códigos usam RLS, sem acesso público.
