// COMPOSE.JS — Docker Compose deep dive
export const compose = {
  id:'compose',title:'Docker Compose',icon:'🎼',
  subtitle:'Define and run multi-container applications with a single YAML file.',
  tags:['compose','yaml','multi-container','services','orchestration'],
  meta:['📖 30 min','🟣 Advanced','📋 7 sections'],
  sections:[
    {
      id:'what-is-compose',title:'What is Docker Compose?',
      content:`<p><strong>Docker Compose</strong> is a tool for defining and running multi-container Docker applications. Instead of running multiple <code>docker run</code> commands with complex flags, you describe your entire application stack in a single YAML file.</p>
      <h4>Why Docker Compose Exists</h4>
      <p>Real applications rarely run as a single container. A typical web app needs:</p>
      <ul>
        <li>A web server (Nginx)</li>
        <li>An application server (Node.js/Python/Go)</li>
        <li>A database (PostgreSQL/MongoDB)</li>
        <li>A cache (Redis)</li>
        <li>Maybe a message queue (RabbitMQ)</li>
      </ul>
      <p>Without Compose, you'd need 5 separate <code>docker run</code> commands with networking, volumes, and environment variables. Compose lets you define all of this in one file and start everything with one command.</p>`,
      images:[{url:'https://www.docker.com/wp-content/uploads/2023/08/Docker-Website-Assets_v6-copy.png',alt:'Docker Compose',caption:'Docker Compose orchestrates multi-container applications'}],
      keyTakeaways:['Compose = multi-container apps in one YAML file','One command to start/stop entire stack','Handles networking between services automatically','Version-controllable infrastructure definition']
    },
    {
      id:'yaml-structure',title:'YAML Structure Deep Dive',
      content:'<p>The Compose file (<code>compose.yaml</code>) has these top-level keys:</p>',
      codeExamples:[{language:'yaml',title:'Complete compose.yaml anatomy',code:`# Preferred filename: compose.yaml

services:       # Container definitions (required)
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  
  api:
    build: ./api          # Build from Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - ./api/src:/app/src    # Bind mount for dev
    restart: unless-stopped
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: \${DB_USER}       # From .env file
      POSTGRES_PASSWORD: \${DB_PASS}
    volumes:
      - db-data:/var/lib/postgresql/data  # Named volume
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
  
  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb

networks:       # Custom network definitions (optional)
  default:
    driver: bridge

volumes:        # Named volume definitions
  db-data:`,explanation:'Services = containers, networks = communication, volumes = persistent storage'}],
      keyTakeaways:['compose.yaml is the preferred filename (not docker-compose.yml)','Three top-level keys: services, networks, volumes','Services are the core — each becomes a container','Environment variables can reference .env file with ${VAR}']
    },
    {
      id:'services',title:'Services In-Depth',
      content:`<p>Each service defines a container. Key service properties:</p>`,
      codeExamples:[{language:'yaml',title:'Service configuration options',code:`services:
  myservice:
    # Image or Build (choose one)
    image: node:20-alpine        # Use pre-built image
    build:                       # OR build from Dockerfile
      context: ./app
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
    
    # Container settings
    container_name: my-custom-name  # Optional fixed name
    command: npm start              # Override CMD
    entrypoint: /docker-entrypoint.sh
    working_dir: /app
    user: "1000:1000"              # Run as non-root
    
    # Networking
    ports:
      - "3000:3000"     # host:container
      - "9229:9229"     # debug port
    expose:
      - "3000"          # Internal only (no host mapping)
    networks:
      - frontend
      - backend
    
    # Environment
    environment:
      NODE_ENV: production
      DB_HOST: db
    env_file:
      - .env
      - .env.production
    
    # Dependencies
    depends_on:
      db:
        condition: service_healthy
    
    # Resources
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
    
    # Lifecycle
    restart: unless-stopped
    stop_grace_period: 30s
    
    # Health
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`,explanation:'You rarely need all these options. Start simple and add as needed.'}],
      keyTakeaways:['Use image: for pre-built images, build: for Dockerfile builds','depends_on with condition ensures proper startup order','Always set restart policy for production','healthcheck enables smart dependency management']
    },
    {
      id:'networks-compose',title:'Networks in Compose',
      content:`<p>Compose automatically creates a default network for your project. All services can reach each other by service name.</p>`,
      codeExamples:[{language:'yaml',title:'Network isolation example',code:`services:
  frontend:
    image: nginx
    networks:
      - public    # Can be reached from outside
  
  api:
    image: myapi
    networks:
      - public    # Reachable by frontend
      - private   # Can reach database
  
  db:
    image: postgres
    networks:
      - private   # Only reachable by api

networks:
  public:
    driver: bridge
  private:
    driver: bridge
    internal: true   # No external access`,explanation:'Frontend can reach api, api can reach db, but frontend CANNOT reach db directly'}],
      diagrams:[{type:'mermaid',title:'Network Isolation',code:`graph LR
    subgraph Public["Public Network"]
        FE["Frontend<br>nginx"] ---|port 80| API["API<br>node"]
    end
    subgraph Private["Private Network (internal)"]
        API2["API"] ---|port 5432| DB["Database<br>postgres"]
    end
    API --- API2
    
    style FE fill:#22d3ee,color:#000
    style DB fill:#f59e0b,color:#000`}],
      keyTakeaways:['Compose creates a default network automatically','Services resolve each other by service name','Use multiple networks for isolation','internal: true prevents external access']
    },
    {
      id:'volumes-compose',title:'Volumes in Compose',
      content:'<p>Compose supports both named volumes and bind mounts:</p>',
      codeExamples:[{language:'yaml',title:'Volume patterns',code:`services:
  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data   # Named volume
  
  api:
    build: ./api
    volumes:
      - ./api/src:/app/src                 # Bind mount (dev)
      - ./config/api.conf:/app/config.conf:ro  # Read-only config
      - node_modules:/app/node_modules     # Named vol for deps
  
  backup:
    image: alpine
    volumes:
      - db-data:/data/db:ro   # Reuse volume read-only

volumes:
  db-data:                    # Default driver (local)
  node_modules:               # Prevents overwriting by bind mount`,explanation:'Named volumes must be declared in top-level volumes section. Bind mounts use relative paths with ./'}],
      keyTakeaways:['Named volumes declared at top level, bind mounts use ./ paths','Named volumes for databases, bind mounts for code in development','Use :ro for read-only mounts','Multiple services can share the same named volume']
    },
    {
      id:'env-vars',title:'Environment Variables & Secrets',
      content:`<p>Managing configuration in Compose:</p>`,
      codeExamples:[
        {language:'yaml',title:'.env file',code:`# .env file (auto-loaded by compose)
DB_USER=myapp
DB_PASS=supersecret
DB_NAME=production
REDIS_URL=redis://cache:6379
NODE_ENV=production`,explanation:'Compose automatically loads .env in the same directory'},
        {language:'yaml',title:'Using env vars in compose.yaml',code:`services:
  api:
    environment:
      # Direct values
      NODE_ENV: production
      # From .env file
      DB_HOST: db
      DB_USER: \${DB_USER}
      DB_PASS: \${DB_PASS}
    env_file:
      - .env
      - .env.local   # Override per environment`,explanation:'${VAR} syntax references .env file. env_file: passes all vars from file to container.'}
      ],
      alerts:[{type:'danger',title:'Never commit .env files',text:'Add <code>.env</code> to your <code>.gitignore</code>. For production, use Docker secrets or a vault service like HashiCorp Vault.'}],
      keyTakeaways:['Compose auto-loads .env from project directory','Use ${VAR} syntax to interpolate .env values','env_file: passes entire file to container','Never commit secrets to version control']
    },
    {
      id:'compose-commands',title:'Essential Compose Commands',
      content:'<p>The most used Docker Compose commands:</p>',
      codeExamples:[{language:'bash',title:'Compose CLI',code:`# Start all services (detached)
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs -f api

# List running services
docker compose ps

# Execute command in service
docker compose exec api sh

# Scale a service
docker compose up -d --scale api=3

# Validate compose file
docker compose config

# Pull latest images
docker compose pull

# Restart a single service
docker compose restart api`,explanation:'docker compose (with space) is v2. docker-compose (with hyphen) is legacy v1.'}],
      alerts:[{type:'info',title:'v2 vs Legacy',text:'Use <code>docker compose</code> (space, v2 — built into Docker CLI). The old <code>docker-compose</code> (hyphen, v1) is deprecated since July 2023.'}],
      keyTakeaways:['docker compose up -d starts everything in background','docker compose down stops and removes containers','docker compose down -v also removes volumes (careful!)','docker compose logs -f streams logs from all services','Always use v2 syntax (docker compose with space)']
    }
  ]
};
