// LEVELS.JS — Learning Levels 0-4
export const levels = {
  'level-0': {
    id:'level-0',title:'Level 0 — Beginner',icon:'🟢',
    subtitle:'Welcome to Docker. Start here if you\'ve never used containers before.',
    tags:['beginner','first-steps','hello-world'],
    meta:['📖 20 min','🟢 Beginner','📋 4 sections'],
    sections:[
      {
        id:'what-is-containerization',title:'What is Containerization?',
        content:`<p><strong>Containerization</strong> is a method of packaging an application along with all its dependencies, libraries, and configuration files into a single, self-contained unit called a <em>container</em>.</p>
        <p>Think of it like a lunchbox: everything you need for your meal is packed together — you don't depend on the cafeteria having the right utensils or condiments.</p>
        <p>Containers are:</p>
        <ul>
          <li><strong>Isolated</strong> — each container runs independently, can't interfere with others</li>
          <li><strong>Portable</strong> — runs the same everywhere: your laptop, a cloud server, CI/CD pipeline</li>
          <li><strong>Lightweight</strong> — shares host OS kernel, uses far less resources than a VM</li>
          <li><strong>Fast</strong> — starts in milliseconds, not minutes</li>
        </ul>`,
        images:[{url:'https://www.docker.com/wp-content/uploads/2021/11/container-what-is-container.png',alt:'What is a container',caption:'Containers package code and dependencies together'}],
        keyTakeaways:['Containerization = packaging app + dependencies into one unit','Containers are isolated, portable, lightweight, and fast','NOT a virtual machine — no separate OS']
      },
      {
        id:'why-docker',title:'Why Docker?',
        content:`<p>Docker is the most popular containerization platform. Here's why it won:</p>
        <ul>
          <li><strong>Developer Experience</strong> — simple CLI, great docs, huge community</li>
          <li><strong>Docker Hub</strong> — 100,000+ pre-built images (databases, languages, frameworks)</li>
          <li><strong>Dockerfile</strong> — declarative, version-controllable build instructions</li>
          <li><strong>Docker Compose</strong> — define multi-service apps in one file</li>
          <li><strong>Industry Standard</strong> — CI/CD pipelines, cloud platforms, Kubernetes all use Docker images</li>
        </ul>`,
        alerts:[{type:'tip',title:'Did You Know?',text:'Docker was released in 2013 by Solomon Hykes. The name comes from "dock worker" — someone who loads and unloads shipping containers.'}],
        keyTakeaways:['Docker made containers accessible to regular developers','Docker Hub provides thousands of ready-to-use images','Dockerfiles make builds reproducible and version-controlled']
      },
      {
        id:'basic-commands',title:'Basic Docker Commands',
        content:'<p>Here are the essential commands you need to get started:</p>',
        codeExamples:[
          {language:'bash',title:'Check Docker version',code:'docker --version\ndocker info',explanation:'Verify Docker is installed and see system info'},
          {language:'bash',title:'Run your first container',code:'docker run hello-world',explanation:'Downloads the hello-world image and runs it. This is the Docker equivalent of "Hello World"'},
          {language:'bash',title:'Run an interactive container',code:'docker run -it ubuntu bash',explanation:'-it = interactive terminal. You get a bash shell inside an Ubuntu container'},
          {language:'bash',title:'List and manage containers',code:'# List running containers\ndocker ps\n\n# List ALL containers (including stopped)\ndocker ps -a\n\n# Stop a container\ndocker stop <container_id>\n\n# Remove a container\ndocker rm <container_id>',explanation:'These are the bread and butter of container management'}
        ],
        keyTakeaways:['docker run = pull (if needed) + create + start','docker ps = see running containers','-it flag gives you interactive shell access','docker stop then docker rm to clean up']
      },
      {
        id:'running-first-container',title:'Running Your First Real Container',
        content:'<p>Let\'s run something more useful — a web server:</p>',
        codeExamples:[
          {language:'bash',title:'Run Nginx web server',code:'docker run -d -p 8080:80 --name my-nginx nginx:alpine',explanation:'-d = detached (background), -p 8080:80 = map port 8080 on host to port 80 in container, --name = friendly name'},
          {language:'bash',title:'Run Caddy web server (alternative)',code:'docker run -d -p 8080:80 --name my-caddy caddy:2-alpine',explanation:'Caddy is a modern web server with automatic HTTPS. Same flags, different image.'},
          {language:'bash',title:'Check it works',code:'# Open http://localhost:8080 in your browser\n\n# Or use curl\ncurl http://localhost:8080\n\n# View logs\ndocker logs my-nginx   # or: docker logs my-caddy\n\n# Stop and clean up\ndocker stop my-nginx\ndocker rm my-nginx',explanation:'You just ran a production web server in seconds!'}
        ],
        diagrams:[{type:'mermaid',title:'What Just Happened',code:`sequenceDiagram
    participant You
    participant Docker CLI
    participant Docker Daemon
    participant Docker Hub
    participant Container
    You->>Docker CLI: docker run nginx
    Docker CLI->>Docker Daemon: API request
    Docker Daemon->>Docker Hub: Pull nginx image
    Docker Hub-->>Docker Daemon: Image layers
    Docker Daemon->>Container: Create & start
    Container-->>You: Nginx running on :8080`}],
        keyTakeaways:['-d flag runs container in background (detached)','-p maps host port to container port','--name gives container a human-friendly name','alpine variants are smaller image versions']
      }
    ]
  },
  'level-1': {
    id:'level-1',title:'Level 1 — Basic Usage',icon:'🔵',
    subtitle:'Master the Docker CLI, images, containers, and write your first Dockerfile.',
    tags:['cli','dockerfile','images','building'],
    meta:['📖 30 min','🔵 Basic','📋 5 sections'],
    sections:[
      {
        id:'docker-cli',title:'Docker CLI Deep Dive',
        content:`<p>The Docker CLI is your primary interface. Every command follows the pattern:</p>
        <p><code>docker &lt;command&gt; [options] [arguments]</code></p>
        <p>Since Docker 1.13+, commands are grouped logically:</p>`,
        codeExamples:[
          {language:'bash',title:'Container commands',code:'docker container ls        # list running\ndocker container ls -a     # list all\ndocker container run       # create + start\ndocker container stop      # stop\ndocker container rm        # remove\ndocker container inspect   # detailed info\ndocker container logs      # view logs\ndocker container exec      # run command inside',explanation:'The "docker container" prefix is optional — "docker ps" still works'},
          {language:'bash',title:'Image commands',code:'docker image ls            # list local images\ndocker image pull nginx    # download image\ndocker image rm nginx      # remove image\ndocker image inspect nginx # image details\ndocker image prune         # remove unused\ndocker image history nginx # show layers',explanation:'Images are your container blueprints'},
          {language:'bash',title:'System commands',code:'docker system df          # disk usage\ndocker system prune -a    # remove ALL unused data\ndocker system info        # system-wide info',explanation:'Keep your system clean with prune commands'}
        ],
        keyTakeaways:['Modern syntax: docker <object> <command>','Legacy syntax (docker ps) still works','docker system prune is your cleanup friend']
      },
      {
        id:'pulling-images',title:'Pulling & Managing Images',
        content:`<p>Images are downloaded from <strong>registries</strong>. Docker Hub is the default public registry.</p>
        <p>Image naming convention: <code>[registry/]repository[:tag]</code></p>`,
        codeExamples:[
          {language:'bash',title:'Pulling images',code:'# Pull latest (default tag)\ndocker pull nginx\n\n# Pull specific version\ndocker pull node:24-alpine\n\n# Pull from specific registry\ndocker pull gcr.io/google-containers/nginx\n\n# Pull Caddy server\ndocker pull caddy:2-alpine\n\n# List local images\ndocker images\n\n# Image details\ndocker inspect nginx',explanation:'Always use specific tags in production — never rely on :latest'},
          {language:'bash',title:'Image management',code:'# Remove an image\ndocker rmi nginx:latest\n\n# Remove all unused images\ndocker image prune -a\n\n# Tag an image\ndocker tag myapp:latest myapp:v1.0\n\n# Save image to tar file\ndocker save -o myapp.tar myapp:v1.0\n\n# Load image from tar\ndocker load -i myapp.tar',explanation:'Tagging is how you version your images'}
        ],
        alerts:[{type:'warning',title:'Avoid :latest in Production',text:'The <code>:latest</code> tag is mutable — it can point to different versions over time. Always pin specific versions (e.g., <code>node:24.1-alpine</code>) for reproducible builds.'}],
        keyTakeaways:['Always use specific image tags in production','Docker Hub is the default registry','docker image prune cleans unused images','Images can be saved/loaded as tar files for offline transfer']
      },
      {
        id:'running-containers',title:'Running Containers — All the Options',
        content:'<p>The <code>docker run</code> command is the most feature-rich command in Docker:</p>',
        codeExamples:[
          {language:'bash',title:'Common run options',code:'# Basic run\ndocker run nginx\n\n# Detached + port mapping + name\ndocker run -d -p 8080:80 --name web nginx\n\n# Environment variables\ndocker run -e DB_HOST=localhost -e DB_PORT=5432 myapp\n\n# Volume mount\ndocker run -v ./data:/app/data myapp\n\n# Resource limits\ndocker run --memory=512m --cpus=1.0 myapp\n\n# Auto-remove on exit\ndocker run --rm myapp\n\n# Restart policy\ndocker run --restart=unless-stopped myapp\n\n# Network\ndocker run --network=mynet myapp',explanation:'Combine multiple flags as needed for your use case'}
        ],
        keyTakeaways:['docker run combines pull + create + start','Use -d for background, -it for interactive','--rm auto-cleans container on exit','--restart=unless-stopped for production services']
      },
      {
        id:'writing-dockerfile',title:'Writing Your First Dockerfile',
        content:`<p>A <strong>Dockerfile</strong> is a text file with instructions to build an image. Each instruction creates a <em>layer</em>.</p>`,
        codeExamples:[
          {language:'dockerfile',title:'Basic Dockerfile for a Node.js App',code:`# Base image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]`,explanation:'Order matters! COPY package.json before COPY . ensures npm install is cached when only code changes'},
          {language:'bash',title:'Build and run',code:'# Build the image\ndocker build -t my-node-app:1.0 .\n\n# Run it\ndocker run -d -p 3000:3000 my-node-app:1.0',explanation:'The dot (.) at the end means "use current directory as build context"'}
        ],
        diagrams:[{type:'mermaid',title:'Dockerfile Build Process',code:`graph LR
    A[Dockerfile] -->|docker build| B[Layer 1: FROM node]
    B --> C[Layer 2: WORKDIR]
    C --> D[Layer 3: COPY pkg]
    D --> E[Layer 4: RUN npm]
    E --> F[Layer 5: COPY .]
    F --> G[Final Image]
    style G fill:#22d3ee,color:#000`}],
        keyTakeaways:['Each Dockerfile instruction creates a layer','Order instructions from least to most frequently changed','COPY dependency files before source code for caching','Use .dockerignore to exclude unnecessary files']
      },
      {
        id:'dockerignore',title:'The .dockerignore File',
        content:'<p>Just like <code>.gitignore</code>, a <code>.dockerignore</code> file tells Docker which files to exclude from the build context:</p>',
        codeExamples:[
          {language:'plaintext',title:'.dockerignore',code:`node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
Dockerfile
docker-compose.yml
README.md
.vscode
coverage
.nyc_output
*.md`,explanation:'This prevents sending unnecessary files to the Docker daemon, speeding up builds and reducing image size'}
        ],
        keyTakeaways:['Always create a .dockerignore file','Exclude node_modules, .git, .env, and docs','Smaller build context = faster builds','Prevents accidentally including secrets in images']
      }
    ]
  },
  'level-2': {
    id:'level-2',title:'Level 2 — Internal Working',icon:'🟡',
    subtitle:'Understand what happens under the hood when Docker runs a container.',
    tags:['architecture','internals','namespaces','cgroups','layers'],
    meta:['📖 25 min','🟡 Intermediate','📋 5 sections'],
    sections:[
      {
        id:'docker-architecture',title:'Docker Architecture',
        content:`<p>Docker uses a <strong>client-server architecture</strong> with multiple components working together:</p>
        <ul>
          <li><strong>Docker CLI</strong> — the command-line tool you interact with</li>
          <li><strong>Docker Daemon (dockerd)</strong> — the background service managing everything</li>
          <li><strong>containerd</strong> — industry-standard container runtime (CNCF project)</li>
          <li><strong>runc</strong> — low-level OCI runtime that creates the actual container</li>
          <li><strong>containerd-shim</strong> — keeps container alive even if daemon restarts</li>
        </ul>`,
        diagrams:[{type:'mermaid',title:'Docker Architecture Stack',code:`graph TB
    A["👤 User: docker run nginx"] --> B["Docker CLI"]
    B -->|REST API| C["Docker Daemon<br>(dockerd)"]
    C --> D["containerd"]
    D --> E["containerd-shim"]
    E --> F["runc"]
    F -->|"clone() syscall"| G["🐧 Linux Kernel"]
    G --> H["Namespaces + cgroups"]
    H --> I["📦 Running Container"]
    
    style I fill:#22d3ee,color:#000
    style G fill:#f59e0b,color:#000`}],
        images:[{url:'https://docs.docker.com/get-started/images/docker-architecture.webp',alt:'Docker Architecture',caption:'Official Docker Architecture — Client, Daemon, Registry (source: docs.docker.com)'}],
        keyTakeaways:['Docker CLI → Daemon → containerd → runc → kernel','Each layer has a specific responsibility','containerd-shim keeps containers alive during daemon updates','runc creates the container then exits']
      },
      {
        id:'image-layers',title:'How Images Are Built — Layers',
        content:`<p>Docker images use a <strong>Union Filesystem</strong> (OverlayFS on modern Linux) to stack read-only layers:</p>
        <ul>
          <li>Each Dockerfile instruction (FROM, RUN, COPY) creates a new <strong>layer</strong></li>
          <li>Layers are <strong>read-only</strong> and <strong>shared</strong> between images</li>
          <li>When a container runs, a thin <strong>writable layer</strong> is added on top</li>
          <li>Changes in the container only affect the writable layer (Copy-on-Write)</li>
        </ul>`,
        codeExamples:[{language:'bash',title:'Inspect image layers',code:'# Show all layers in an image\ndocker history nginx:alpine\n\n# Detailed layer info\ndocker inspect nginx:alpine | jq ".[0].RootFS.Layers"',explanation:'Each layer has a SHA256 hash. Identical layers are stored only once.'}],
        diagrams:[{type:'mermaid',title:'Image Layer Stack',code:`graph TB
    A["Writable Container Layer<br>(ephemeral)"] --> B["Layer 4: COPY . .<br>(your code)"]
    B --> C["Layer 3: RUN npm install<br>(dependencies)"]
    C --> D["Layer 2: WORKDIR /app"]
    D --> E["Layer 1: FROM node:24-alpine<br>(base image)"]
    
    style A fill:#ef4444,color:#fff
    style B fill:#1a2035,color:#e2e8f0
    style C fill:#1a2035,color:#e2e8f0
    style D fill:#1a2035,color:#e2e8f0
    style E fill:#22d3ee,color:#000`}],
        keyTakeaways:['Images are stacks of read-only layers','Containers add one writable layer on top','Layers are shared and cached — saves disk and build time','Order Dockerfile instructions to maximize cache hits']
      },
      {
        id:'namespaces',title:'Namespaces — Process Isolation',
        content:`<p><strong>Namespaces</strong> are a Linux kernel feature that provides isolation. They are the "invisible walls" between containers.</p>
        <p>When Docker creates a container, it creates these namespaces:</p>
        <ul>
          <li><strong>PID</strong> — Process IDs. Container sees its main process as PID 1</li>
          <li><strong>NET</strong> — Network stack. Container gets its own IP, ports, routing</li>
          <li><strong>MNT</strong> — Mount points. Container has its own filesystem</li>
          <li><strong>IPC</strong> — Inter-process communication. Isolates shared memory</li>
          <li><strong>UTS</strong> — Hostname. Container can have its own hostname</li>
          <li><strong>USER</strong> — User IDs. Maps container root to non-root on host</li>
        </ul>`,
        diagrams:[{type:'mermaid',title:'Namespace Isolation',code:`graph TB
    subgraph Host["Host System"]
        K["Linux Kernel"]
    end
    subgraph C1["Container 1"]
        P1["PID: 1 nginx"]
        N1["NET: 172.17.0.2"]
        M1["MNT: /app"]
    end
    subgraph C2["Container 2"]
        P2["PID: 1 node"]
        N2["NET: 172.17.0.3"]
        M2["MNT: /app"]
    end
    K --> C1
    K --> C2`}],
        keyTakeaways:['Namespaces define what a container can SEE','6 types: PID, NET, MNT, IPC, UTS, USER','Each container thinks it has its own OS','PID 1 in container may be PID 4532 on host']
      },
      {
        id:'cgroups',title:'cgroups — Resource Control',
        content:`<p>While namespaces control <em>what</em> a container can see, <strong>cgroups (Control Groups)</strong> control <em>what</em> a container can use.</p>
        <p>cgroups enforce limits on:</p>
        <ul>
          <li><strong>CPU</strong> — how much processing power a container gets</li>
          <li><strong>Memory</strong> — maximum RAM usage (OOM killed if exceeded)</li>
          <li><strong>Disk I/O</strong> — read/write speed limits</li>
          <li><strong>Network</strong> — bandwidth throttling</li>
        </ul>`,
        codeExamples:[{language:'bash',title:'Setting resource limits',code:'# Limit to 512MB RAM and 1 CPU\ndocker run --memory=512m --cpus=1.0 nginx\n\n# Limit to 50% of one CPU\ndocker run --cpus=0.5 nginx\n\n# Limit memory + disable swap\ndocker run --memory=256m --memory-swap=256m nginx\n\n# View real-time stats\ndocker stats',explanation:'Without limits, a single container can consume all host resources'}],
        alerts:[{type:'warning',title:'Always Set Memory Limits in Production',text:'Without memory limits, a memory leak in one container can crash the entire host. Always set <code>--memory</code> for production containers.'}],
        keyTakeaways:['cgroups define what a container can USE','Prevents "noisy neighbor" problems','Modern Docker uses cgroup v2','Always set resource limits in production']
      },
      {
        id:'container-runtime',title:'How Containers Actually Run',
        content:`<p>When you run <code>docker run nginx</code>, here's the complete sequence:</p>`,
        steps:[
          {title:'CLI parses command',desc:'Docker CLI sends REST API request to Docker Daemon'},
          {title:'Daemon checks image',desc:'If image not local, pulls from registry (Docker Hub)'},
          {title:'Daemon calls containerd',desc:'Passes the OCI image spec to containerd'},
          {title:'containerd prepares bundle',desc:'Creates filesystem bundle with root filesystem and config'},
          {title:'runc creates container',desc:'Calls Linux clone() syscall with namespace flags, sets up cgroups, mounts OverlayFS'},
          {title:'Process starts',desc:'runc executes the entrypoint (e.g., nginx), then exits. containerd-shim takes over as parent'},
          {title:'Container is running',desc:'The application runs in its isolated, resource-controlled environment'}
        ],
        keyTakeaways:['The process: CLI → Daemon → containerd → runc → kernel','runc exits after starting the container','containerd-shim keeps container alive','The container process IS the application — no VM overhead']
      }
    ]
  },
  'level-3': {
    id:'level-3',title:'Level 3 — Advanced Concepts',icon:'🟣',
    subtitle:'Volumes, networking, multi-stage builds, optimization, and security.',
    tags:['volumes','networking','multi-stage','security','optimization'],
    meta:['📖 35 min','🟣 Advanced','📋 5 sections'],
    sections:[
      {
        id:'volumes-storage',title:'Volumes & Storage',
        content:`<p>Containers are <strong>ephemeral</strong> — when removed, their data is gone. Volumes solve this.</p>
        <h4>Three Types of Storage</h4>
        <ul>
          <li><strong>Volumes</strong> — managed by Docker, stored in /var/lib/docker/volumes/. Best for persistent data.</li>
          <li><strong>Bind Mounts</strong> — map a host directory into the container. Good for development.</li>
          <li><strong>tmpfs</strong> — stored in memory only, never written to disk. For sensitive data.</li>
        </ul>`,
        codeExamples:[
          {language:'bash',title:'Volume operations',code:'# Create named volume\ndocker volume create app-data\n\n# Run with named volume\ndocker run -v app-data:/var/lib/data postgres:18\n\n# Bind mount (development)\ndocker run -v $(pwd)/src:/app/src myapp\n\n# Read-only mount\ndocker run -v ./config.yml:/app/config.yml:ro myapp\n\n# tmpfs mount\ndocker run --tmpfs /tmp myapp\n\n# List and clean volumes\ndocker volume ls\ndocker volume prune',explanation:'Named volumes are preferred for databases. Bind mounts for dev. tmpfs for secrets.'}
        ],
        diagrams:[{type:'mermaid',title:'Volume Types',code:`graph LR
    subgraph Container
        A["/app/data"]
        B["/app/src"]
        C["/tmp"]
    end
    subgraph Host
        D["Docker Volume<br>/var/lib/docker/volumes/"]
        E["Host Directory<br>~/projects/src"]
        F["RAM<br>tmpfs"]
    end
    A ---|Named Volume| D
    B ---|Bind Mount| E
    C ---|tmpfs| F
    
    style D fill:#10b981,color:#000
    style E fill:#f59e0b,color:#000
    style F fill:#a78bfa,color:#000`}],
        keyTakeaways:['Volumes persist data beyond container lifecycle','Named volumes for databases, bind mounts for dev','Always use :ro for config files','tmpfs for sensitive data that should never hit disk']
      },
      {
        id:'networking',title:'Docker Networking',
        content:`<p>Docker creates and manages virtual networks for container communication:</p>`,
        codeExamples:[
          {language:'bash',title:'Network operations',code:'# List networks\ndocker network ls\n\n# Create custom bridge network\ndocker network create --driver bridge mynet\n\n# Run containers on same network\ndocker run -d --name api --network mynet myapi\ndocker run -d --name db --network mynet postgres\n\n# Now api can reach db by name: postgres://db:5432\n\n# Inspect network\ndocker network inspect mynet',explanation:'On custom networks, containers can resolve each other by container name (automatic DNS)'}
        ],
        diagrams:[{type:'mermaid',title:'Network Modes Comparison',code:`graph TB
    subgraph Bridge["Bridge Network (default)"]
        B1["Container A<br>172.17.0.2"] ---|docker0 bridge| B2["Container B<br>172.17.0.3"]
        B3["Port mapping<br>-p 8080:80"] --- B1
    end
    subgraph HostMode["Host Network"]
        H1["Container<br>shares host IP<br>no port mapping needed"]
    end
    subgraph Overlay["Overlay Network"]
        O1["Host 1<br>Container A"] ---|VXLAN tunnel| O2["Host 2<br>Container B"]
    end`}],
        keyTakeaways:['bridge = default, isolated, use port mapping','host = no isolation, container uses host network','overlay = multi-host, used in Swarm/K8s','Custom bridge networks give automatic DNS resolution','Use custom networks — never rely on default bridge']
      },
      {
        id:'multi-stage',title:'Multi-Stage Builds',
        content:`<p>Multi-stage builds let you use multiple FROM statements to create optimized images:</p>`,
        codeExamples:[
          {language:'dockerfile',title:'Multi-stage Dockerfile',code:`# Stage 1: Build
FROM node:24 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (only the built output)
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]`,explanation:'Builder stage has full Node.js + dev tools (~900MB). Production stage has only alpine + built code (~150MB).'},
          {language:'dockerfile',title:'Go example — minimal image',code:`# Build stage
FROM golang:1.26 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o server .

# Final stage — scratch = empty image
FROM scratch
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,explanation:'Final image contains ONLY the compiled binary. Image size: ~10MB vs ~800MB'}
        ],
        keyTakeaways:['Multi-stage = smaller, more secure images','Build tools stay in the builder stage','Production stage has only runtime necessities','Go + scratch = smallest possible images (< 10MB)']
      },
      {
        id:'image-optimization',title:'Image Optimization',
        content:`<p>Smaller images = faster pulls, less storage, smaller attack surface.</p>`,
        codeExamples:[
          {language:'dockerfile',title:'Optimization techniques',code:`# 1. Use minimal base images
FROM node:24-alpine   # ~180MB vs node:24 ~900MB

# 2. Combine RUN commands
RUN apt-get update && \\
    apt-get install -y --no-install-recommends curl && \\
    rm -rf /var/lib/apt/lists/*

# 3. Copy dependency files first
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# 4. Use .dockerignore
# 5. Don't install dev dependencies in prod
# 6. Clean up in same layer`,explanation:'Each technique can reduce image size by 50-90%'}
        ],
        alerts:[{type:'tip',title:'Size Comparison',text:'<strong>node:24</strong> = ~900MB | <strong>node:24-slim</strong> = ~200MB | <strong>node:24-alpine</strong> = ~180MB | <strong>distroless</strong> = ~120MB'}],
        keyTakeaways:['Use alpine or distroless base images','Combine RUN commands to reduce layers','Install only production dependencies','Clean up cache in the same RUN command']
      },
      {
        id:'security',title:'Security Best Practices',
        content:`<p>Containers are not inherently secure — you need to apply these practices:</p>
        <ul>
          <li><strong>Run as non-root</strong> — containers default to root, which is dangerous</li>
          <li><strong>Use minimal images</strong> — fewer packages = fewer vulnerabilities</li>
          <li><strong>Scan for vulnerabilities</strong> — use Docker Scout or Trivy</li>
          <li><strong>Don't hardcode secrets</strong> — use environment variables or secret managers</li>
          <li><strong>Pin image versions</strong> — never use :latest in production</li>
          <li><strong>Read-only filesystem</strong> — prevent runtime modifications</li>
        </ul>`,
        codeExamples:[{language:'dockerfile',title:'Secure Dockerfile',code:`FROM node:24-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN npm ci --only=production

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]`,explanation:'Never run production containers as root. The USER directive switches to a non-privileged user.'}],
        keyTakeaways:['Always use USER directive — never run as root','Scan images with docker scout or trivy','Pin specific image versions','Use read-only root filesystem where possible','Never put secrets in Dockerfiles or images']
      }
    ]
  },
  'level-4': {
    id:'level-4',title:'Level 4 — Production Level',icon:'🔴',
    subtitle:'Scaling, debugging, logging, deployment workflows, and real-world architecture.',
    tags:['production','scaling','debugging','logging','deployment'],
    meta:['📖 30 min','🔴 Expert','📋 5 sections'],
    sections:[
      {
        id:'scaling',title:'Scaling Containers',
        content:`<p>In production, you need to scale your services to handle load:</p>
        <ul>
          <li><strong>Horizontal scaling</strong> — run multiple instances of the same container</li>
          <li><strong>Load balancing</strong> — distribute traffic across instances</li>
          <li><strong>Health checks</strong> — ensure containers are actually working</li>
          <li><strong>Auto-restart</strong> — recover from crashes automatically</li>
        </ul>`,
        codeExamples:[
          {language:'yaml',title:'Scaling with Docker Compose',code:`services:
  api:
    image: myapi:1.0
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped`,explanation:'Deploy 3 replicas with health checks and resource limits'},
          {language:'dockerfile',title:'Dockerfile HEALTHCHECK',code:`FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

USER node
EXPOSE 3000
CMD ["node", "server.js"]`,explanation:'Docker will mark unhealthy containers and orchestrators can replace them'}
        ],
        keyTakeaways:['Use replicas for horizontal scaling','Always define health checks','Set resource limits to prevent resource starvation','Use restart: unless-stopped for production']
      },
      {
        id:'debugging',title:'Debugging Containers',
        content:'<p>When things go wrong (and they will), here\'s how to debug:</p>',
        codeExamples:[
          {language:'bash',title:'Debugging toolkit',code:'# View logs (follow mode)\ndocker logs -f --tail 100 my-container\n\n# Shell into running container\ndocker exec -it my-container sh\n\n# Inspect container config\ndocker inspect my-container\n\n# View real-time resource usage\ndocker stats\n\n# View processes inside container\ndocker top my-container\n\n# Copy files from container\ndocker cp my-container:/app/logs ./logs\n\n# View container changes from image\ndocker diff my-container\n\n# Debug exited container\ndocker logs my-container\ndocker inspect my-container --format="{{.State.ExitCode}}"',explanation:'Start with logs, then exec in, then inspect. Most issues are in logs.'}
        ],
        keyTakeaways:['docker logs -f is your first debugging tool','docker exec -it gets you a shell inside','docker inspect shows full container configuration','docker stats shows real-time CPU/memory usage','docker cp extracts files from containers']
      },
      {
        id:'logging',title:'Logging Strategies',
        content:`<p>Proper logging is critical in containerized environments:</p>
        <ul>
          <li><strong>Log to stdout/stderr</strong> — Docker captures these automatically</li>
          <li><strong>Use logging drivers</strong> — json-file, syslog, fluentd, etc.</li>
          <li><strong>Centralize logs</strong> — aggregate with ELK, Loki, or CloudWatch</li>
          <li><strong>Set log rotation</strong> — prevent disk from filling up</li>
        </ul>`,
        codeExamples:[{language:'json',title:'Docker daemon.json — log rotation',code:`{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}`,explanation:'Without rotation, log files can consume all disk space. Set this in /etc/docker/daemon.json'}],
        alerts:[{type:'danger',title:'Critical: Set Log Rotation',text:'Without <code>max-size</code> and <code>max-file</code>, Docker log files grow indefinitely and WILL fill your disk. This is the #1 cause of production disk space issues.'}],
        keyTakeaways:['Always log to stdout/stderr (Docker captures them)','Configure log rotation in daemon.json','Use centralized logging in production (ELK/Loki)','Never log sensitive data (passwords, tokens)']
      },
      {
        id:'deployment-workflows',title:'Deployment Workflows',
        content:'<p>A typical Docker-based deployment pipeline:</p>',
        diagrams:[{type:'mermaid',title:'CI/CD Pipeline with Docker',code:`graph LR
    A["Developer<br>git push"] --> B["CI Server<br>GitHub Actions"]
    B --> C["Build Image<br>docker build"]
    C --> D["Run Tests<br>docker run tests"]
    D --> E["Scan Image<br>trivy/scout"]
    E --> F["Push to Registry<br>docker push"]
    F --> G["Deploy<br>docker compose up"]
    G --> H["Monitor<br>health checks"]
    
    style F fill:#22d3ee,color:#000
    style G fill:#10b981,color:#000`}],
        codeExamples:[{language:'yaml',title:'GitHub Actions Docker CI/CD',code:`name: Docker CI/CD
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t myapp:\${{ github.sha }} .
      
      - name: Run tests
        run: docker run --rm myapp:\${{ github.sha }} npm test
      
      - name: Push to registry
        run: |
          echo \${{ secrets.DOCKER_TOKEN }} | docker login -u \${{ secrets.DOCKER_USER }} --password-stdin
          docker push myapp:\${{ github.sha }}`,explanation:'Tag images with git SHA for traceability. Run tests inside containers for consistency.'}],
        keyTakeaways:['Build → Test → Scan → Push → Deploy','Tag images with git SHA for traceability','Run tests inside containers for consistency','Never deploy unscanned images']
      },
      {
        id:'real-world-architecture',title:'Real-World Container Architecture',
        content:'<p>Here\'s how Docker fits into a modern production system:</p>',
        diagrams:[{type:'mermaid',title:'Production Microservices Architecture',code:`graph TB
    LB["Load Balancer<br>Nginx/Caddy/Traefik"] --> API1["API Server 1"]
    LB --> API2["API Server 2"]
    LB --> API3["API Server 3"]
    API1 --> Cache["Redis Cache"]
    API2 --> Cache
    API3 --> Cache
    API1 --> DB["PostgreSQL<br>(with volume)"]
    API2 --> DB
    API3 --> DB
    API1 --> MQ["RabbitMQ"]
    MQ --> W1["Worker 1"]
    MQ --> W2["Worker 2"]
    
    style LB fill:#22d3ee,color:#000
    style DB fill:#f59e0b,color:#000
    style Cache fill:#a78bfa,color:#000`}],
        keyTakeaways:['Each service runs in its own container','Databases need persistent volumes','Use a load balancer for scaling web services','Message queues decouple work processing','All services can be defined in a single compose file']
      }
    ]
  }
};
