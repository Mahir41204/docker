// SYSTEM-DESIGN.JS — Docker in system design
export const systemDesign = {
  id:'system-design',title:'System Design Usage',icon:'🏗️',
  subtitle:'Where Docker fits in system design, microservices, and deployment pipelines.',
  tags:['system-design','microservices','architecture','deployment','pipeline'],
  meta:['📖 15 min','🔴 Expert'],
  sections:[
    {
      id:'docker-in-system-design',title:'Where Docker Fits in System Design',
      content:`<p>Docker has become a fundamental building block in modern system design. Here's why architects rely on it:</p>
      <ul>
        <li><strong>Consistency</strong> — same image runs identically across all environments</li>
        <li><strong>Scalability</strong> — spin up/down instances in seconds</li>
        <li><strong>Isolation</strong> — services can't interfere with each other</li>
        <li><strong>Portability</strong> — deploy anywhere: on-prem, AWS, GCP, Azure</li>
        <li><strong>Resource efficiency</strong> — higher density than VMs</li>
      </ul>`,
      diagrams:[{type:'mermaid',title:'Docker in a Modern System Architecture',code:`graph TB
    Client["Client<br>Browser/Mobile"] --> CDN["CDN<br>CloudFront"]
    CDN --> LB["Load Balancer<br>ALB/Nginx"]
    LB --> GW["API Gateway<br>Container"]
    GW --> AUTH["Auth Service<br>Container"]
    GW --> USER["User Service<br>Container"]
    GW --> ORDER["Order Service<br>Container"]
    USER --> DBUSER["User DB<br>Container + Volume"]
    ORDER --> DBORDER["Order DB<br>Container + Volume"]
    ORDER --> MQ["Message Queue<br>RabbitMQ Container"]
    MQ --> NOTIFY["Notification Service<br>Container"]
    MQ --> ANALYTICS["Analytics Worker<br>Container"]
    
    style GW fill:#22d3ee,color:#000
    style MQ fill:#f59e0b,color:#000`}]
    },
    {
      id:'microservices-role',title:'Docker\'s Role in Microservices',
      content:`<p>Docker is the enabler of microservices architecture. Before containers, running 20+ services on one machine was impractical.</p>
      <h4>Why Docker + Microservices Work Together</h4>
      <ul>
        <li><strong>Service isolation</strong> — each service in its own container with its own dependencies</li>
        <li><strong>Independent deployment</strong> — update one service without affecting others</li>
        <li><strong>Technology freedom</strong> — each service can use a different language/framework</li>
        <li><strong>Scalability</strong> — scale individual services based on demand</li>
        <li><strong>Fault isolation</strong> — one service crashing doesn't bring down others</li>
      </ul>`,
      diagrams:[{type:'mermaid',title:'Monolith vs Microservices',code:`graph TB
    subgraph Monolith["Monolith (Single Container)"]
        M1["Auth + Users + Orders + Payments<br>All in one process<br>One database"]
    end
    subgraph Micro["Microservices (Multiple Containers)"]
        S1["Auth<br>Container"]
        S2["Users<br>Container"]
        S3["Orders<br>Container"]
        S4["Payments<br>Container"]
        D1["Auth DB"]
        D2["Users DB"]
        D3["Orders DB"]
        S1 --- D1
        S2 --- D2
        S3 --- D3
    end`}],
      keyTakeaways:['Docker makes microservices practical','Each service: own container, own dependencies, own lifecycle','Scale services independently based on load','Different teams can own different services','Trade-off: more operational complexity']
    },
    {
      id:'deployment-pipelines',title:'Docker in Deployment Pipelines',
      content:`<p>Docker creates a clean separation between build and deploy stages:</p>`,
      diagrams:[{type:'mermaid',title:'Complete Deployment Pipeline',code:`graph LR
    A["Source Code<br>GitHub"] --> B["CI Build<br>docker build"]
    B --> C["Test<br>docker run tests"]
    C --> D["Security Scan<br>Trivy/Scout"]
    D --> E["Push Image<br>Registry"]
    E --> F["Staging Deploy<br>docker compose"]
    F --> G["Integration Tests"]
    G --> H{"Approved?"}
    H -->|Yes| I["Production Deploy<br>K8s / ECS"]
    H -->|No| J["Fix & Retry"]
    
    style E fill:#22d3ee,color:#000
    style I fill:#10b981,color:#000
    style J fill:#ef4444,color:#fff`}],
      alerts:[{type:'info',title:'Immutable Deployments',text:'With Docker, you never "update" a running server. You build a new image, test it, and replace the old containers. This is called <strong>immutable infrastructure</strong> — the most reliable deployment pattern.'}],
      keyTakeaways:['Build once → deploy everywhere (dev, staging, prod)','Images are immutable — never patch running containers','Tag images with version/SHA for rollback capability','Automate the entire pipeline with CI/CD','Blue-green and canary deployments are natural with containers']
    }
  ]
};
