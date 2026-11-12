FROM node:22-alpine AS frontend
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /workspace/backend
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /workspace/frontend/dist ./src/main/resources/static
RUN mvn -q -DskipTests package \
    && set -- target/*.jar \
    && test "$#" -eq 1 \
    && jar tf "$1" | grep -q '^BOOT-INF/' \
    && cp "$1" /workspace/app.jar

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S matriz && adduser -S matriz -G matriz
WORKDIR /app
COPY --from=backend /workspace/app.jar app.jar
USER matriz
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
