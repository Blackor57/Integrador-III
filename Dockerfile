# ETAPA 1: Construcción (Build) - Se queda exactamente igual (¡Perfecta!)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ETAPA 2: Ejecución (Run) - Aquí añadimos New Relic
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 1. Copiamos el .jar compilado desde la etapa anterior
COPY --from=builder /app/target/Restaurants-0.0.1-SNAPSHOT.jar app.jar

# 2. Instalamos 'wget' temporalmente para descargar el agente de New Relic
# Las imágenes alpine vienen sin herramientas de red por defecto
RUN apk add --no-cache wget && \
    mkdir -p /app/newrelic && \
    wget -O /app/newrelic/newrelic.jar https://download.newrelic.com/newrelic/java-agent/newrelic-agent/current/newrelic.jar && \
    apk del wget # Borramos wget para mantener la imagen ultra ligera

EXPOSE 8080

# 3. Modificamos el ENTRYPOINT para activar el agente (-javaagent)
ENTRYPOINT ["java", "-javaagent:/app/newrelic/newrelic.jar", "-jar", "app.jar"]