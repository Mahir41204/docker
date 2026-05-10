// INTEGRATIONS.JS — CI/CD, K8s, Cloud, Backend integrations
export const integrations = {
  id: "integrations",
  title: "Integrations",
  icon: "🔗",
  subtitle:
    "How Docker integrates with CI/CD, cloud platforms, orchestrators, and backends.",
  tags: ["github-actions", "kubernetes", "aws", "cicd", "cloud"],
  meta: ["📖 20 min", "🟣 Advanced"],
  sections: [
    {
      id: "github-actions",
      title: "GitHub Actions CI/CD",
      content: `<p>Docker is the backbone of modern CI/CD. GitHub Actions uses containers internally and has excellent Docker support.</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: ".github/workflows/docker.yml",
          code: `name: Build and Push Docker Image
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.event_name == 'push' }}
          tags: |
            myuser/myapp:latest
            myuser/myapp:\${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
          explanation:
            "This workflow builds on every push, only pushes to registry on main branch. Uses GitHub Actions cache for faster builds.",
        },
      ],
      diagrams: [
        {
          type: "mermaid",
          title: "CI/CD Pipeline Flow",
          code: `graph LR
    A["git push"] --> B["GitHub Actions<br>Triggered"]
    B --> C["Checkout<br>Code"]
    C --> D["Build Docker<br>Image"]
    D --> E["Run Tests<br>in Container"]
    E --> F{"Tests<br>Pass?"}
    F -->|Yes| G["Push to<br>Registry"]
    F -->|No| H["Fail Build"]
    G --> I["Deploy to<br>Production"]
    
    style G fill:#10b981,color:#000
    style H fill:#ef4444,color:#fff`,
        },
      ],
      keyTakeaways: [
        "GitHub Actions has native Docker build/push actions",
        "Use Buildx for multi-platform builds",
        "Cache layers with GitHub Actions cache (type=gha)",
        "Tag images with git SHA for traceability",
        "Only push on main branch merges",
      ],
    },
    {
      id: "kubernetes-integration",
      title: "Kubernetes Integration",
      content: `<p>Docker images are the deployment unit for Kubernetes. Here's how they connect:</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: "Kubernetes Deployment using Docker image",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myuser/myapp:v1.2.0   # Docker image
          ports:
            - containerPort: 3000
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30`,
          explanation:
            "Kubernetes pulls Docker images from registries and manages their lifecycle across the cluster",
        },
      ],
      keyTakeaways: [
        "Docker builds images → Kubernetes runs them at scale",
        "K8s pulls images from Docker Hub or private registries",
        "Kubernetes uses containerd (not Docker) as runtime",
        "Docker Compose for dev, Kubernetes for production orchestration",
      ],
    },
    {
      id: "cloud-platforms",
      title: "Cloud Platform Integration",
      content: `<p>All major cloud providers have Docker-native services:</p>
      <h4>AWS</h4>
      <ul>
        <li><strong>ECR</strong> (Elastic Container Registry) — private Docker registry</li>
        <li><strong>ECS</strong> (Elastic Container Service) — AWS-native container orchestration</li>
        <li><strong>EKS</strong> (Elastic Kubernetes Service) — managed Kubernetes</li>
        <li><strong>Fargate</strong> — serverless containers (no server management)</li>
      </ul>
      <h4>Google Cloud</h4>
      <ul>
        <li><strong>GCR/Artifact Registry</strong> — container image storage</li>
        <li><strong>GKE</strong> — managed Kubernetes</li>
        <li><strong>Cloud Run</strong> — serverless containers</li>
      </ul>
      <h4>Azure</h4>
      <ul>
        <li><strong>ACR</strong> — Azure Container Registry</li>
        <li><strong>AKS</strong> — Azure Kubernetes Service</li>
        <li><strong>Container Instances</strong> — serverless containers</li>
      </ul>`,
      diagrams: [
        {
          type: "mermaid",
          title: "Cloud Deployment Flow",
          code: `graph LR
    DEV["Developer"] --> CI["CI/CD Pipeline"]
    CI --> REG["Container Registry<br>ECR / GCR / ACR"]
    REG --> ORCH{"Orchestrator"}
    ORCH --> ECS["AWS ECS"]
    ORCH --> GKE["Google GKE"]
    ORCH --> AKS["Azure AKS"]
    
    style REG fill:#f59e0b,color:#000`,
        },
      ],
      keyTakeaways: [
        "Every cloud provider has Docker-native services",
        "Registry → Orchestrator → Running Containers",
        "Serverless options (Fargate, Cloud Run) eliminate server management",
        "Use cloud-specific registries for faster pulls within the same cloud",
      ],
    },
    {
      id: "backend-apps",
      title: "Backend Application Integration",
      content: `<p>Docker integrates with virtually every backend stack. Here are common patterns:</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: "Full-stack Node.js + PostgreSQL + Redis",
          code: `services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
  
  db:
    image: postgres:18-alpine
    volumes: [db-data:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: pass
      POSTGRES_USER: user
      POSTGRES_DB: myapp
    healthcheck:
      test: pg_isready -U user
      interval: 5s
  
  cache:
    image: redis:8-alpine

volumes:
  db-data:`,
          explanation:
            "Complete backend stack with database, cache, and API — all in one compose file",
        },
        {
          language: "yaml",
          title: "Python Django + Nginx",
          code: `services:
  web:
    build: .
    command: gunicorn myproject.wsgi:application --bind 0.0.0.0:8000
    volumes: [./app:/app, static:/app/static]
  
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - static:/usr/share/nginx/html/static:ro
    depends_on: [web]

volumes:
  static:`,
          explanation:
            "Nginx serves static files, Gunicorn serves the Django app. Shared volume for static files.",
        },
        {
          language: "yaml",
          title: "Python Django + Caddy (modern alternative)",
          code: `services:
  web:
    build: .
    command: gunicorn myproject.wsgi:application --bind 0.0.0.0:8000
    volumes: [./app:/app, static:/app/static]
  
  caddy:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - static:/srv/static:ro
      - caddy_data:/data
    depends_on: [web]

volumes:
  static:
  caddy_data:`,
          explanation:
            "Caddy provides automatic HTTPS and simpler config. Use Caddyfile instead of nginx.conf.",
        },
      ],
      keyTakeaways: [
        "Any backend framework works with Docker",
        "Use compose for local development stacks",
        "Nginx and Caddy are both great reverse proxy choices",
        "Caddy has automatic HTTPS — simpler for production",
        "Use health checks to ensure proper startup order",
      ],
    },
    {
      id: "github-actions-complete-workflow",
      title: "GitHub Actions — A Complete Working Workflow",
      content: `<p>A production-ready pipeline should publish only trusted images. For container release workflows, that means building on every change if needed, but pushing to the registry only from reviewed code on <code>main</code>. The workflow below uses <code>on.push.branches: [main]</code>, so pull requests do not publish images and cannot pollute your registry with unreviewed artifacts.</p>
      <p>The login step intentionally uses <code>GITHUB_TOKEN</code> instead of a personal access token. <code>GITHUB_TOKEN</code> is injected automatically by GitHub Actions for each workflow run, scoped to the repository, short-lived, and rotated by the platform. This removes the need to create and manage long-lived registry credentials in repository secrets for normal GHCR publishing flows.</p>
      <p><code>docker/metadata-action</code> solves a common operational issue: manual tagging drift. It generates tags and OCI labels directly from git context, so image metadata stays consistent across builds. The OCI label set (for example <code>org.opencontainers.image.source</code>, <code>org.opencontainers.image.revision</code>, and creation timestamps) is embedded in the image manifest and improves traceability during debugging, audits, and incident response.</p>
      <p><code>docker/build-push-action</code> then performs the BuildKit build and push using metadata-action outputs. With <code>cache-from: type=gha</code> and <code>cache-to: type=gha,mode=max</code>, BuildKit layer cache is persisted through the GitHub Actions cache backend and reused across later runs. Repositories with heavy dependency install layers usually see large build-time improvements because dependency layers change less often than application code layers.</p>
      <p>Using both <code>type=sha</code> and <code>type=raw,value=latest</code> gives two deployment handles: an immutable commit tag such as <code>sha-abc1234</code> for reproducibility, and a moving <code>latest</code> tag for environments that intentionally track the newest mainline build. Keep both when you want deterministic rollbacks and convenient default pulls at the same time.</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: ".github/workflows/docker.yml",
          code: `name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=sha
            type=raw,value=latest

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
          explanation:
            "Main-only trigger prevents unreviewed PR image publication; GITHUB_TOKEN authenticates to GHCR with short-lived scoped credentials; metadata-action generates SHA/latest tags and OCI labels; build-push-action reuses BuildKit cache via type=gha for faster subsequent runs.",
        },
      ],
      keyTakeaways: [
        "Publish container images from main only to avoid unreviewed registry artifacts",
        "GITHUB_TOKEN is auto-provisioned, repository-scoped, temporary, and usually safer than long-lived PATs for GHCR in-repo publishing",
        "metadata-action auto-generates stable tags and OCI-standard provenance labels from git context",
        "type=sha produces immutable commit tags (for traceability) while latest remains a moving convenience tag",
        "BuildKit cache-from/cache-to with type=gha improves repeat build speed significantly on CI",
      ],
    },
    {
      id: "gitlab-ci-differences",
      title: "Docker in GitLab CI — Key Differences from GitHub Actions",
      content: `<p>GitLab CI uses a different control surface than GitHub Actions. Pipelines are defined in <code>.gitlab-ci.yml</code>, and runner behavior depends heavily on executor type. If your job container needs to run <code>docker build</code>, you usually add a Docker-in-Docker service (<code>docker:dind</code>) so the job has a Docker daemon to talk to.</p>
      <p>DinD works, but it has a clear trade-off: it typically requires privileged runner mode, which weakens isolation compared with fully unprivileged builds. The secure default in modern DinD setups is TLS-enabled daemon communication. Setting <code>DOCKER_TLS_CERTDIR: "/certs"</code> keeps the Docker socket protected; older patterns that set it to empty disabled TLS and are now considered less safe.</p>
      <p>In environments where privileged mode is restricted, Kaniko is a practical alternative. Kaniko builds images from Dockerfiles without a Docker daemon and without privileged mode. It executes layer resolution in userspace and pushes directly to registries, which is why security-sensitive teams and shared-runner setups often prefer it.</p>
      <p>GitLab also ships first-class registry variables automatically in CI jobs. <code>CI_REGISTRY</code>, <code>CI_REGISTRY_USER</code>, <code>CI_REGISTRY_PASSWORD</code>, and <code>CI_REGISTRY_IMAGE</code> allow authenticated pushes to each project's built-in path at <code>registry.gitlab.com/namespace/project</code> without hardcoding credentials in pipeline files.</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: ".gitlab-ci.yml (DinD approach)",
          code: `image: docker:26

services:
  - docker:26-dind

variables:
  DOCKER_TLS_CERTDIR: "/certs"

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  only:
    - main`,
          explanation:
            "Runs Docker CLI inside the job container against docker:dind, logs in with injected GitLab registry credentials, and pushes a commit-tagged image from main.",
        },
        {
          language: "yaml",
          title: ".gitlab-ci.yml (Kaniko approach)",
          code: `build:
  image:
    name: gcr.io/kaniko-project/executor:v1.23.0-debug
    entrypoint: [""]
  script:
    - /kaniko/executor
      --context $CI_PROJECT_DIR
      --dockerfile $CI_PROJECT_DIR/Dockerfile
      --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  only:
    - main`,
          explanation:
            "Builds and pushes without Docker daemon or privileged DinD; preferred when runner policy disallows privileged mode.",
        },
      ],
      keyTakeaways: [
        "GitLab CI pipelines live in .gitlab-ci.yml, not .github/workflows/*.yml",
        "DinD enables docker build in CI jobs but usually requires privileged mode and reduced isolation",
        'DOCKER_TLS_CERTDIR="/certs" enables TLS-secured daemon communication for DinD',
        "Kaniko builds OCI images without Docker daemon or privileged mode, ideal for stricter shared-runner policies",
        "GitLab injected CI_REGISTRY variables support direct pushes to registry.gitlab.com/namespace/project",
      ],
    },
    {
      id: "compose-healthchecks-in-ci",
      title: "Health Checks in Docker Compose and Their Role in CI",
      content: `<p>CI failures are often timing problems, not code problems. A container can be marked as running while the service inside it is still initializing. For databases this gap is common: PostgreSQL may have started its process, but it can still reject client connections until initialization completes.</p>
      <p>Health checks close that gap with explicit readiness logic. In Compose, <code>test</code> defines the probe command, <code>interval</code> sets frequency, <code>timeout</code> caps per-check execution time, <code>retries</code> sets failure threshold before unhealthy state, and <code>start_period</code> provides a grace window where failures are ignored for counting. During <code>start_period</code> checks still run, but failures do not increment the retry counter.</p>
      <p>Once health checks exist, <code>depends_on</code> can enforce readiness ordering through <code>condition: service_healthy</code>. This is critical in integration-test pipelines where API startup should wait until the database is genuinely ready. Without this condition, startup races cause intermittent connection-refused errors that are hard to reproduce and waste CI time.</p>
      <p>For PostgreSQL, <code>pg_isready</code> is the correct readiness probe because it performs a PostgreSQL-level readiness check instead of only verifying that TCP port 5432 is open. A plain TCP check can pass before authentication, database selection, or startup recovery is actually complete.</p>`,
      codeExamples: [
        {
          language: "yaml",
          title: "docker-compose.yml",
          code: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/appdb`,
          explanation:
            "db is considered ready only after pg_isready succeeds; api startup waits for service_healthy to reduce flaky integration test failures caused by race conditions.",
        },
      ],
      keyTakeaways: [
        "Running is not the same as healthy; process start does not guarantee dependency readiness",
        "Healthcheck fields work together: test, interval, timeout, retries, and start_period control readiness behavior",
        "start_period allows startup grace time while probes run, preventing premature unhealthy status",
        "depends_on with condition: service_healthy enforces deterministic startup order in Compose v2",
        "pg_isready is a protocol-aware PostgreSQL readiness probe and more reliable than generic port checks",
      ],
    },
  ],
};
