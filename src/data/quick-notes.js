// ============================================
// QUICK-NOTES.JS — Fast revision dashboard
// ============================================

export const quickNotes = {
  id: 'quick-notes',
  title: 'Quick Notes',
  icon: '⚡',
  subtitle: 'Fast revision dashboard — everything you need at a glance',
  tags: ['revision', 'cheatsheet', 'overview'],
  meta: ['📖 5 min read', '🏷️ All Levels'],
  cards: [
    {
      title: 'Containers',
      icon: '📦',
      colorClass: 'quick-note-card--containers',
      items: [
        'Lightweight, standalone executable package of software',
        'Shares host OS kernel — not a full VM',
        'Isolated via Linux namespaces and cgroups',
        'Ephemeral by default — data lost on removal unless volumes used',
        'Run from images — an image can spawn many containers',
        'Each container gets its own PID, network, and mount namespace',
        '<code>docker run</code> = create + start a container',
        '<code>docker ps</code> = list running containers'
      ]
    },
    {
      title: 'Images',
      icon: '💿',
      colorClass: 'quick-note-card--images',
      items: [
        'Read-only template used to create containers',
        'Built from a Dockerfile using <code>docker build</code>',
        'Composed of layers — each instruction creates a layer',
        'Layers are cached for faster rebuilds',
        'Stored in registries (Docker Hub, ECR, GCR)',
        'Tag format: <code>name:tag</code> (e.g., <code>node:24-alpine</code>)',
        'Use <code>.dockerignore</code> to exclude files from build context',
        'Multi-stage builds reduce final image size dramatically'
      ]
    },
    {
      title: 'Volumes',
      icon: '💾',
      colorClass: 'quick-note-card--volumes',
      items: [
        'Persist data beyond container lifecycle',
        '<strong>Named volumes</strong>: managed by Docker, portable',
        '<strong>Bind mounts</strong>: map host directory into container',
        '<strong>tmpfs</strong>: in-memory, never written to disk',
        '<code>docker volume create mydata</code>',
        '<code>-v mydata:/app/data</code> in run command',
        'Volumes survive container removal',
        'Use <code>:ro</code> suffix for read-only mounts'
      ]
    },
    {
      title: 'Networking',
      icon: '🌐',
      colorClass: 'quick-note-card--networking',
      items: [
        '<strong>bridge</strong>: default, isolated network per container',
        '<strong>host</strong>: container shares host network stack',
        '<strong>overlay</strong>: multi-host networking (Swarm/K8s)',
        '<strong>none</strong>: no networking',
        'Containers on same network can resolve by name',
        '<code>docker network create mynet</code>',
        'Port mapping: <code>-p 8080:80</code> (host:container)',
        'Custom networks provide automatic DNS resolution'
      ]
    },
    {
      title: 'Docker Compose',
      icon: '🎼',
      colorClass: 'quick-note-card--compose',
      items: [
        'Define multi-container apps in a single YAML file',
        'File: <code>compose.yaml</code> (preferred) or <code>docker-compose.yml</code>',
        '<code>docker compose up -d</code> = start all services',
        '<code>docker compose down</code> = stop and remove',
        'Services, networks, volumes defined declaratively',
        'Environment variables via <code>.env</code> file',
        '<code>depends_on</code> controls startup order',
        'Use <code>profiles</code> for conditional service activation'
      ]
    },
    {
      title: 'Essential Commands',
      icon: '⌨️',
      colorClass: 'quick-note-card--commands',
      items: [
        '<code>docker pull image:tag</code> — download image',
        '<code>docker run -d -p 80:80 nginx</code> — run detached',
        '<code>docker exec -it container bash</code> — shell into container',
        '<code>docker logs -f container</code> — stream logs',
        '<code>docker build -t myapp:1.0 .</code> — build image',
        '<code>docker stop / rm container</code> — stop/remove',
        '<code>docker system prune -a</code> — clean everything',
        '<code>docker inspect container</code> — detailed info'
      ]
    }
  ]
};
