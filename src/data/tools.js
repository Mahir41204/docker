// TOOLS.JS — Tools & Alternatives
export const tools = {
  id:'tools',title:'Tools & Alternatives',icon:'🛠️',
  subtitle:'Docker alternatives and complementary tools — when to use each.',
  tags:['podman','containerd','kubernetes','virtual-machines','comparison'],
  meta:['📖 15 min','🟡 Intermediate'],
  sections:[
    {
      id:'comparison-overview',title:'Comparison Overview',
      content:`<p>Docker isn't the only containerization tool. Understanding the landscape helps you pick the right tool.</p>`,
      diagrams:[{type:'mermaid',title:'Containerization Landscape',code:`graph TB
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
    CRIO --> RUNC`}]
    },
    {
      id:'podman',title:'Podman',
      content:`<p><strong>Podman</strong> is a daemonless container engine developed by Red Hat. It's the closest Docker alternative.</p>
      <h4>Key Differences from Docker</h4>
      <ul>
        <li><strong>No daemon</strong> — runs containers directly as child processes (no dockerd)</li>
        <li><strong>Rootless by default</strong> — runs without root privileges</li>
        <li><strong>CLI compatible</strong> — <code>alias docker=podman</code> works for most commands</li>
        <li><strong>Pods</strong> — native pod concept (like Kubernetes pods)</li>
        <li><strong>Systemd integration</strong> — generates systemd unit files</li>
      </ul>
      <h4>When to Use Podman</h4>
      <ul>
        <li>Security-sensitive environments (rootless by default)</li>
        <li>RHEL/Fedora systems (native integration)</li>
        <li>When you want to avoid the daemon architecture</li>
        <li>Kubernetes development (pod-native workflow)</li>
      </ul>`,
      codeExamples:[{language:'bash',title:'Podman vs Docker commands',code:'# They\'re nearly identical:\npodman run -d -p 8080:80 nginx\npodman ps\npodman build -t myapp .\n\n# Podman-specific: generate Kubernetes YAML\npodman generate kube my-container > pod.yaml\n\n# Podman-specific: pods\npodman pod create --name myapp\npodman run --pod myapp nginx',explanation:'Most Docker commands work with Podman by just replacing "docker" with "podman"'}],
      keyTakeaways:['Daemonless — no background service needed','Rootless by default — more secure','CLI compatible with Docker','Native pod support for K8s workflows','Best for: security-focused, RHEL/Fedora environments']
    },
    {
      id:'containerd',title:'containerd',
      content:`<p><strong>containerd</strong> is an industry-standard container runtime. It's actually what Docker uses under the hood.</p>
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
      keyTakeaways:['containerd runs INSIDE Docker — it\'s a core component','Kubernetes uses containerd directly (no Docker needed)','Most users never interact with containerd','It\'s the runtime, not the developer tool']
    },
    {
      id:'kubernetes',title:'Kubernetes (K8s) — High-Level Comparison',
      content:`<p><strong>Kubernetes</strong> is a container <em>orchestrator</em> — it manages containers across multiple machines. Docker runs containers; Kubernetes manages them at scale.</p>`,
      diagrams:[{type:'mermaid',title:'Docker vs Kubernetes Scope',code:`graph TB
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
    Docker -->|"Images feed into"| K8s`}],
      alerts:[{type:'info',title:'They\'re Complementary, Not Competitors',text:'Docker <strong>builds</strong> container images. Kubernetes <strong>orchestrates</strong> them across clusters. Most K8s deployments use Docker-built images running on containerd.'}],
      keyTakeaways:['Docker = build + run containers (single host)','Kubernetes = orchestrate containers (multi-host)','K8s handles scaling, healing, discovery, updates','K8s uses containerd (not Docker) as its runtime','Learn Docker first, then Kubernetes']
    },
    {
      id:'web-servers',title:'Web Servers — Nginx vs Caddy',
      content:`<p>Two popular web servers you'll use heavily with Docker as reverse proxies and static file servers:</p>
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
      codeExamples:[
        {language:'text',title:'Nginx config (nginx.conf)',code:`server {
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
}`,explanation:'Nginx requires manual configuration for reverse proxying and HTTPS'},
        {language:'text',title:'Caddy config (Caddyfile)',code:`example.com {
    reverse_proxy api:3000
    file_server /static/* {
        root /srv
    }
}`,explanation:'Caddy achieves the same result in 5 lines and auto-provisions HTTPS'},
        {language:'yaml',title:'Docker Compose — Nginx reverse proxy',code:`services:
  webserver:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [api]
  
  api:
    build: .
    expose: ["3000"]`,explanation:'Nginx as reverse proxy, API only exposed internally'},
        {language:'yaml',title:'Docker Compose — Caddy reverse proxy',code:`services:
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
  caddy_data:`,explanation:'Caddy as reverse proxy with automatic HTTPS. caddy_data volume stores certificates.'}
      ],
      comparisonTable:{
        headers:['Feature','Nginx','Caddy'],
        rows:[
          ['Learning Curve','Steep','Easy'],
          ['HTTPS','Manual (Certbot)','Automatic (built-in)'],
          ['Config Syntax','Complex','Simple (Caddyfile)'],
          ['Performance','Excellent','Very Good'],
          ['HTTP/3','Via module','Built-in'],
          ['Docker Image Size','~45MB (alpine)','~45MB (alpine)'],
          ['Community','Massive','Growing fast'],
          ['Best For','High-traffic production','Quick setup, auto-HTTPS']
        ]
      },
      keyTakeaways:['Nginx: battle-tested, highest performance, manual HTTPS','Caddy: automatic HTTPS, simple config, modern features','Both work great as Docker reverse proxies','Use Caddy for simplicity, Nginx for maximum control','caddy:2-alpine and nginx:alpine are both ~45MB']
    },
    {
      id:'vms-vs-containers',title:'Virtual Machines — Detailed Contrast',
      content:`<p>Containers and VMs solve different problems and can be used together:</p>`,
      comparisonTable:{
        headers:['Feature','Containers (Docker)','Virtual Machines'],
        rows:[
          ['Startup Time','Milliseconds','Minutes'],
          ['Size','MBs (10-500MB)','GBs (1-20GB)'],
          ['Performance','Near-native','~5-10% overhead'],
          ['Isolation','Process-level (namespaces)','Hardware-level (hypervisor)'],
          ['OS','Shares host kernel','Full guest OS per VM'],
          ['Density','100s per host','10s per host'],
          ['Portability','Highly portable (OCI image)','Less portable (VM format)'],
          ['Security','Good (with best practices)','Stronger (kernel isolation)'],
          ['Use Case','Microservices, CI/CD, dev','Legacy apps, different OS, strong isolation'],
          ['Resource Usage','Low','High']
        ]
      },
      keyTakeaways:['Containers: fast, light, great for microservices','VMs: stronger isolation, full OS, good for legacy apps','You can run containers INSIDE VMs (common pattern)','Cloud instances (EC2, GCE) are VMs running containers']
    }
  ]
};
