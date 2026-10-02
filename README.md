# Pulso — Diário de pressão arterial

Aplicativo responsivo em HTML, CSS e JavaScript, sem etapa de build. Registros de manhã, tarde e noite; múltiplas medições; pulso e sintomas; edição e exclusão; gráficos por 7, 30, 90 dias e todo o histórico; filtros; exportação CSV e impressão/PDF.

## Estado desta entrega

Código implementado. **Ainda não publicado, sem banco configurado.** A prévia indica explicitamente que não salva dados. Nenhum dado real foi inserido.

## Configuração

1. Escolher um projeto Supabase específico com o proprietário. Executar `schema.sql` via migração. RLS limita leitura, criação, edição e exclusão ao dono do registro. `anon` não tem acesso à tabela.
2. Preencher `supabaseUrl` e `supabaseKey` em `config.js` usando somente a URL do projeto e a chave publicável. Nunca usar chave `service_role`.
3. Supabase Auth: habilitar e-mail/senha. Configurar SMTP, confirmação de e-mail e URLs de redirecionamento para o domínio publicado. Não desabilitar confirmação global em um projeto usado por outros apps. O cadastro não deve ser considerado validado até um teste com uma conta de teste controlada.
4. Criar repositório dedicado `pulso-diario-pressao` no GitHub. Enviar os arquivos. Não incluir informações de pacientes no repositório.
5. Importar o repositório na Vercel: framework **Other**, raiz do projeto esta pasta, sem comando de build. Publicar e verificar o domínio de produção.
6. Testar login, criação, atualização, exclusão, recarga e acesso em outro aparelho. Testar RLS com dois usuários e confirmar que um não lê nem modifica dados do outro. Excluir dados sintéticos de teste ao terminar.

## Acesso e limitações

A conta é individual. Use a mesma conta em outro aparelho para acessar o mesmo histórico. A sessão fica no armazenamento da aba (`sessionStorage`), e não há cache local de registros de saúde. Os dados só são considerados salvos depois da confirmação do servidor. Internet obrigatória. Não inclui notificações de horários: os três períodos são uma lista de acompanhamento do dia. O botão de relatório abre a impressão do navegador; selecione Salvar como PDF quando disponível.

## Segurança clínica

O app não diagnostica, não prescreve e não oferece doses extras. Alertas de sintomas de alarme têm prioridade sobre o valor numérico. Sistólica ≥180 **ou** diastólica ≥120 é tratada como valor muito alto; sem sintomas de alarme, orienta repetir após pelo menos 1 minuto e contatar imediatamente um profissional se persistir. Com sintomas de alarme, orienta emergência sem esperar nova leitura. Cuidados de estilo de vida são orientações gerais e não tratamento imediato.

Fontes: American Heart Association, páginas “When To Call 911 About High Blood Pressure” e “Home Blood Pressure Monitoring”, consultadas em 02/10/2026. Gestação e pós-parto exigem avaliação específica. Limites individuais devem ser estabelecidos pela equipe assistente.

## Verificação local

Sirva a pasta com um servidor HTTP estático. `safety.mjs` exporta as funções puras dos alertas e validação. Execute `node tests/safety.test.mjs` para verificar os ramos críticos. O envio de e-mail e a persistência entre aparelhos precisam de teste no ambiente configurado; não foram verificados nesta entrega sem banco.
