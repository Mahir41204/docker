// ============================================
// OVERVIEW.JS — What Docker is, why it exists
// ============================================

export const overview = {
  id: 'overview',
  title: 'Docker Overview',
  icon: '🐳',
  subtitle: 'What Docker is, why containerization exists, and how it compares to virtual machines',
  tags: ['docker', 'containers', 'virtualization', 'overview'],
  meta: ['📖 10 min read', '🟢 Beginner'],
  sections: [
    {
      id: 'what-is-docker',
      title: 'What is Docker?',
      content: `
        <p><strong>Simple explanation:</strong> Docker is like a shipping container for software. Just as shipping containers standardized global trade by providing a uniform way to transport goods regardless of what's inside, Docker containers package your application with everything it needs to run — code, runtime, libraries, and settings — so it works identically everywhere.</p>
        <p><strong>Technical definition:</strong> Docker is an open-source platform that automates the deployment, scaling, and management of applications using <em>OS-level virtualization</em>. It packages applications into standardized units called <strong>containers</strong> that include everything needed to run: code, runtime, system tools, libraries, and settings.</p>
        <p>Docker uses Linux kernel features — <strong>namespaces</strong> for isolation and <strong>cgroups</strong> for resource control — to create lightweight, portable, and consistent environments.</p>
      `,
      images: [
        {
          url: 'https://www.docker.com/wp-content/uploads/2021/11/docker-containerized-appliction-blue-border_2.png',
          alt: 'Docker containerized application',
          caption: 'Docker packages applications with all dependencies into portable containers'
        }
      ],
      keyTakeaways: [
        'Docker packages apps + dependencies into portable containers',
        'Containers share the host OS kernel — they\'re NOT virtual machines',
        'Works the same on your laptop, staging server, and production',
        '"It works on my machine" → "It works in the container"'
      ]
    },
    {
      id: 'why-containerization',
      title: 'Why Does Containerization Exist?',
      content: `
        <h4>The Problem Before Docker</h4>
        <p>Before containers, deploying software was painful:</p>
        <ul>
          <li><strong>"Works on my machine" syndrome</strong> — different OS, libraries, or configurations between dev and production caused mysterious failures</li>
          <li><strong>Dependency hell</strong> — App A needs Python 3.8, App B needs Python 3.11, both on the same server</li>
          <li><strong>Slow provisioning</strong> — spinning up a new VM took minutes to hours</li>
          <li><strong>Resource waste</strong> — each VM needs its own full OS, consuming GBs of RAM</li>
          <li><strong>Inconsistent environments</strong> — dev, staging, and prod were never truly identical</li>
        </ul>
        <h4>How Docker Solves This</h4>
        <ul>
          <li><strong>Consistency</strong> — same container runs identically everywhere</li>
          <li><strong>Isolation</strong> — each app gets its own filesystem, network, and process space</li>
          <li><strong>Speed</strong> — containers start in milliseconds, not minutes</li>
          <li><strong>Efficiency</strong> — share host kernel, no OS overhead per container</li>
          <li><strong>Portability</strong> — build once, run anywhere Docker is installed</li>
        </ul>
      `,
      diagrams: [
        {
          type: 'mermaid',
          title: 'Before vs After Docker',
          code: `graph LR
    subgraph Before["❌ Before Docker"]
        A[App A<br>Python 3.8] --- B[App B<br>Python 3.11]
        B --- C[App C<br>Node 18]
        D[Conflicting Dependencies] --> E[Broken Deployments]
    end
    subgraph After["✅ With Docker"]
        F["Container A<br>Python 3.8"] ~~~ G["Container B<br>Python 3.11"]
        G ~~~ H["Container C<br>Node 18"]
        I[Each Isolated] --> J[Reliable Deployments]
    end`
        }
      ]
    },
    {
      id: 'containers-vs-vms',
      title: 'Containers vs Virtual Machines',
      content: `
        <p>This is the most common comparison — and understanding it is crucial to grasping why Docker exists.</p>
      `,
      diagrams: [
        {
          type: 'mermaid',
          title: 'Architecture Comparison: Containers vs VMs',
          code: `graph TB
    subgraph VM["Virtual Machine Architecture"]
        VM_HW[Hardware] --> VM_HOS[Host OS]
        VM_HOS --> VM_HYP[Hypervisor<br>VMware/VirtualBox]
        VM_HYP --> VM_G1[Guest OS 1<br>Full Linux]
        VM_HYP --> VM_G2[Guest OS 2<br>Full Windows]
        VM_G1 --> VM_A1[App A]
        VM_G2 --> VM_A2[App B]
    end
    subgraph CT["Container Architecture"]
        CT_HW[Hardware] --> CT_HOS[Host OS<br>Linux Kernel]
        CT_HOS --> CT_DR[Docker Engine]
        CT_DR --> CT_C1[Container 1<br>App A + Libs]
        CT_DR --> CT_C2[Container 2<br>App B + Libs]
        CT_DR --> CT_C3[Container 3<br>App C + Libs]
    end`
        }
      ],
      alerts: [
        {
          type: 'info',
          title: 'Key Insight',
          text: 'VMs virtualize <strong>hardware</strong> — each VM runs a full OS. Containers virtualize the <strong>OS</strong> — they share the host kernel. That\'s why containers are 10-100x lighter and start in milliseconds.'
        }
      ],
      keyTakeaways: [
        'VMs: full OS per instance → heavy (GBs), slow startup (minutes)',
        'Containers: shared kernel → light (MBs), instant startup (ms)',
        'VMs provide stronger isolation (separate kernel)',
        'Containers are ideal for microservices; VMs for full OS isolation',
        'You can run containers INSIDE VMs (common in cloud deployments)'
      ]
    },
    {
      id: 'docker-ecosystem',
      title: 'The Docker Ecosystem',
      content: `
        <p>Docker is not just one tool — it's a complete ecosystem:</p>
      `,
      diagrams: [
        {
          type: 'mermaid',
          title: 'Docker Ecosystem',
          code: `mindmap
  root((Docker<br>Ecosystem))
    Core Tools
      Docker Engine
      Docker CLI
      Docker Compose
      Docker Desktop
    Infrastructure
      Docker Hub
      Docker Registry
      Docker Scout
    Orchestration
      Docker Swarm
      Kubernetes
    Development
      Dockerfile
      .dockerignore
      Multi-stage Builds
    Networking
      Bridge
      Host
      Overlay`
        }
      ]
    }
  ]
};
