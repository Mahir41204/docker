// MISTAKES.JS — Common mistakes and how to avoid them
export const mistakes = {
  id:'mistakes',title:'Common Mistakes',icon:'⚠️',
  subtitle:'The most frequent Docker pitfalls and how to avoid them.',
  tags:['mistakes','pitfalls','debugging','best-practices','troubleshooting'],
  meta:['📖 10 min','🟡 All Levels'],
  sections:[
    {
      id:'large-images',title:'❌ Mistake: Bloated Image Sizes',
      content:`<p><strong>Problem:</strong> Images that are 1GB+ when they should be 100MB. This slows down pulls, pushes, and deployments.</p>
      <h4>Common Causes</h4>
      <ul>
        <li>Using full OS base images (ubuntu vs alpine)</li>
        <li>Installing dev dependencies in production images</li>
        <li>Not using multi-stage builds</li>
        <li>Leaving build artifacts and caches</li>
        <li>Missing .dockerignore file</li>
      </ul>`,
      codeExamples:[
        {language:'dockerfile',title:'❌ Bad — 900MB+ image',code:`FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]`,explanation:'Full Node.js image, copies everything (including node_modules, .git), installs dev deps'},
        {language:'dockerfile',title:'✅ Good — ~100MB image',code:`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
USER node
CMD ["node", "dist/server.js"]`,explanation:'Alpine base, multi-stage build, only production artifacts in final image'}
      ],
      keyTakeaways:['Use alpine or distroless base images','Multi-stage builds drop build tools from final image','Always create a .dockerignore','Install only production dependencies','Clean up caches in same RUN command']
    },
    {
      id:'volume-misuse',title:'❌ Mistake: Misusing Volumes',
      content:`<p><strong>Problem:</strong> Losing data when containers are removed, or having permission issues with volumes.</p>
      <h4>Common Issues</h4>
      <ul>
        <li>Not using volumes for database data → data lost on container removal</li>
        <li>Using bind mounts with wrong permissions → container can't write</li>
        <li>Running <code>docker compose down -v</code> accidentally → deletes all data</li>
        <li>bind mount on Mac/Windows → slow filesystem performance</li>
      </ul>`,
      codeExamples:[
        {language:'yaml',title:'❌ Bad — no volume for database',code:`services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret`,explanation:'Database data is stored in the container layer — gone when container is removed!'},
        {language:'yaml',title:'✅ Good — named volume',code:`services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,explanation:'Named volume persists data beyond container lifecycle'}
      ],
      alerts:[{type:'danger',title:'docker compose down -v',text:'The <code>-v</code> flag removes volumes. This DELETES your database data. Only use it when you intentionally want a fresh start.'}],
      keyTakeaways:['Always use named volumes for databases','Bind mounts for development code, named volumes for data','Never use docker compose down -v without thinking twice','Check volume permissions if container can\'t write']
    },
    {
      id:'networking-confusion',title:'❌ Mistake: Networking Confusion',
      content:`<p><strong>Problem:</strong> Containers can't reach each other, or using localhost when they shouldn't.</p>
      <h4>The #1 Networking Mistake</h4>
      <p>Using <code>localhost</code> to connect between containers. Inside a container, <code>localhost</code> refers to THAT container, not the host or other containers.</p>`,
      codeExamples:[
        {language:'yaml',title:'❌ Bad — using localhost',code:`services:
  api:
    environment:
      DB_HOST: localhost    # WRONG! This is the api container itself
      DB_PORT: 5432
  db:
    image: postgres`,explanation:'localhost inside the api container refers to the api container, not the db container'},
        {language:'yaml',title:'✅ Good — using service name',code:`services:
  api:
    environment:
      DB_HOST: db           # Service name = hostname on the network
      DB_PORT: 5432
  db:
    image: postgres`,explanation:'Compose creates DNS entries for each service name'}
      ],
      keyTakeaways:['Never use localhost between containers','Use the service name as hostname (Compose creates DNS)','Custom networks provide automatic DNS resolution','Use docker network inspect to debug connectivity']
    },
    {
      id:'security-mistakes',title:'❌ Mistake: Running as Root',
      content:`<p><strong>Problem:</strong> By default, containers run as root. If an attacker escapes the container, they're root on the host.</p>`,
      codeExamples:[
        {language:'dockerfile',title:'❌ Bad — running as root',code:`FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]`,explanation:'This container runs as root by default'},
        {language:'dockerfile',title:'✅ Good — non-root user',code:`FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --chown=app:app . .
RUN npm ci --only=production
USER app
CMD ["node", "server.js"]`,explanation:'Creates a non-privileged user and switches to it'}
      ],
      keyTakeaways:['Always add USER directive to Dockerfiles','Create a non-root user with adduser/addgroup','Use --chown flag with COPY','Never store secrets in images or Dockerfiles','Scan images for vulnerabilities before deployment']
    },
    {
      id:'debugging-blind',title:'❌ Mistake: Debugging Without Logs',
      content:`<p><strong>Problem:</strong> A container exits immediately and you don't know why.</p>`,
      codeExamples:[{language:'bash',title:'Debug checklist',code:`# 1. Check exit code and logs
docker logs my-container
docker inspect my-container --format="{{.State.ExitCode}}"

# 2. Run interactively to see errors
docker run -it myimage sh

# 3. Override entrypoint to debug
docker run -it --entrypoint sh myimage

# 4. Check if port is in use
docker ps --format "{{.Names}}: {{.Ports}}"

# 5. Inspect container details
docker inspect my-container | grep -i error

# 6. Check resource usage
docker stats`,explanation:'Start with logs, then try interactive mode, then inspect'}],
      keyTakeaways:['Always check docker logs first','docker run -it --entrypoint sh to debug startup issues','Exit code 0 = success, 1 = error, 137 = OOM killed, 143 = SIGTERM','docker stats helps identify resource issues']
    }
  ]
};
