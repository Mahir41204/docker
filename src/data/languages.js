// LANGUAGES.JS — Universal Language Support Recipes
export const languages = {
  id:'languages',title:'Universal Language Support',icon:'🌍',
  subtitle:'Docker is language-agnostic. If it runs on an OS, it runs in Docker.',
  tags:['universal','recipes','java','rust','dotnet','php','ruby'],
  meta:['📖 15 min','🟢 All Levels'],
  sections:[
    {
      id:'agnostic-principle',title:'The Language-Agnostic Principle',
      content:`<p>Often, beginners ask: "Does Docker support my language?"</p>
      <p>The answer is always <strong>YES</strong>. Docker doesn't care about your code; it cares about the <strong>runtime environment</strong>. If your language can run on Linux or Windows, it can run in Docker.</p>`,
      alerts:[{type:'tip',title:'Rule of Thumb',text:'If you can run your app in a terminal on a laptop, you can containerize it.'}],
      keyTakeaways:['Docker supports 100% of major programming languages','You just need the right base image','The container behaves the same regardless of what is inside']
    },
    {
      id:'language-recipes',title:'Popular Language Recipes',
      content:'<p>Quick-start templates for different stacks. All versions are updated to 2026 standards.</p>',
      subsections:[
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
ENTRYPOINT ["java", "-jar", "app.jar"]`,explanation:'Uses multi-stage builds to keep the final image small by excluding Maven and source code.'}]
        },
        {
          title:'Rust (High Performance)',
          codeExamples:[{language:'dockerfile',title:'Rust Dockerfile',code:`# Build stage
FROM rust:1.76-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Run stage (Distroless for security)
FROM gcr.io/distroless/cc-debian12
COPY --from=builder /app/target/release/myapp /myapp
ENTRYPOINT ["/myapp"]`,explanation:'Rust binaries are self-contained. Using Distroless creates an incredibly small and secure image.'}]
        },
        {
          title:'.NET (ASP.NET Core)',
          codeExamples:[{language:'dockerfile',title:'dotnet Dockerfile',code:`# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

# Run stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "MyProxy.dll"]`,explanation:'Microsoft provides officially optimized Alpine-based images for .NET.'}]
        },
        {
          title:'PHP (Laravel / Apache)',
          codeExamples:[{language:'dockerfile',title:'PHP Dockerfile',code:`FROM php:8.3-apache
RUN docker-php-ext-install pdo pdo_mysql
COPY . /var/www/html/
RUN a2enmod rewrite`,explanation:'The official PHP image comes in many variants: Apache, FPM, or CLI.'}]
        },
        {
          title:'Ruby (Rails)',
          codeExamples:[{language:'dockerfile',title:'Ruby Dockerfile',code:`FROM ruby:3.3-alpine
RUN apk add --no-cache build-base postgresql-dev tzdata
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .
EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]`,explanation:'Alpine-based Ruby images require a few native dependencies for gems like pg.'}]
        }
      ]
    },
    {
      id:'base-image-lookup',title:'Where to find your language?',
      content:`<p>If your language isn't listed above, follow these steps:</p>
      <ol>
        <li>Go to <strong><a href="https://hub.docker.com" target="_blank">Docker Hub</a></strong></li>
        <li>Search for your language (e.g., "Haskell", "Elixir", "C++")</li>
        <li>Look for the <strong>Official Image</strong> badge (it looks like a checkmark)</li>
        <li>Read the documentation on that image's page for the recommended Dockerfile pattern</li>
      </ol>`,
      images:[{url:'https://docs.docker.com/scout/images/dockerify.png',alt:'Docker Hub Search',caption:'Always look for the Official Image badge on Docker Hub'}]
    }
  ]
};
`,Description:
