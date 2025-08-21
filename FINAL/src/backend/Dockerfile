# Sử dụng image Maven để build project
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy toàn bộ source code vào container
COPY . .

# Cấp quyền thực thi cho mvnw (nếu có)
RUN chmod +x mvnw

# Build project, tạo file JAR (dùng wrapper nếu có, nếu không thì mvn clean package)
RUN ./mvnw clean package -DskipTests

# ----------------------------

# Sử dụng image Java nhẹ để chạy ứng dụng
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy file JAR từ stage build sang
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Expose port (Render/Railway sẽ tự động set biến PORT)
EXPOSE 8080

# Lệnh chạy ứng dụng, lấy PORT từ biến môi trường nếu có
ENTRYPOINT ["sh", "-c", "java -Xmx256m -Xms128m -jar app.jar --server.port=${PORT:-8080}"]