# ETAPA 1: Construcción (Build)
# Utilizamos una imagen base con el JDK completo para poder compilar
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar el caché de capas de Docker
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Descargamos las dependencias de Maven (esto ahorra tiempo en futuras compilaciones si el pom.xml no cambia)
RUN ./mvnw dependency:go-offline

# Copiamos el código fuente real
COPY src ./src

# Compilamos el proyecto omitiendo los tests para acelerar la creación de la imagen
RUN ./mvnw clean package -DskipTests

# ETAPA 2: Ejecución (Run)
# Utilizamos una imagen mucho más ligera solo con el JRE
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Extraemos ÚNICAMENTE el ejecutable generado en la ETAPA 1
COPY --from=builder /app/target/Restaurants-0.0.1-SNAPSHOT.jar app.jar

# ¡NUEVA CONFIGURACIÓN DE NEW RELIC (Versión 8 Estable)!
# Instalamos wget, descargamos el agente versión 8.11.0 y limpiamos la herramienta para reducir espacio
RUN apk add --no-cache wget && \
    mkdir -p /app/newrelic && \
    wget -O /app/newrelic/newrelic.jar https://download.newrelic.com/newrelic/java-agent/newrelic-agent/8.11.0/newrelic-agent-8.11.0.jar && \
    apk del wget

# Documentamos el puerto que expone el servicio internamente
EXPOSE 8080

# Comando inmutable de arranque del sistema incluyendo el agente de New Relic
# Comando de arranque que inyecta las variables directamente a la JVM
ENTRYPOINT ["sh", "-c", "java -javaagent:/app/newrelic/newrelic.jar -Dnewrelic.config.license_key=$NEW_RELIC_LICENSE_KEY -Dnewrelic.config.app_name=$NEW_RELIC_APP_NAME -jar app.jar"]