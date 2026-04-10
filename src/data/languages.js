// LANGUAGES.JS — Universal Language Support Recipes
export const languages = {
  id:'languages',title:'Universal Language Support',icon:'🌍',
  subtitle:'Docker is language-agnostic. If it runs on an OS, it runs in Docker.',
  tags:['universal','recipes','java','rust','dotnet','php','ruby','python','go'],
  meta:['📖 20 min','🟢 All Levels'],
  sections:[
    {
      id:'agnostic-principle',title:'The Language-Agnostic Principle',
      content:`<p>Often, beginners ask: "Does Docker support my language?"</p>
      <p>The answer is always <strong>YES</strong>. Docker doesn't care about your code; it cares about the <strong>runtime environment</strong>. If your language can run on Linux or Windows, it can run in Docker.</p>
      <p>Docker acts as a universal package manager and runtime. You provide the instructions (Dockerfile) to set up the environment, and Docker handles the execution.</p>`,
      alerts:[{type:'tip',title:'Rule of thumb',text:'If you can run your app in a terminal on your laptop, you can containerize it.'}],
      keyTakeaways:['Docker supports 100% of major programming languages','You just need the right base image','The container behaves the same regardless of what is inside']
    },
    {
      id:'compilation-patterns',title:'Compilation Patterns',
      content:`<p>Most languages fall into two categories when containerizing:</p>`,
      comparisonTable:{
        headers:['Pattern','Description','Languages'],
        rows:[
          ['Interpreted','Copy source code, install deps, run','Python, Node.js, Ruby, PHP'],
          ['Compiled','Build binary in builder stage, copy only binary to final stage','Go, Rust, C++, Java, .NET']
        ]
      },
      keyTakeaways:['Interpreted languages need the source and runtime','Compiled languages only need the final binary and shared libs','Multi-stage builds are critical for compiled languages']
    },
    {
      id:'language-recipes',title:'Popular Language Recipes (2026 Standards)',
      content:'<p>Quick-start templates for different stacks. All versions are updated to latest April 2026 standards.</p>',
      subsections:[
        {
          title:'Python (FastAPI / Flask)',
          codeExamples:[{language:'dockerfile',title:'Python Dockerfile',code:`FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0"]`,explanation:'Using -slim image saves ~800MB vs full Python image. --no-cache-dir reduces layer size.'}]
        },
        {
          title:'Go (Fiber / Gin / Standard)',
          codeExamples:[{language:'dockerfile',title:'Go Dockerfile',code:`# Build stage
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Run stage
FROM scratch
COPY --from=builder /app/main /main
ENTRYPOINT ["/main"]`,explanation:'Uses "scratch" (the empty image). The final image size is just the size of your binary (~15-30MB).'}]
        },
        {
          title:'Java (Spring Boot / Maven)',
          codeExamples:[{language:'dockerfile',title:'Java Dockerfile',code:`# Build stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,explanation:'Eclipse Temurin is the community-standard OpenJDK distribution.'}]
        },
        {
          title:'Rust (High Performance)',
          codeExamples:[{language:'dockerfile',title:'Rust Dockerfile',code:`# Build stage
FROM rust:1.85-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Run stage
FROM gcr.io/distroless/cc-debian12
COPY --from=builder /app/target/release/myapp /myapp
ENTRYPOINT ["/myapp"]`,explanation:'Distroless images contain zero shell tools, making them extremely secure.'}]
        },
        {
          title:'.NET (ASP.NET Core)',
          codeExamples:[{language:'dockerfile',title:'dotnet Dockerfile',code:`# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "App.dll"]`,explanation:'Microsoft provides officially optimized Alpine images for .NET Runtime.'}]
        },
        {
          title:'C++ (CMake)',
          codeExamples:[{language:'dockerfile',title:'C++ Dockerfile',code:`# Build stage
FROM gcc:14 AS builder
RUN apt-get update && apt-get install -y cmake
WORKDIR /app
COPY . .
RUN cmake . && make

# Run stage
FROM debian:bookworm-slim
COPY --from=builder /app/my_app /usr/local/bin/
ENTRYPOINT ["my_app"]`,explanation:'C++ requires building with GCC/Clang and copying the binary to a clean base.'}]
        },
        {
          title:'PHP (Laravel / FPM)',
          codeExamples:[{language:'dockerfile',title:'PHP Dockerfile',code:`FROM php:8.4-fpm-alpine
RUN docker-php-ext-install pdo pdo_mysql
COPY . /var/www/html/
USER www-data`,explanation:'FPM version is standard for pairing with Nginx/Caddy.'}]
        }
      ]
    },
    {
      id:'tag-naming',title:'Understanding Tag Naming',
      content:`<p>Image tags often tell you about the OS environment inside:</p>`,
      comparisonTable:{
        headers:['Tag Suffix','OS / Environment','Best For'],
        rows:[
          [':latest','Default / Full OS','Quick testing only'],
          [':alpine','Alpine Linux (~5MB)','Production (Smallest)'],
          [':slim','Debian/Ubuntu stripped down','Compatibility + Small size'],
          [':windowsservercore','Windows Server Core','Legacy Windows apps'],
          [':nanoserver','Ultra-light Windows','Modern .NET Windows containers']
        ]
      }
    },
    {
      id:'base-image-lookup',title:'Where to find your language?',
      content:`<p>If your language isn't listed above, follow these steps:</p>
      <ol>
        <li>Go to <strong><a href="https://hub.docker.com" target="_blank">Docker Hub</a></strong></li>
        <li>Search for your language (e.g., "Haskell", "Elixir", "Zig")</li>
        <li>Look for the <strong>Official Image</strong> badge (it looks like a checkmark)</li>
        <li>Check the "Supported tags" section for the version you need.</li>
      </ol>`,
      images:[{url:'https://docs.docker.com/scout/images/dockerify.png',alt:'Docker Hub Search',caption:'Always look for the Official Image badge on Docker Hub'}]
    }
  ]
};
