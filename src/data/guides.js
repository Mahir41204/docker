// GUIDES.JS — Practical step-by-step guides
export const guides = {
  id:'guides',title:'Practical Guides',icon:'📋',
  subtitle:'Step-by-step guides from installing Docker to production-ready setups.',
  tags:['tutorial','hands-on','practical','install','deploy'],
  meta:['📖 25 min','🟢 Beginner → 🔴 Expert'],
  sections:[
    {
      id:'install-docker',title:'Guide: Install Docker',
      content:'<p>Get Docker running on your machine:</p>',
      subsections:[
        {title:'Windows',content:'<ol><li>Download <a href="https://docs.docker.com/desktop/install/windows-install/" target="_blank">Docker Desktop for Windows</a></li><li>Run installer — requires WSL 2 backend</li><li>Restart computer</li><li>Open Docker Desktop, accept terms</li><li>Verify: <code>docker --version</code></li></ol>'},
        {title:'macOS',content:'<ol><li>Download <a href="https://docs.docker.com/desktop/install/mac-install/" target="_blank">Docker Desktop for Mac</a> (Intel or Apple Silicon)</li><li>Drag to Applications folder</li><li>Open Docker Desktop</li><li>Verify: <code>docker --version</code></li></ol>'},
        {title:'Linux (Ubuntu/Debian)',codeExamples:[{language:'bash',title:'Install on Ubuntu',code:`# Remove old versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add the repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Verify
docker --version
docker compose version`,explanation:'Log out and back in after adding yourself to the docker group'}]}
      ],
      keyTakeaways:['Windows/Mac: Use Docker Desktop','Linux: Install Docker Engine via official repository','Always add your user to the docker group on Linux','Verify with docker --version']
    },
    {
      id:'first-container-guide',title:'Guide: Run Your First Container',
      content:'<p>A hands-on walkthrough of your first Docker experience:</p>',
      steps:[
        {title:'Pull and run hello-world',code:{language:'bash',code:'docker run hello-world',explanation:'Docker pulls the image, creates a container, runs it, and shows output'}},
        {title:'Run a web server',code:{language:'bash',code:'docker run -d -p 8080:80 --name myweb nginx:alpine',explanation:'Visit http://localhost:8080 to see the Nginx welcome page'}},
        {title:'Explore the container',code:{language:'bash',code:'# View running containers\ndocker ps\n\n# View logs\ndocker logs myweb\n\n# Shell into the container\ndocker exec -it myweb sh\n\n# Inside: look around\nls /usr/share/nginx/html/\ncat /etc/nginx/nginx.conf\nexit',explanation:'You now have a shell inside a running container!'}},
        {title:'Clean up',code:{language:'bash',code:'docker stop myweb\ndocker rm myweb\ndocker system prune',explanation:'Always clean up after experiments'}}
      ]
    },
    {
      id:'build-app-guide',title:'Guide: Build a Full App with Dockerfile',
      content:'<p>Create a simple Node.js API containerized with Docker:</p>',
      steps:[
        {title:'Create the application',code:{language:'javascript',title:'server.js',code:`const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ message: 'Hello from Docker!', time: new Date() }));
});
server.listen(3000, () => console.log('Server on port 3000'));`,explanation:'A simple HTTP server that returns JSON'}},
        {title:'Create the Dockerfile',code:{language:'dockerfile',code:`FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]`,explanation:'Alpine base, non-root user, dependency caching'}},
        {title:'Create .dockerignore',code:{language:'plaintext',code:'node_modules\n.git\n.env\nDockerfile\n*.md',explanation:'Exclude unnecessary files from build context'}},
        {title:'Build and run',code:{language:'bash',code:'docker build -t my-api:1.0 .\ndocker run -d -p 3000:3000 --name api my-api:1.0\ncurl http://localhost:3000',explanation:'Your API is now containerized and running!'}}
      ]
    },
    {
      id:'compose-guide',title:'Guide: Multi-Container App with Docker Compose',
      content:'<p>Build a complete stack with API + database + cache:</p>',
      codeExamples:[{language:'yaml',title:'compose.yaml',code:`services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DB_URL: postgres://app:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_started }
    restart: unless-stopped
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: pg_isready -U app
      interval: 5s
      retries: 5
  
  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 128mb

volumes:
  pgdata:`,explanation:'Three services: API, PostgreSQL, Redis. Health checks ensure proper startup order.'}],
      steps:[
        {title:'Start the stack',code:{language:'bash',code:'docker compose up -d\ndocker compose ps\ndocker compose logs -f api',explanation:'All three services start with proper dependency ordering'}},
        {title:'Test and iterate',code:{language:'bash',code:'# Test the API\ncurl http://localhost:3000\n\n# Shell into a service\ndocker compose exec api sh\n\n# Rebuild after code changes\ndocker compose up -d --build',explanation:'Compose makes development fast with one-command rebuilds'}},
        {title:'Clean up',code:{language:'bash',code:'# Stop and remove containers + networks\ndocker compose down\n\n# Also remove volumes (careful!)\ndocker compose down -v',explanation:'docker compose down -v removes persistent data too!'}}
      ]
    },
    {
      id:'production-guide',title:'Guide: Production-Ready Setup',
      content:'<p>A checklist for production Docker deployments:</p>',
      alerts:[{type:'warning',title:'Production Checklist',text:'Use these practices for any production deployment. Skipping any of these can lead to security vulnerabilities, data loss, or downtime.'}],
      codeExamples:[{language:'dockerfile',title:'Production Dockerfile',code:`# Multi-stage build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Production image
FROM node:20-alpine
RUN apk add --no-cache tini
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./

USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/server.js"]`,explanation:'Multi-stage, non-root, health check, tini for proper signal handling, minimal alpine base'}],
      keyTakeaways:['Multi-stage builds for small, secure images','Run as non-root user (USER directive)','Always add health checks','Use tini or dumb-init as PID 1','Pin specific image versions','Set resource limits','Configure log rotation','Scan images for vulnerabilities']
    }
  ]
};
