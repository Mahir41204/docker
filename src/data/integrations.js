// INTEGRATIONS.JS — CI/CD, K8s, Cloud, Backend integrations
export const integrations = {
  id:'integrations',title:'Integrations',icon:'🔗',
  subtitle:'How Docker integrates with CI/CD, cloud platforms, orchestrators, and backends.',
  tags:['github-actions','kubernetes','aws','cicd','cloud'],
  meta:['📖 20 min','🟣 Advanced'],
  sections:[
    {
      id:'github-actions',title:'GitHub Actions CI/CD',
      content:`<p>Docker is the backbone of modern CI/CD. GitHub Actions uses containers internally and has excellent Docker support.</p>`,
      codeExamples:[{language:'yaml',title:'.github/workflows/docker.yml',code:`name: Build and Push Docker Image
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
          cache-to: type=gha,mode=max`,explanation:'This workflow builds on every push, only pushes to registry on main branch. Uses GitHub Actions cache for faster builds.'}],
      diagrams:[{type:'mermaid',title:'CI/CD Pipeline Flow',code:`graph LR
    A["git push"] --> B["GitHub Actions<br>Triggered"]
    B --> C["Checkout<br>Code"]
    C --> D["Build Docker<br>Image"]
    D --> E["Run Tests<br>in Container"]
    E --> F{"Tests<br>Pass?"}
    F -->|Yes| G["Push to<br>Registry"]
    F -->|No| H["Fail Build"]
    G --> I["Deploy to<br>Production"]
    
    style G fill:#10b981,color:#000
    style H fill:#ef4444,color:#fff`}],
      keyTakeaways:['GitHub Actions has native Docker build/push actions','Use Buildx for multi-platform builds','Cache layers with GitHub Actions cache (type=gha)','Tag images with git SHA for traceability','Only push on main branch merges']
    },
    {
      id:'kubernetes-integration',title:'Kubernetes Integration',
      content:`<p>Docker images are the deployment unit for Kubernetes. Here's how they connect:</p>`,
      codeExamples:[{language:'yaml',title:'Kubernetes Deployment using Docker image',code:`apiVersion: apps/v1
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
            periodSeconds: 30`,explanation:'Kubernetes pulls Docker images from registries and manages their lifecycle across the cluster'}],
      keyTakeaways:['Docker builds images → Kubernetes runs them at scale','K8s pulls images from Docker Hub or private registries','Kubernetes uses containerd (not Docker) as runtime','Docker Compose for dev, Kubernetes for production orchestration']
    },
    {
      id:'cloud-platforms',title:'Cloud Platform Integration',
      content:`<p>All major cloud providers have Docker-native services:</p>
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
      diagrams:[{type:'mermaid',title:'Cloud Deployment Flow',code:`graph LR
    DEV["Developer"] --> CI["CI/CD Pipeline"]
    CI --> REG["Container Registry<br>ECR / GCR / ACR"]
    REG --> ORCH{"Orchestrator"}
    ORCH --> ECS["AWS ECS"]
    ORCH --> GKE["Google GKE"]
    ORCH --> AKS["Azure AKS"]
    
    style REG fill:#f59e0b,color:#000`}],
      keyTakeaways:['Every cloud provider has Docker-native services','Registry → Orchestrator → Running Containers','Serverless options (Fargate, Cloud Run) eliminate server management','Use cloud-specific registries for faster pulls within the same cloud']
    },
    {
      id:'backend-apps',title:'Backend Application Integration',
      content:`<p>Docker integrates with virtually every backend stack. Here are common patterns:</p>`,
      codeExamples:[
        {language:'yaml',title:'Full-stack Node.js + PostgreSQL + Redis',code:`services:
  api:
    build: ./backend
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
  
  db:
    image: postgres:16-alpine
    volumes: [db-data:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: pass
      POSTGRES_USER: user
      POSTGRES_DB: myapp
    healthcheck:
      test: pg_isready -U user
      interval: 5s
  
  cache:
    image: redis:7-alpine

volumes:
  db-data:`,explanation:'Complete backend stack with database, cache, and API — all in one compose file'},
        {language:'yaml',title:'Python Django + Nginx',code:`services:
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
  static:`,explanation:'Nginx serves static files, Gunicorn serves the Django app. Shared volume for static files.'}
      ],
      keyTakeaways:['Any backend framework works with Docker','Use compose for local development stacks','Keep the same compose structure close to production','Use health checks to ensure proper startup order']
    }
  ]
};
