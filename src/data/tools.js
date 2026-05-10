// TOOLS.JS — Tools & Alternatives
export const tools = {
  id: "tools",
  title: "Tools & Alternatives",
  icon: "🛠️",
  subtitle: "Docker alternatives and complementary tools — when to use each.",
  tags: [
    "podman",
    "containerd",
    "kubernetes",
    "virtual-machines",
    "comparison",
  ],
  meta: ["📖 15 min", "🟡 Intermediate"],
  sections: [
    {
      id: "comparison-overview",
      title: "Comparison Overview",
      content: `<p>Docker isn't the only containerization tool. Understanding the landscape helps you pick the right tool.</p>`,
      diagrams: [
        {
          type: "mermaid",
          title: "Containerization Landscape",
          code: `graph TB
    subgraph Orchestration["Orchestration Layer"]
        K8S["Kubernetes"]
        SWARM["Docker Swarm"]
    end
    subgraph Runtime["Container Runtime"]
        DOCKER["Docker Engine"]
        PODMAN["Podman"]
        CRIO["CRI-O"]
    end
    subgraph LowLevel["Low-Level Runtime"]
        CONTAINERD["containerd"]
        RUNC["runc"]
    end
    subgraph VM["Virtual Machines"]
        VBOX["VirtualBox"]
        VMW["VMware"]
        KVM["KVM/QEMU"]
    end
    K8S --> CONTAINERD
    K8S --> CRIO
    DOCKER --> CONTAINERD
    CONTAINERD --> RUNC
    PODMAN --> RUNC
    CRIO --> RUNC`,
        },
      ],
    },
    {
      id: "podman",
      title: "Podman",
      content: `<p><strong>Podman</strong> is a daemonless container engine developed by Red Hat. It's the closest Docker alternative.</p>
      <h4>Key Differences from Docker</h4>
      <ul>
        <li><strong>No daemon</strong> — runs containers directly as child processes (no dockerd)</li>
        <li><strong>Rootless by default</strong> — runs without root privileges</li>
          code: "# syntax=docker/dockerfile:1.7\nFROM node:24-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN --mount=type=cache,target=/root/.npm \\\nnpm ci\nCOPY . .\nCMD [\"node\", \"server.js\"]",
        <li><strong>Pods</strong> — native pod concept (like Kubernetes pods)</li>
        <li><strong>Systemd integration</strong> — generates systemd unit files</li>
      </ul>
      <h4>When to Use Podman</h4>
      <ul>
        <li>Security-sensitive environments (rootless by default)</li>
          code: "# syntax=docker/dockerfile:1.7\nFROM alpine:3.21\nRUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\\nnpm install",
        <li>When you want to avoid the daemon architecture</li>
        <li>Kubernetes development (pod-native workflow)</li>
      </ul>`,
      codeExamples: [
        {
          language: "bash",
          title: "Podman vs Docker commands",
          code: "# They're nearly identical:\npodman run -d -p 8080:80 nginx\npodman ps\npodman build -t myapp .\n\n# Podman-specific: generate Kubernetes YAML\npodman generate kube my-container > pod.yaml\n\n# Podman-specific: pods\npodman pod create --name myapp\npodman run --pod myapp nginx",
          explanation:
            'Most Docker commands work with Podman by just replacing "docker" with "podman"',
        },
      ],
      keyTakeaways: [
        "Daemonless — no background service needed",
        "Rootless by default — more secure",
        "CLI compatible with Docker",
        "Native pod support for K8s workflows",
        "Best for: security-focused, RHEL/Fedora environments",
      ],
    },
    {
      id: "containerd",
      title: "containerd",
      content: `<p><strong>containerd</strong> is an industry-standard container runtime. It's actually what Docker uses under the hood.</p>
      <ul>
        <li>CNCF graduated project</li>
        <li>Used by Docker, Kubernetes, cloud providers</li>
        <li>Handles image pull/push, container execution, storage, networking</li>
        <li>Not user-facing — it's infrastructure</li>
      </ul>
      <h4>When to Use containerd Directly</h4>
      <ul>
        <li>Kubernetes clusters (default CRI since K8s 1.24)</li>
        <li>Minimal container runtimes (no Docker overhead)</li>
        <li>Cloud-provider managed services</li>
      </ul>`,
      keyTakeaways: [
        "containerd runs INSIDE Docker — it's a core component",
        "Kubernetes uses containerd directly (no Docker needed)",
        "Most users never interact with containerd",
        "It's the runtime, not the developer tool",
      ],
    },
    {
      id: "kubernetes",
      title: "Kubernetes (K8s) — High-Level Comparison",
      content: `<p><strong>Kubernetes</strong> is a container <em>orchestrator</em> — it manages containers across multiple machines. Docker runs containers; Kubernetes manages them at scale.</p>`,
      diagrams: [
        {
          type: "mermaid",
          title: "Docker vs Kubernetes Scope",
          code: `graph TB
    subgraph Docker["Docker Scope"]
        D1["Build Images"]
        D2["Run Containers"]
        D3["Local Development"]
        D4["Single Host"]
    end
    subgraph K8s["Kubernetes Scope"]
        K1["Multi-host Orchestration"]
        K2["Auto-scaling"]
        K3["Self-healing"]
        K4["Service Discovery"]
        K5["Rolling Updates"]
        K6["Secret Management"]
    end
    Docker -->|"Images feed into"| K8s`,
        },
      ],
      alerts: [
        {
          type: "info",
          title: "They're Complementary, Not Competitors",
          text: "Docker <strong>builds</strong> container images. Kubernetes <strong>orchestrates</strong> them across clusters. Most K8s deployments use Docker-built images running on containerd.",
        },
      ],
      keyTakeaways: [
        "Docker = build + run containers (single host)",
        "Kubernetes = orchestrate containers (multi-host)",
        "K8s handles scaling, healing, discovery, updates",
        "K8s uses containerd (not Docker) as its runtime",
        "Learn Docker first, then Kubernetes",
      ],
    },
    {
      id: "web-servers",
      title: "Web Servers — Nginx vs Caddy",
      content: `<p>Two popular web servers you'll use heavily with Docker as reverse proxies and static file servers:</p>
      <h4>Nginx</h4>
      <ul>
        <li><strong>Battle-tested</strong> — powers ~35% of the web</li>
        <li><strong>High performance</strong> — event-driven, low memory footprint</li>
        <li><strong>Configuration</strong> — manual config files, steep learning curve</li>
        <li><strong>HTTPS</strong> — manual certificate management (or use Certbot)</li>
        <li><strong>Docker image</strong>: <code>nginx:alpine</code></li>
      </ul>
      <h4>Caddy</h4>
      <ul>
        <li><strong>Modern</strong> — built in Go, designed for simplicity</li>
        <li><strong>Automatic HTTPS</strong> — provisions and renews TLS certificates automatically via Let's Encrypt</li>
        <li><strong>Simple config</strong> — Caddyfile syntax is far simpler than nginx.conf</li>
        <li><strong>HTTP/3 support</strong> — built-in with QUIC</li>
        <li><strong>Docker image</strong>: <code>caddy:2-alpine</code></li>
      </ul>`,
      codeExamples: [
        {
          language: "text",
          title: "Nginx config (nginx.conf)",
          code: `server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /usr/share/nginx/html/static/;
    }
}`,
          explanation:
            "Nginx requires manual configuration for reverse proxying and HTTPS",
        },
        {
          language: "text",
          title: "Caddy config (Caddyfile)",
          code: `example.com {
    reverse_proxy api:3000
    file_server /static/* {
        root /srv
    }
}`,
          explanation:
            "Caddy achieves the same result in 5 lines and auto-provisions HTTPS",
        },
        {
          language: "yaml",
          title: "Docker Compose — Nginx reverse proxy",
          code: `services:
  webserver:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [api]
  
  api:
    build: .
    expose: ["3000"]`,
          explanation: "Nginx as reverse proxy, API only exposed internally",
        },
        {
          language: "yaml",
          title: "Docker Compose — Caddy reverse proxy",
          code: `services:
  webserver:
    image: caddy:2-alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on: [api]
  
  api:
    build: .
    expose: ["3000"]

volumes:
  caddy_data:`,
          explanation:
            "Caddy as reverse proxy with automatic HTTPS. caddy_data volume stores certificates.",
        },
      ],
      comparisonTable: {
        headers: ["Feature", "Nginx", "Caddy"],
        rows: [
          ["Learning Curve", "Steep", "Easy"],
          ["HTTPS", "Manual (Certbot)", "Automatic (built-in)"],
          ["Config Syntax", "Complex", "Simple (Caddyfile)"],
          ["Performance", "Excellent", "Very Good"],
          ["HTTP/3", "Via module", "Built-in"],
          ["Docker Image Size", "~45MB (alpine)", "~45MB (alpine)"],
          ["Community", "Massive", "Growing fast"],
          ["Best For", "High-traffic production", "Quick setup, auto-HTTPS"],
        ],
      },
      keyTakeaways: [
        "Nginx: battle-tested, highest performance, manual HTTPS",
        "Caddy: automatic HTTPS, simple config, modern features",
        "Both work great as Docker reverse proxies",
        "Use Caddy for simplicity, Nginx for maximum control",
        "caddy:2-alpine and nginx:alpine are both ~45MB",
      ],
    },
    {
      id: "vms-vs-containers",
      title: "Virtual Machines — Detailed Contrast",
      content: `<p>Containers and VMs solve different problems and can be used together:</p>`,
      comparisonTable: {
        headers: ["Feature", "Containers (Docker)", "Virtual Machines"],
        rows: [
          ["Startup Time", "Milliseconds", "Minutes"],
          ["Size", "MBs (10-500MB)", "GBs (1-20GB)"],
          ["Performance", "Near-native", "~5-10% overhead"],
          [
            "Isolation",
            "Process-level (namespaces)",
            "Hardware-level (hypervisor)",
          ],
          ["OS", "Shares host kernel", "Full guest OS per VM"],
          ["Density", "100s per host", "10s per host"],
          [
            "Portability",
            "Highly portable (OCI image)",
            "Less portable (VM format)",
          ],
          [
            "Security",
            "Good (with best practices)",
            "Stronger (kernel isolation)",
          ],
          [
            "Use Case",
            "Microservices, CI/CD, dev",
            "Legacy apps, different OS, strong isolation",
          ],
          ["Resource Usage", "Low", "High"],
        ],
      },
      keyTakeaways: [
        "Containers: fast, light, great for microservices",
        "VMs: stronger isolation, full OS, good for legacy apps",
        "You can run containers INSIDE VMs (common pattern)",
        "Cloud instances (EC2, GCE) are VMs running containers",
      ],
    },
    {
      id: "podman-daemonless-alternative",
      title: "Podman — The Daemonless Alternative",
      content: `<p>Podman and Docker can look similar from the terminal, but their architecture is fundamentally different in a way that affects day-to-day operations and security posture. Docker relies on a long-running background service, <code>dockerd</code>, which manages container lifecycle for all users on the host. Podman removes that central daemon and launches containers as direct child processes of the user account that started them.</p>
      <p>That daemonless model changes the blast radius of failures. In a daemon-based design, a vulnerability in the daemon can impact every container managed by that daemon because it is a shared privileged control plane. In Podman, there is no always-on daemon process to compromise. A container compromise is still serious, but it does not automatically become a host-wide daemon compromise path in the same way.</p>
      <p>For developers, migration friction is low because Podman intentionally mirrors Docker CLI ergonomics. Most existing Dockerfiles, image names, and run commands work with minimal or zero changes. Teams often test migration by replacing Docker commands one by one in scripts and CI jobs, then validating image outputs and runtime behavior.</p>
      <p>Compose workflows are also supported. Historically this was done via <code>podman-compose</code>. In Podman 4.x and newer, <code>podman compose</code> is available and can use Docker Compose files directly, delegating to the Docker Compose binary when installed. This lets teams keep existing Compose definitions while changing the runtime underneath.</p>
      <p>Podman is especially practical on RHEL, CentOS Stream, and Fedora, where it is the default container tooling path and integrates cleanly with system packages and rootless workflows. If your requirement is rootless containers by default without daemon tuning, Podman is usually the most natural fit.</p>`,
      codeExamples: [
        {
          language: "bash",
          title: "Core Podman 4.x/5.x commands",
          code: "podman run -d --name web nginx:alpine\npodman ps\npodman build -t myapp .\npodman compose up -d",
          explanation:
            "These commands map directly to common Docker workflows: run a container, list running containers, build an image, and start a Compose stack.",
        },
      ],
      keyTakeaways: [
        "Podman has no long-running daemon; containers are child processes of the invoking user",
        "Rootless-by-default execution reduces privileged runtime exposure",
        "A daemon vulnerability class in Docker does not exist in the same form in Podman",
        "Podman CLI is intentionally Docker-compatible for run/build/ps workflows",
        "podman compose in 4.x/5.x supports Docker Compose files for low-friction adoption",
      ],
    },
    {
      id: "containerd-runtime-docker-uses",
      title: "containerd — The Runtime Docker Itself Uses",
      content: `<p>Many developers talk to Docker every day without realizing Docker is not the final runtime layer. Docker Engine orchestrates user intent, then delegates container execution responsibilities to <code>containerd</code>, a CNCF-graduated runtime used broadly in both standalone and Kubernetes environments.</p>
      <p>The layering is important for troubleshooting and platform design. Docker Engine communicates with containerd over gRPC. containerd then handles concrete lifecycle duties such as image pull/unpack operations, snapshot management for filesystem layers, process task creation, and runtime integration points including network attachment. For actual namespace and cgroup creation, containerd invokes <code>runc</code>, the OCI low-level runtime.</p>
      <p>In practical terms, the chain is: <strong>Docker CLI → Docker Engine → containerd → runc → container</strong>. Understanding this flow explains why modern Kubernetes clusters can run perfectly without Docker Engine installed. Kubernetes switched away from Docker as the default runtime path and, since Kubernetes 1.24, typically talks to containerd directly through CRI-compatible integrations.</p>
      <p>Direct interaction with containerd is common in advanced workflows. <code>nerdctl</code> provides a Docker-like command surface for containerd-native operations, including Compose support via <code>nerdctl compose</code>. On Kubernetes nodes, incident response often uses <code>crictl</code>, because CRI tools query the runtime directly rather than going through Docker commands that may not exist on the node.</p>
      <p>For production engineers, this distinction is not theoretical. If image pull failures, snapshotter issues, or runtime process errors occur in Kubernetes, diagnosis usually starts with runtime-level logs and CRI tooling, not Docker CLI output.</p>`,
      codeExamples: [
        {
          language: "bash",
          title: "containerd, nerdctl, and crictl commands",
          code: "# Check if containerd is running\nsystemctl status containerd\n\n# nerdctl mirrors Docker CLI\nnerdctl run -d --name web nginx:alpine\nnerdctl ps\nnerdctl build -t myapp .\n\n# crictl for Kubernetes node debugging\ncrictl ps\ncrictl logs <container-id>",
          explanation:
            "Use systemctl to verify runtime health, nerdctl for Docker-like containerd workflows, and crictl for runtime-level debugging on Kubernetes nodes.",
        },
      ],
      keyTakeaways: [
        "Docker Engine delegates runtime execution to containerd over gRPC",
        "containerd manages images, snapshots, tasks, and runtime lifecycle plumbing",
        "containerd calls runc to create OCI containers with namespaces and cgroups",
        "Kubernetes 1.24+ commonly uses containerd directly, bypassing Docker Engine",
        "nerdctl and crictl are the practical CLIs for containerd-native and K8s node debugging workflows",
      ],
    },
    {
      id: "buildkit-after-docker-23",
      title: "BuildKit — What Changed in Docker Builds After 23.0",
      content: `<p>BuildKit became the default build backend in Docker Engine 23.0, which changed how Dockerfiles are executed even when users keep running familiar <code>docker build</code> commands. The old builder executed instructions in a mostly linear pattern. BuildKit analyzes the build graph and can run independent stages in parallel, especially useful in multi-stage Dockerfiles where stages do not depend on one another.</p>
      <p>BuildKit also upgraded caching behavior. Instead of only relying on local layer cache reuse, it uses a content-addressable cache model that can be exported and imported across machines. This is critical for CI, where ephemeral workers would otherwise lose all cache between runs. Shared cache sources can dramatically cut build times for dependency-heavy projects.</p>
      <p>Two features matter most in real pipelines: cache mounts and secret mounts. Cache mounts (<code>RUN --mount=type=cache</code>) preserve package manager caches such as npm or Gradle directories between builds without embedding that cache data into the final image layers. Secret mounts (<code>RUN --mount=type=secret</code>) expose credentials only during a single build step and keep them out of image history.</p>
      <p>This solves a long-standing anti-pattern where teams injected tokens through environment variables and attempted cleanup later. Deleting a secret in a later layer does not erase it from previous layers, but secret mounts avoid writing it there in the first place.</p>
      <p>To ensure modern Dockerfile features are available, define the frontend explicitly with <code># syntax=docker/dockerfile:1.7</code>. Docker 23.x, 24.x, and 25.x ship with BuildKit enabled by default, while older versions can opt in via <code>DOCKER_BUILDKIT=1</code>.</p>`,
      codeExamples: [
        {
          language: "dockerfile",
          title: "Cache mount pattern",
          code: `# syntax=docker/dockerfile:1.7
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \\
npm ci
COPY . .
CMD ["node", "server.js"]`,
          explanation:
            "Keeps npm cache between builds for speed while preventing cache files from inflating final runtime image layers.",
        },
        {
          language: "dockerfile",
          title: "Secret mount pattern",
          code: `# syntax=docker/dockerfile:1.7
FROM alpine:3.21
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \\
npm install`,
          explanation:
            "Makes .npmrc available only for the RUN step; the secret is not committed to resulting image layers.",
        },
        {
          language: "bash",
          title: "BuildKit checks and compatibility",
          code: "# Pass secret at build time - never stored in the image\ndocker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .\n\n# Docker 23.0+ has BuildKit on by default\ndocker buildx version\n\n# For older versions, enable manually\nDOCKER_BUILDKIT=1 docker build -t myapp .",
          explanation:
            "Use buildx version to verify modern build tooling is present, then use BuildKit flags for secure and performant builds.",
        },
      ],
      keyTakeaways: [
        "BuildKit is the default Docker build backend in Engine 23.x and later",
        "Independent Dockerfile stages can build in parallel for better performance",
        "Content-addressable cache supports cross-machine reuse in CI/CD",
        "Cache mounts speed dependency installs without increasing final image size",
        "Secret mounts keep credentials out of image layers and history",
      ],
    },
  ],
};
