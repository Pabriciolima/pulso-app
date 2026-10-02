# Pulso para Android

Android 8.0 ou superior com Android System WebView atualizado. Aplicativo pessoal gratuito com os arquivos web incluídos no APK e conexão HTTPS com o mesmo diário do site. Requer internet para consultar e confirmar alterações. Não migra, duplica ou apaga o banco. Mantém sincronização e retenção de 60 dias. Não há cadastro nem código de vínculo; o acesso aberto ao diário foi autorizado pelo proprietário.

## Android Studio

Clone o repositório completo `Pabriciolima/pulso-app` e abra a pasta `android`. Aguarde a sincronização Gradle. Instale SDK 35 quando o Studio solicitar. Execute pelo botão Run ou gere APK em Build. Gradle 8.9, Android Gradle Plugin 8.7.3 e JDK 17. O wrapper inclui verificação SHA256 da distribuição. A tarefa `syncWeb` copia os arquivos do site da raiz do repositório antes da compilação.

O APK disponibilizado é uma compilação release assinada. O pacote é `com.pabriciolima.pulso`, versão 1.0.0, código 1. Para atualizações, mantenha a mesma chave de assinatura e aumente `versionCode`. O backup privado da chave é entregue separadamente; nunca publique esse backup ou `signing.properties` no GitHub. Para compilar release com a mesma assinatura, copie `pulso-release.jks` e `signing.properties` desse backup para esta pasta e execute `./gradlew assembleRelease` (Windows: `gradlew.bat assembleRelease`). O APK estará em `app/build/outputs/apk/release/`.

## Recursos nativos

Ícone de coelhinho, tela adaptada às barras do Android, teclado numérico, exportação CSV pelo seletor de arquivos, relatório pelo sistema de impressão/Salvar como PDF, botão Voltar que fecha o menu e confirma a saída. Permissão apenas de internet, sem acesso geral ao armazenamento, câmera ou localização. Assets locais em origem HTTPS reservada; conteúdo externo abre fora do WebView. Erros SSL são bloqueados. Chave secreta do servidor e dados de pacientes não entram no APK.

## Verificação

Compilação Java/resources/dex, alinhamento do APK e validação de assinatura Android. Testes do módulo de alertas e validação. Consulta somente leitura ao mesmo backend usando a origem HTTPS do app, sem alterar registros. Não foi executado em aparelho físico ou emulador nesta sessão; instalação, teclado e impressão devem ser conferidos no aparelho.
