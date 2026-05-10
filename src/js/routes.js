import { quickNotes } from "../data/quick-notes.js";
import { overview } from "../data/overview.js";
import { levels } from "../data/levels.js";
import { compose } from "../data/compose.js";
import { features } from "../data/features.js";
import { tools } from "../data/tools.js";
import { integrations } from "../data/integrations.js";
import { guides } from "../data/guides.js";
import { systemDesign } from "../data/system-design.js";
import { mistakes } from "../data/mistakes.js";
import { glossary } from "../data/glossary.js";
import { resources } from "../data/resources.js";
import { implementation } from "../data/implementation.js";
import { languages } from "../data/languages.js";

const commonMeta = (title, subtitle) =>
  [`📖 ${title}`, subtitle].filter(Boolean);

const imagesPage = {
  id: "images",
  title: "Docker Images",
  icon: "💿",
  subtitle:
    "How Docker images are built, tagged, pulled, and shared across environments.",
  tags: ["images", "layers", "registry", "dockerfile"],
  meta: ["📖 12 min read", "🟢 Beginner"],
  sections: [
    {
      id: "what-is-image",
      title: "What is a Docker Image?",
      content: `
        <p>A Docker image is a read-only template that packages an application together with its runtime, dependencies, and default configuration.</p>
        <p>Images are built from Dockerfiles and stored in registries such as Docker Hub or private registries like ECR, GCR, and ACR.</p>
      `,
      keyTakeaways: [
        "Images are immutable and shared between containers",
        "Images are built from Dockerfiles",
        "The same image can run on laptops, servers, and CI systems",
      ],
    },
    {
      id: "image-workflow",
      title: "Build and Use Images",
      content:
        "<p>The everyday image workflow is build, tag, push, and pull.</p>",
      codeExamples: [
        {
          language: "bash",
          title: "Common image commands",
          code: "docker build -t myapp:1.0 .\ndocker tag myapp:1.0 myrepo/myapp:1.0\ndocker push myrepo/myapp:1.0\ndocker pull nginx:alpine\ndocker image ls",
          explanation: "Use explicit tags so your deployments are repeatable.",
        },
      ],
    },
    {
      id: "image-best-practices",
      title: "Image Best Practices",
      content: "<p>Keep images small, deterministic, and easy to audit.</p>",
      keyTakeaways: [
        "Pin versions instead of using latest",
        "Use .dockerignore to keep build contexts small",
        "Prefer minimal base images when possible",
      ],
    },
    {
      id: "image-layers-actually-work",
      title: "How Image Layers Actually Work",
      content: `
        <p>Docker images are not single blobs of data. They are stacks of <strong>read-only layers</strong> combined by a union filesystem into one coherent view. Each Dockerfile instruction that changes the filesystem, such as <code>RUN</code>, <code>COPY</code>, or <code>ADD</code>, creates a new layer that stores only the <strong>diff</strong> from the layer before it. Docker does not duplicate the whole filesystem each time; it records only what changed.</p>
        <p>On modern Linux systems, the default storage driver is usually <strong>overlay2</strong>. Overlay2 works by stacking multiple read-only directories together and adding one writable upper layer. When the container reads a file, the kernel presents the merged view. When the container writes a file, the new version is stored in the writable layer instead of modifying the base layer. That is how several layers can appear as one filesystem inside the container.</p>
        <p>The key implication is that layer order affects image size. If you run <code>apt-get install</code> in one layer and then remove cache files in a later layer, the cache still exists in the earlier layer and still contributes to the final image size. The fix is to chain related operations in one <code>RUN</code> instruction with <code>&amp;&amp;</code> so the temporary files never survive into a committed layer.</p>
        <p>For example, this is the wrong pattern:</p>
        <p><code>RUN apt-get update</code><br><code>RUN apt-get install -y curl</code><br><code>RUN rm -rf /var/lib/apt/lists/*</code></p>
        <p>The better pattern is to combine the install and cleanup in one layer:</p>
        <p><code>RUN apt-get update &amp;&amp; apt-get install -y curl &amp;&amp; rm -rf /var/lib/apt/lists/*</code></p>
        <p>You can inspect the resulting layers with <code>docker history &lt;image&gt;</code>. That command shows which instruction created each layer and how large it is, which makes it easy to spot unexpectedly large layers or mistakes like leaving package manager caches behind.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Inspect image layers",
          code: "docker history myapp:1.0\ndocker history --no-trunc myapp:1.0",
          explanation:
            "docker history shows the instructions that created each layer and their sizes, which helps you find cache and cleanup mistakes.",
        },
      ],
      keyTakeaways: [
        "Each filesystem-changing Dockerfile instruction creates a new read-only layer that stores only the diff",
        "overlay2 merges the layers into one filesystem view for the container",
        "Cleanup in a later layer does not remove data from earlier layers",
        "docker history helps you inspect layer sizes and the instruction that created each one",
      ],
    },
    {
      id: "tagging-strategy-production",
      title: "Tagging Strategy for Production",
      content: `
        <p><code>latest</code> is dangerous in production because it is not a version. It is only the most recently pushed tag. That means it can change silently, and if a local image already has a <code>:latest</code> tag, Docker may not pull a newer one unless you explicitly ask it to. For reproducible deployments, you need tags that communicate meaning.</p>
        <p>A good production strategy uses three kinds of tags. First, use <strong>semantic version tags</strong> like <code>myapp:1.4.2</code> for normal releases. Second, use <strong>git commit SHA tags</strong> like <code>myapp:abc1234</code> when you want an exact build tied to source control. Third, use <strong>environment tags</strong> such as <code>myapp:stable</code> or <code>myapp:edge</code> as mutable pointers that can move between versions over time.</p>
        <p>For absolute reproducibility, use image digests. A digest is the immutable SHA256 content hash of the image manifest, and it uniquely identifies the image regardless of the tag. Pulling by digest means you always get the exact same bytes:</p>
        <p><code>docker pull myapp@sha256:abc123...</code></p>
        <p>You can find the digest with <code>docker inspect</code>. Look at the image's repo digests after pulling or building it, then use that digest in deployment manifests or release notes. This is the strongest way to guarantee that production gets the exact image you tested.</p>
        <p>In practice, teams often push a release once, tag it several ways, and deploy by digest in production while still keeping human-friendly tags for browsing and promotion. That gives you both traceability and immutability.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Tag and pull by digest",
          code: "docker tag myapp:1.4.2 myapp:stable\ndocker inspect myapp:1.4.2 --format='{{index .RepoDigests 0}}'\ndocker pull myapp@sha256:abc123...",
          explanation:
            "Use semantic and moving tags for convenience, then deploy by digest when you need exact reproducibility.",
        },
      ],
      keyTakeaways: [
        ":latest is mutable, not a version, and is unsafe as a production deployment reference",
        "Use semantic versions for releases, commit SHAs for exact builds, and stable/edge tags as moving pointers",
        "Image digests are immutable and identify exact image bytes regardless of tag",
        "docker inspect can reveal RepoDigests for use in locked-down deployments",
      ],
    },
    {
      id: "private-registries",
      title: "Working with Private Registries",
      content: `
        <p>Docker Hub is only one registry. Production teams often use private registries for access control, geographic control, or air-gapped deployments. The workflow is always the same: authenticate, tag the image for the target registry, and push or pull it with the correct credentials.</p>
        <p>GitHub Container Registry (<code>ghcr.io</code>) requires a personal access token, not your GitHub password. The token needs the appropriate package scopes, typically <code>packages:read</code> for pulling and <code>packages:write</code> for pushing. Authenticate with Docker like this:</p>
        <p><code>docker login ghcr.io -u YOUR_GITHUB_USERNAME</code></p>
        <p>Docker will prompt for the PAT as the password. After login, you can tag and push images using the GHCR namespace:</p>
        <p><code>docker tag myapp:1.0 ghcr.io/myorg/myapp:1.0</code><br><code>docker push ghcr.io/myorg/myapp:1.0</code></p>
        <p>The same pattern works for a private registry at your own domain, such as <code>registry.example.com/myorg/myapp:1.0</code>. Tag the image for that registry and then push it after logging in with <code>docker login registry.example.com</code>.</p>
        <p>For air-gapped environments or CI systems, you can run a local registry with the official registry image:</p>
        <p><code>docker run -d -p 5000:5000 --name registry registry:2</code></p>
        <p>Then push images to <code>localhost:5000/myapp:1.0</code> or another host name that resolves to the registry server. This is useful when internet access is restricted or when you want a local image cache in CI.</p>
        <p>Docker can also be configured to trust a self-hosted registry by adding an <code>insecure-registries</code> entry in <code>/etc/docker/daemon.json</code>. That setting makes Docker allow plain HTTP to that registry, but you should avoid it in favour of proper TLS whenever possible because it weakens transport security.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Private registry workflow",
          code: "docker login ghcr.io -u YOUR_GITHUB_USERNAME\ndocker tag myapp:1.0 ghcr.io/myorg/myapp:1.0\ndocker push ghcr.io/myorg/myapp:1.0\ndocker run -d -p 5000:5000 --name registry registry:2\ndocker tag myapp:1.0 localhost:5000/myapp:1.0\ndocker push localhost:5000/myapp:1.0",
          explanation:
            "Authenticate with a PAT for GHCR, retag for the target registry, and use the official registry image for local or air-gapped setups.",
        },
      ],
      keyTakeaways: [
        "GHCR requires a personal access token with packages:read or packages:write, not a GitHub password",
        "Tag images with the registry hostname before pushing",
        "registry:2 provides a lightweight private registry for CI or air-gapped environments",
        "insecure-registries exists for compatibility but should be avoided in favour of proper TLS",
      ],
    },
  ],
};

const containersPage = {
  id: "containers",
  title: "Docker Containers",
  icon: "📦",
  subtitle:
    "Running instances of images with isolation, networking, and resource limits.",
  tags: ["containers", "runtime", "process-isolation"],
  meta: ["📖 12 min read", "🟢 Beginner"],
  sections: [
    {
      id: "container-basics",
      title: "What is a Container?",
      content: `
        <p>A container is the running instance of an image. It adds a writable layer on top of the image and isolates processes, filesystems, and network access.</p>
        <p>Containers start quickly because they share the host kernel instead of booting a full operating system.</p>
      `,
      keyTakeaways: [
        "Containers are lightweight compared to VMs",
        "Containers share the host kernel",
        "Each container has its own filesystem and process space",
      ],
    },
    {
      id: "container-lifecycle",
      title: "Lifecycle Commands",
      codeExamples: [
        {
          language: "bash",
          title: "Container lifecycle",
          code: "docker run -d --name web nginx:alpine\ndocker ps\ndocker logs web\ndocker stop web\ndocker rm web",
          explanation:
            "Start, observe, stop, and remove are the core container operations.",
        },
      ],
    },
    {
      id: "container-production",
      title: "Production Guidance",
      content:
        "<p>Use health checks, restart policies, and resource limits for production containers.</p>",
      keyTakeaways: [
        "Use non-root users where possible",
        "Set memory and CPU limits",
        "Add health checks for reliability",
      ],
    },
    {
      id: "container-lifecycle-depth",
      title: "Container Lifecycle in Depth",
      content: `
        <p>Docker containers move through a small but important state machine: <strong>created → running → paused → stopped → removed</strong>. That sequence matters because each transition affects what Docker is actually doing with the container's filesystem, process tree, and metadata.</p>
        <p><code>docker create</code> prepares a container without starting the main process. Docker allocates the container ID, creates the writable layer, records configuration such as environment variables and mounts, and registers metadata in its local store. The container exists, but nothing inside it is executing yet.</p>
        <p><code>docker run</code> is shorthand for <code>docker create</code> plus <code>docker start</code>. Under the hood, Docker creates the container and immediately starts the configured command. That is why <code>docker run</code> is the common default for one-off workloads, while <code>docker create</code> is useful when you want to stage containers ahead of time and control the exact moment they begin running.</p>
        <p>When you stop a container, Docker first sends <strong>SIGTERM</strong> to the main process. SIGTERM is a polite shutdown request: the process can close files, flush buffers, finish in-flight requests, and exit cleanly. If the process does not exit within the timeout, Docker sends <strong>SIGKILL</strong>, which forcefully terminates it without cleanup. That is why <code>docker stop --time 30</code> is often better for databases, queues, and APIs than an abrupt kill.</p>
        <p><code>docker kill</code> skips the grace period and sends a signal immediately, with <strong>SIGKILL</strong> as the default. It is useful when a process is stuck, but it increases the risk of data corruption if the application was in the middle of writing state. For any workload that writes to disk, graceful shutdown matters because the application may need to commit transactions, sync buffers, or release locks before the kernel tears down the container's process namespace.</p>
        <p>Removing a stopped container with <code>docker rm</code> deletes the container metadata and its writable layer. Any changes made inside the container that were not stored in a mounted volume are discarded. Image layers are not deleted by <code>docker rm</code>; only the container's top writable layer goes away. If you used a named volume or bind mount, that mounted data survives unless you explicitly remove it.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Container lifecycle commands",
          code: "docker create --name web nginx:alpine\ndocker start web\ndocker stop --time 30 web\ndocker kill web\ndocker rm web",
          explanation:
            "Create stages the container, start launches it, stop sends SIGTERM before SIGKILL, kill force-stops it, and rm removes the container plus its writable layer.",
        },
      ],
      keyTakeaways: [
        "docker create prepares a container without starting the main process",
        "docker run is create + start in one step",
        "docker stop gives the process a chance to exit cleanly before forcing it",
        "docker rm deletes the container's writable layer but not the image layers",
      ],
    },
    {
      id: "container-isolation-explained",
      title: "Container Isolation Explained",
      content: `
        <p>Docker isolation is not a single feature. It is a combination of Linux kernel primitives that work together to make processes inside a container feel separate from the host. The three most important pieces are <strong>namespaces</strong>, <strong>cgroups</strong>, and <strong>union filesystems</strong>.</p>
        <p><strong>Namespaces</strong> give a process a limited view of the system. A <strong>PID namespace</strong> makes the process inside the container see itself as <strong>PID 1</strong>, even though the host OS assigns it a different PID. That matters because PID 1 inside a container becomes responsible for reaping child processes and handling shutdown signals. A <strong>NET namespace</strong> gives the container its own network stack, including interfaces, IP addresses, routing table, and ports, so containers do not automatically see the host network or each other unless you connect them. A <strong>MNT namespace</strong> isolates the filesystem mount table, so the container sees only the filesystem paths that Docker mounted for it. <strong>UTS</strong> isolates host and domain names, which is why a container can have its own hostname. <strong>IPC</strong> isolates inter-process communication objects such as shared memory and semaphores. <strong>USER</strong> namespaces can map container users to different host users, which helps reduce the impact of running as root inside the container.</p>
        <p><strong>cgroups</strong> control how much of the host's resources a container can consume. They let Docker set CPU shares or quotas, memory limits, and I/O limits so one container cannot monopolize the machine. For example, if you give a container <code>--memory=512m</code>, the kernel will enforce that limit and the container will be stopped or OOM-killed if it exceeds it. That is what keeps a runaway process from taking down every other workload on the host.</p>
        <p><strong>Union filesystems</strong> make the image appear as one filesystem even though it is really multiple read-only layers plus one writable layer on top. The base image layers stay read-only and shared across containers. When a file changes inside the container, Docker uses copy-on-write: it copies that file into the writable layer, and the container reads the modified version from there. This is why multiple containers can share the same image efficiently while still having their own private changes.</p>
        <p>In plain English: namespaces decide <em>what the container can see</em>, cgroups decide <em>how much it can use</em>, and the union filesystem decides <em>which files belong to the image and which changes belong to that specific container</em>.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Seeing isolation in practice",
          code: "docker run -d --name demo --memory=512m --cpus=1.0 nginx:alpine\ndocker exec demo ps aux\ndocker inspect demo\ndocker stats demo",
          explanation:
            "The process list, kernel resource limits, and runtime configuration all show the effect of namespaces, cgroups, and the container's writable layer.",
        },
      ],
      keyTakeaways: [
        "Namespaces give each container its own view of processes, networking, mounts, and host identity",
        "cgroups enforce CPU, memory, and I/O limits",
        "Union filesystems layer a writable container layer over read-only image layers",
        "Copy-on-write keeps image layers shared and container changes isolated",
      ],
    },
    {
      id: "common-container-flags",
      title: "Common Container Flags You Will Actually Use",
      content: `
        <p>The flags below are the ones that show up repeatedly in real container workflows. They are not exotic options; they are the knobs you use when turning a quick demo into a dependable service.</p>
        <table>
          <thead>
            <tr>
              <th>Flag</th>
              <th>What it does</th>
              <th>When to use it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--restart=no</code></td>
              <td>Never restart automatically. This is the default.</td>
              <td>Use for one-off jobs, local experiments, and containers that should exit and stay exited.</td>
            </tr>
            <tr>
              <td><code>--restart=on-failure</code></td>
              <td>Restart only when the container exits with a non-zero status code.</td>
              <td>Use for batch jobs or services where failures should be retried, but clean exits should remain final.</td>
            </tr>
            <tr>
              <td><code>--restart=always</code></td>
              <td>Always restart after exit, even after a clean shutdown.</td>
              <td>Use for services that must come back whenever Docker or the host restarts.</td>
            </tr>
            <tr>
              <td><code>--restart=unless-stopped</code></td>
              <td>Restart unless the container was explicitly stopped by a user.</td>
              <td>Use for long-running production services when you want automatic recovery without overriding manual stop intent.</td>
            </tr>
            <tr>
              <td><code>--env-file</code></td>
              <td>Load environment variables from a file.</td>
              <td>Use when you have many variables or want a repeatable configuration file checked into deployment workflows.</td>
            </tr>
            <tr>
              <td><code>-e</code></td>
              <td>Set a single environment variable directly on the command line.</td>
              <td>Use for a small number of overrides, quick tests, or values injected by CI.</td>
            </tr>
            <tr>
              <td><code>--network</code></td>
              <td>Attach the container to a specific network, such as a custom bridge network.</td>
              <td>Use when containers need to resolve each other by name or you want to keep services isolated from the default bridge network.</td>
            </tr>
            <tr>
              <td><code>--label</code></td>
              <td>Add metadata tags to the container.</td>
              <td>Use for filtering, automation, cleanup jobs, and operational grouping such as <code>--label app=payments</code>.</td>
            </tr>
            <tr>
              <td><code>--health-cmd</code></td>
              <td>Define a command Docker runs to check whether the container is healthy.</td>
              <td>Use for web apps, APIs, and databases where "running" is not enough and you need to know whether the service is actually responding.</td>
            </tr>
          </tbody>
        </table>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Practical flag combinations",
          code: "docker run -d --restart=unless-stopped --env-file .env --network app-net --label app=api --health-cmd='curl -f http://localhost:3000/health || exit 1' myapi\ndocker run -e NODE_ENV=production -e PORT=3000 myapi",
          explanation:
            "Use env files for larger configs, -e for quick overrides, network for service discovery, labels for automation, and health checks for real readiness signals.",
        },
      ],
      keyTakeaways: [
        "Restart policies control what happens after a container exits",
        "--env-file is better for many variables, while -e is better for a few",
        "--network is essential for multi-container applications",
        "Labels and health checks make containers easier to manage in production",
      ],
    },
  ],
};

const volumesPage = {
  id: "volumes",
  title: "Docker Volumes",
  icon: "💾",
  subtitle: "Persist data beyond the lifecycle of any single container.",
  tags: ["volumes", "persistence", "storage"],
  meta: ["📖 10 min read", "🟡 Intermediate"],
  sections: [
    {
      id: "why-volumes",
      title: "Why Volumes Matter",
      content:
        "<p>Containers are ephemeral, but data often must survive restarts and redeployments. Volumes keep that data outside the container layer.</p>",
      keyTakeaways: [
        "Volumes are managed by Docker",
        "They persist after a container is removed",
        "They are ideal for databases and uploads",
      ],
    },
    {
      id: "volume-types",
      title: "Volume Types",
      codeExamples: [
        {
          language: "bash",
          title: "Volume patterns",
          code: "docker volume create app-data\ndocker run -v app-data:/var/lib/data postgres\ndocker run -v ./src:/app/src myapp\ndocker run --tmpfs /tmp myapp",
          explanation:
            "Named volumes, bind mounts, and tmpfs solve different persistence needs.",
        },
      ],
    },
    {
      id: "volume-safety",
      title: "Safe Usage",
      content:
        "<p>Avoid accidental data loss by keeping production state in named volumes and treating bind mounts as a development-only convenience when appropriate.</p>",
      keyTakeaways: [
        "Use named volumes for production data",
        "Never run destructive cleanup commands casually",
        "Document which services own which data",
      ],
    },
    {
      id: "mount-types-compared",
      title: "The Three Mount Types Compared",
      content: `
        <p>Docker gives you three common ways to mount storage into a container: <strong>named volumes</strong>, <strong>bind mounts</strong>, and <strong>tmpfs mounts</strong>. They all solve different problems, so the right choice depends on where the data should live, who should manage it, and whether the data must survive container removal.</p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Where data lives on the host</th>
              <th>Who manages lifecycle</th>
              <th>When data is lost</th>
              <th>Exact <code>--mount</code> syntax</th>
              <th>Real-world use case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Named volume</td>
              <td>Inside Docker's storage area, usually under the Docker root directory managed by the engine.</td>
              <td>Docker manages creation, attachment, and removal.</td>
              <td>Data survives container removal and host restarts, and is lost only when the volume itself is deleted or the host storage is lost.</td>
              <td><code>docker run --mount type=volume,source=db-data,target=/var/lib/postgresql/data postgres:18</code></td>
              <td>Database files, application uploads, and any persistent service state.</td>
            </tr>
            <tr>
              <td>Bind mount</td>
              <td>At a path you choose on the host filesystem, such as <code>/home/user/app</code> or <code>C:\\code\\app</code>.</td>
              <td>You manage the host directory or file; Docker just maps it into the container.</td>
              <td>Data is not lost when the container is removed, but it disappears if you delete or overwrite the host path.</td>
              <td><code>docker run --mount type=bind,source=/home/user/app,target=/app/app</code></td>
              <td>Live code in development, configuration files, and debugging workflows where immediate host-side edits must appear in the container.</td>
            </tr>
            <tr>
              <td>tmpfs mount</td>
              <td>In host memory only; nothing is written to a persistent disk location.</td>
              <td>The Linux kernel manages the memory-backed filesystem; Docker just requests the mount.</td>
              <td>Data is lost when the container stops or the host reboots, because the data never touches disk.</td>
              <td><code>docker run --mount type=tmpfs,target=/tmp,tmpfs-size=64m myapp</code></td>
              <td>Session tokens, build caches, or short-lived scratch data that must never persist to disk.</td>
            </tr>
          </tbody>
        </table>
        <p>Performance differs as well. Bind mounts talk directly to the host filesystem, so they usually offer full host filesystem performance. Named volumes pass through Docker's storage driver, which adds a small amount of overhead but gives Docker more control and better portability. tmpfs is often the fastest option for temporary data because it lives in memory, but it is only appropriate when persistence is not required.</p>
        <p>In practice, the pattern is simple: use named volumes when data matters, bind mounts when the host and container need to share the same files live, and tmpfs when you want speed without persistence.</p>
      `,
      keyTakeaways: [
        "Named volumes are Docker-managed and are the best default for persistent service data",
        "Bind mounts point to an exact host path and are ideal for live development files",
        "tmpfs mounts live in memory and disappear on stop or reboot",
        "Bind mounts are direct host filesystem access, while named volumes go through Docker's storage driver",
      ],
    },
    {
      id: "volume-drivers-sharing-data",
      title: "Volume Drivers and Sharing Data Between Containers",
      content: `
        <p>By default Docker uses the <strong>local</strong> volume driver. That driver stores data on the local host and is the right choice for most single-host deployments. But Docker also supports third-party volume drivers that let a volume live on remote or cloud storage instead of the local disk.</p>
        <p>Common examples include plugins for <strong>rclone</strong>, <strong>NFS</strong>, and cloud-backed storage systems. In older production setups, drivers such as <strong>convoy</strong> were used to back Docker volumes with services like AWS EFS or other network storage systems. The important idea is that the volume driver decides where the bytes actually live and how they are mounted into containers.</p>
        <p>For an NFS-backed volume on a standalone Docker host, you typically create a local driver volume with NFS options:</p>
        <p><code>docker volume create --driver local --opt type=nfs --opt o=addr=10.0.0.50,rw,nfsvers=4 --opt device=:/exports/appdata nfs-data</code></p>
        <p>For a Swarm service, Docker can mount that same style of NFS-backed volume directly into a service task:</p>
        <p><code>docker service create --name app --mount type=volume,source=nfs-data,target=/data,volume-driver=local,volume-opt=type=nfs,volume-opt=o=addr=10.0.0.50,rw,nfsvers=4,volume-opt=device=:/exports/appdata myapp</code></p>
        <p>Sharing a single named volume between two containers is also straightforward. One container can create or write to the volume, and another container can reuse it with <code>--volumes-from</code>. That is useful for sidecars, migration jobs, or backup containers that need access to the same files as the main app.</p>
        <p>For example, if one container writes data into a volume and another container reads from it, Docker can attach the same volume to both:</p>
        <p><code>docker run -d --name writer -v shared-data:/data mywriter</code><br><code>docker run -d --name reader --volumes-from writer myreader</code></p>
        <p>The warning is concurrency. If two containers write to the same volume at the same time, Docker does not provide application-level locking for you. Databases and stateful services usually need their own coordination logic, otherwise concurrent writes can corrupt files or produce inconsistent state. Shared volumes are fine when the application knows how to serialize access, but they are risky if you assume the filesystem itself will protect you.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Create and share a remote-backed volume",
          code: "docker volume create --driver local --opt type=nfs --opt o=addr=10.0.0.50,rw,nfsvers=4 --opt device=:/exports/appdata nfs-data\ndocker run -d --name writer -v nfs-data:/data mywriter\ndocker run -d --name reader --volumes-from writer myreader",
          explanation:
            "The local driver is configured with NFS mount options, then the same named volume is attached to multiple containers for shared access.",
        },
      ],
      keyTakeaways: [
        "Docker uses the local volume driver by default",
        "Third-party drivers can place volume data on remote or cloud storage",
        "NFS-backed volumes can be created with driver and mount options",
        "--volumes-from shares an existing volume, but concurrent writes require application-level locking",
      ],
    },
    {
      id: "backup-restore-volume",
      title: "Backup and Restore a Named Volume",
      content: `
        <p>A practical production backup pattern is to mount the named volume into a temporary container that writes a tar archive into a host directory mounted from the outside. This works because the backup container can read the volume directly even when the application container is stopped, and it does not depend on the app image having backup tools installed.</p>
        <p>First create a host backup directory, then run a temporary container that reads the volume and writes an archive:</p>
        <p><code>docker run --rm --volumes-from app -v $(pwd)/backups:/backup alpine sh -c "tar czf /backup/app-data.tar.gz -C /data ."</code></p>
        <p>In that pattern, <code>app</code> is the container that already has the named volume attached at <code>/data</code>. The <code>--volumes-from</code> flag lets the temporary Alpine container see the same volume, and the bind-mounted <code>/backup</code> directory receives the tar file on the host.</p>
        <p>To restore into a fresh volume, create the volume first and then extract the archive into it with another temporary container:</p>
        <p><code>docker volume create app-data-restored</code><br><code>docker run --rm -v app-data-restored:/data -v $(pwd)/backups:/backup alpine sh -c "cd /data &amp;&amp; tar xzf /backup/app-data.tar.gz"</code></p>
        <p>This works whether or not the application container is running because the backup and restore containers only need access to the Docker volume itself. However, if you are backing up a database volume, you should stop the database container first or use the database's own hot-backup tooling. A live database can be in the middle of a transaction, so copying its files without coordination can produce an inconsistent backup.</p>
        <p>The safest pattern is: stop the application, back up the volume, verify the archive, create a fresh volume if restoring, and then start the application again with the restored data attached.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Backup and restore workflow",
          code: 'docker stop app\ndocker run --rm --volumes-from app -v $(pwd)/backups:/backup alpine sh -c "tar czf /backup/app-data.tar.gz -C /data ."\ndocker volume create app-data-restored\ndocker run --rm -v app-data-restored:/data -v $(pwd)/backups:/backup alpine sh -c "cd /data && tar xzf /backup/app-data.tar.gz"',
          explanation:
            "The temporary container reads from the live volume and writes an archive to the host; restore reverses the process into a new volume.",
        },
      ],
      keyTakeaways: [
        "A temporary container can back up a named volume to a host-mounted tar archive",
        "Restore by creating a fresh volume and extracting the archive into it",
        "This pattern works even if the app container is stopped because the volume is separate from the app container lifecycle",
        "Stop database containers before filesystem-level backups unless you are using database-aware backup tooling",
      ],
    },
  ],
};

const networkingPage = {
  id: "networking",
  title: "Docker Networking",
  icon: "🌐",
  subtitle:
    "Container-to-container communication, DNS, bridges, and port mapping.",
  tags: ["networking", "dns", "bridge", "ports"],
  meta: ["📖 11 min read", "🟡 Intermediate"],
  sections: [
    {
      id: "network-basics",
      title: "How Docker Networking Works",
      content:
        "<p>Docker creates virtual networks so containers can communicate using stable names instead of hard-coded IP addresses.</p>",
      keyTakeaways: [
        "Bridge networks are the default",
        "Containers on the same network can resolve each other by name",
        "Port mapping exposes services to the host",
      ],
    },
    {
      id: "network-commands",
      title: "Useful Commands",
      codeExamples: [
        {
          language: "bash",
          title: "Networking workflow",
          code: "docker network create mynet\ndocker run -d --name api --network mynet myapi\ndocker run -d --name db --network mynet postgres\ndocker network inspect mynet",
          explanation:
            "Custom bridge networks provide clean name-based service discovery.",
        },
      ],
    },
    {
      id: "network-guidance",
      title: "Deployment Notes",
      content:
        "<p>Prefer custom bridge networks for most multi-container applications. Reserve host networking for edge cases that truly need it.</p>",
      keyTakeaways: [
        "Use custom bridge networks by default",
        "Keep ports explicit and documented",
        "Avoid relying on default bridge for production",
      ],
    },
    {
      id: "built-in-network-drivers",
      title: "The Four Built-in Network Drivers",
      content: `
        <p>Docker ships with four built-in network drivers, and each one solves a different networking problem. The right choice depends on whether you want isolation, performance, cross-host routing, or no networking at all.</p>
        <p><strong>bridge</strong> is the default driver for standalone containers. Docker creates a virtual Ethernet bridge called <code>docker0</code> on the host, and each container gets its own IP address, usually from the <code>172.17.0.0/16</code> subnet by default. On a custom bridge network, Docker also provides embedded DNS, so containers can resolve each other by name. This is the common choice for most single-host applications.</p>
        <p><code>docker network create --driver bridge app-net</code></p>
        <p>Use bridge when you want isolated containers on one machine, especially for web apps, API stacks, and development environments that need service discovery by name.</p>
        <p><strong>host</strong> removes the network namespace entirely, which means the container shares the host's network stack. There is no separate container IP and no port translation overhead. This is useful for performance-sensitive workloads or for services that must bind directly to a specific host interface. It is explicitly not supported on Docker Desktop for Mac or Windows; it is a Linux-only feature.</p>
        <p><code>docker network create --driver host host-net</code></p>
        <p>Use host when you need the lowest possible networking overhead or when you are running software that expects to see the host's real network interfaces.</p>
        <p><strong>none</strong> disables networking completely. A container on a none network has no external network access, no interface for traffic, and no ability to make outbound calls unless you add networking some other way. This is ideal for batch jobs or data-processing containers that must not touch the network.</p>
        <p><code>docker network create --driver none isolated-net</code></p>
        <p>Use none for offline jobs, security-sensitive scripts, or containers that should process files without any network dependencies.</p>
        <p><strong>overlay</strong> is designed for Docker Swarm multi-host networking. It uses VXLAN encapsulation to carry traffic between nodes, so containers running on different machines can still communicate as if they were on the same logical network. In Swarm, the control plane manages the network state internally, so you do not manually configure the key-value store the way older Docker cluster setups required.</p>
        <p><code>docker network create --driver overlay app-overlay</code></p>
        <p>Use overlay when you need service-to-service communication across multiple Swarm nodes, such as a distributed application that scales beyond one host.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Create each network type",
          code: "docker network create --driver bridge app-net\ndocker network create --driver host host-net\ndocker network create --driver none isolated-net\ndocker network create --driver overlay app-overlay",
          explanation:
            "Each built-in driver optimizes for a different use case: isolation, host integration, no networking, or cross-host routing.",
        },
      ],
      keyTakeaways: [
        "bridge is the default and gives containers their own IP addresses on a private Docker subnet",
        "host removes the network namespace and is Linux-only on Docker Desktop-supported platforms",
        "none disables networking entirely for offline or tightly controlled workloads",
        "overlay is for Swarm and uses VXLAN to connect containers across hosts",
      ],
    },
    {
      id: "dns-resolution-inside-docker-networks",
      title: "DNS Resolution Inside Docker Networks",
      content: `
        <p>Docker provides an embedded DNS server inside every container attached to a <strong>custom network</strong>. That DNS server listens at <code>127.0.0.11</code>, and it resolves container names and service names to the current container IPs on that network.</p>
        <p>This is one of the main reasons you should create custom networks instead of relying on the default bridge. The default bridge network does not provide the same built-in name resolution for container names, so you end up depending on IP addresses, and those can change whenever a container is recreated.</p>
        <p>On a custom bridge network, Docker Compose makes this behavior even easier. Compose automatically creates a project network and uses service names as DNS hostnames, which means one service can reach another by name instead of by hard-coded IP. For example, an API service can reach a database service at <code>db:5432</code> inside the Compose network.</p>
        <p>When a container restarts, its IP address may change, but the DNS record is updated automatically by Docker. That is why hardcoding container IPs is fragile. Name-based communication survives container recreation, scaling, and restart events far better than fixed addresses.</p>
        <p>You can inspect a container to find both its IP address and DNS-related settings:</p>
        <p><code>docker inspect myapp</code></p>
        <p>Inside the JSON output, look under <code>NetworkSettings</code> for the container's IP address and under <code>ResolvConfPath</code> or the network configuration fields to understand how Docker has attached the container to the network. In practice, the simpler rule is: use names on custom networks, and let Docker handle the IP mapping for you.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Inspect DNS and IP information",
          code: "docker inspect myapp\ndocker exec myapp cat /etc/resolv.conf\ndocker exec myapp getent hosts db",
          explanation:
            "Docker injects 127.0.0.11 as the internal DNS resolver on custom networks, and service names resolve to current container IPs automatically.",
        },
      ],
      keyTakeaways: [
        "Docker's embedded DNS server runs at 127.0.0.11 inside containers on custom networks",
        "The default bridge network does not provide the same name-based service discovery",
        "Docker Compose creates a named network and resolves services by service name",
        "Container IPs can change on restart, so DNS names are more reliable than hardcoded IPs",
      ],
    },
    {
      id: "port-publishing-and-security",
      title: "Port Publishing and Security",
      content: `
        <p><code>EXPOSE</code> in a Dockerfile and <code>-p</code> in <code>docker run</code> do very different jobs. <code>EXPOSE</code> is documentation only: it tells readers and tools which port the container expects to use, but it does not publish anything at runtime. By contrast, <code>-p</code> actually publishes the container port on the host and makes it reachable from outside the container.</p>
        <p><code>docker run -p 80:80 nginx</code> binds the container port to <code>0.0.0.0</code> on the host by default, which means all host interfaces can accept connections, including external network interfaces if the host firewall allows them. If you only want local access, you can bind to localhost instead:</p>
        <p><code>docker run -p 127.0.0.1:80:80 postgres</code></p>
        <p>That pattern is much safer for databases or admin tools that should not be reachable from the network. A database accidentally published on <code>0.0.0.0</code> can become reachable from other machines, which is a common and serious security mistake.</p>
        <p>On Linux, Docker programs iptables rules directly to handle port forwarding. That means published ports may still be reachable even when users expect UFW or another host firewall to block them, because Docker installs its own chains and NAT rules before the firewall rules many people think about first. This is a common source of security surprises, so you should verify both Docker port publishing and host firewall policy whenever you expose a service.</p>
        <p>Use <code>EXPOSE</code> to document intent in the image, use <code>-p</code> to publish only the ports you actually want reachable, and prefer localhost bindings for services that are intended for local development only.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Publishing ports safely",
          code: "docker run -d -p 80:80 nginx\ndocker run -d -p 127.0.0.1:5432:5432 postgres\ndocker inspect nginx",
          explanation:
            "Use -p for actual runtime publishing, prefer localhost bindings for private services, and remember that Docker updates iptables rules directly on Linux.",
        },
      ],
      keyTakeaways: [
        "EXPOSE documents a port but does not publish it at runtime",
        "-p actually opens a host port and forwards traffic into the container",
        "Binding to 127.0.0.1 keeps a service local to the host",
        "Docker manages iptables/NAT rules directly, which can surprise users who rely on UFW alone",
      ],
    },
  ],
};

const dockerfilePage = {
  id: "dockerfile",
  title: "Dockerfile Guide",
  icon: "🧱",
  subtitle:
    "Write reproducible image builds with layered instructions and caching.",
  tags: ["dockerfile", "build", "layers", "cache"],
  meta: ["📖 12 min read", "🟡 Intermediate"],
  sections: [
    {
      id: "dockerfile-basics",
      title: "What Dockerfiles Do",
      content:
        "<p>A Dockerfile is a build recipe. Each instruction adds a layer to the final image, so instruction order affects build caching and image size.</p>",
      keyTakeaways: [
        "Each instruction becomes a layer",
        "Order the file for cache efficiency",
        "Use .dockerignore to keep the build context small",
      ],
    },
    {
      id: "dockerfile-example",
      title: "A Simple Example",
      codeExamples: [
        {
          language: "dockerfile",
          title: "Node.js example",
          code: 'FROM node:24-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]',
          explanation:
            "Copy dependency files first so installs stay cached when application code changes.",
        },
      ],
    },
    {
      id: "dockerfile-security",
      title: "Hardening Tips",
      content:
        "<p>Use minimal base images, run as a non-root user, and avoid baking secrets into the image.</p>",
      keyTakeaways: [
        "Use minimal base images when possible",
        "Switch to a non-root user",
        "Never commit secrets into image layers",
      ],
    },
    {
      id: "layer-caching-explained",
      title: "Layer Caching - How It Works and How to Exploit It",
      content: `
        <p>Docker cache is layer-based. The exact rule is simple: <strong>once a layer changes, Docker invalidates the cache from that layer onward</strong>. That means instruction order is not cosmetic. It is a performance decision because a bad order can force expensive steps to repeat every time you rebuild.</p>
        <p>A <strong>cache miss</strong> at the layer level means Docker cannot reuse the previously built result for that instruction. Docker computes cache keys differently depending on the instruction. For <code>COPY</code> and <code>ADD</code>, the cache key depends on the files being copied, including checksums of file contents and metadata that affect the build. For <code>RUN</code>, the cache key is tied to the command string and the state of the filesystem from the preceding layers. If anything earlier changes, every later layer can miss the cache too.</p>
        <p>That is why this is a bad pattern:</p>
        <p><code>COPY . .</code><br><code>RUN npm install</code></p>
        <p>With that order, any source file change updates the <code>COPY</code> layer, which invalidates the cache, which then forces <code>npm install</code> to run again even though your package dependencies may not have changed. The better pattern is:</p>
        <p><code>COPY package*.json ./</code><br><code>RUN npm install</code><br><code>COPY . .</code></p>
        <p>Now dependency installation only reruns when <code>package.json</code> or <code>package-lock.json</code> changes, while ordinary source edits keep the dependency layer cached. That can save minutes on every build in larger projects.</p>
        <p>In CI pipelines, <code>--no-cache</code> is useful when you want a fully clean build, such as validating that the Dockerfile really works from scratch or testing dependency updates without reuse from a previous run. For daily development, though, cache reuse is usually what you want.</p>
        <p>BuildKit improves this further with cache mounts. Instead of rebuilding package caches every time, you can persist a tool-specific cache directory across builds using <code>RUN --mount=type=cache</code>. For example, package managers can keep downloaded archives between builds while still producing clean final images. The image layer stays reproducible, but the build process becomes much faster.</p>
      `,
      codeExamples: [
        {
          language: "dockerfile",
          title: "Good caching pattern",
          code: '# syntax=docker/dockerfile:1.7\nFROM node:24-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN --mount=type=cache,target=/root/.npm npm install\nCOPY . .\nCMD ["node", "server.js"]',
          explanation:
            "Copy dependency files first so the expensive install step is cached until package manifests change, and use BuildKit cache mounts to speed up repeated installs.",
        },
      ],
      keyTakeaways: [
        "Docker reuses layers until the first changed layer, then invalidates everything after it",
        "COPY cache keys depend on file content and metadata, while RUN depends on the command plus previous filesystem state",
        "Put dependency manifests before source code so installs stay cached",
        "BuildKit cache mounts keep package caches across builds without baking them into the image",
      ],
    },
    {
      id: "entrypoint-vs-cmd",
      title: "ENTRYPOINT vs CMD - The Exact Difference",
      content: `
        <p><code>CMD</code> and <code>ENTRYPOINT</code> are often confused because they both influence what starts inside the container, but they serve different roles. <strong>CMD sets the default command or arguments that can be completely overridden at <code>docker run</code> time</strong>. <strong>ENTRYPOINT sets a fixed executable that always runs</strong>. When both are present, <code>CMD</code> becomes the default argument list for the <code>ENTRYPOINT</code> executable.</p>
        <p>That distinction matters when you want a container to behave like a dedicated program. For example, a containerized CLI tool usually wants a fixed entrypoint, while an application image may want a default command that can be replaced by the operator.</p>
        <p>There is also a critical difference between <strong>exec form</strong> and <strong>shell form</strong>. Exec form uses JSON array syntax like <code>[\"nginx\", \"-g\", \"daemon off;\"]</code>. Shell form uses a plain string, which Docker wraps in <code>/bin/sh -c</code>. That wrapping changes signal handling. If the shell sits between Docker and your process, signals such as <strong>SIGTERM</strong> go to <code>sh</code> instead of your app, and graceful shutdown can fail because your actual process never receives the termination signal directly.</p>
        <p>The production-safe fix is straightforward: <strong>always use exec form for both <code>ENTRYPOINT</code> and <code>CMD</code> in production containers</strong>. That way the process at PID 1 is your actual application or wrapper script, not an intermediate shell.</p>
        <p>A practical mental model is: <code>ENTRYPOINT</code> says "this image is for running <em>this program</em>" and <code>CMD</code> says "these are the default arguments unless the operator overrides them."</p>
      `,
      codeExamples: [
        {
          language: "dockerfile",
          title: "ENTRYPOINT + CMD in exec form",
          code: 'FROM alpine:3.21\nENTRYPOINT ["python", "/app/server.py"]\nCMD ["--port", "8080"]',
          explanation:
            "The executable is fixed by ENTRYPOINT, while CMD supplies default arguments that can still be replaced when needed.",
        },
        {
          language: "bash",
          title: "Override CMD but keep ENTRYPOINT",
          code: "docker run myimage --port 9090",
          explanation:
            "The image's ENTRYPOINT still runs, but the CMD arguments are replaced by the values you pass at docker run time.",
        },
      ],
      keyTakeaways: [
        "CMD provides defaults that can be overridden completely by docker run",
        "ENTRYPOINT fixes the executable that always runs",
        "When both are used, CMD becomes default arguments for ENTRYPOINT",
        "Use exec form to ensure signals reach the real process instead of /bin/sh -c",
      ],
    },
    {
      id: "multi-stage-builds",
      title: "Multi-Stage Builds for Real Size Reduction",
      content: `
        <p>Multi-stage builds let you separate the build environment from the runtime image. This is the cleanest way to shrink images without losing build tooling. A Go example makes the savings obvious because the compiler can produce a self-contained binary.</p>
        <p>In a typical single-stage Go build, you might use <code>golang:1.22-alpine</code> as the base image. That image includes the Go toolchain, package manager data, and an Alpine userland, so it is often well over <strong>600MB</strong> once the build environment is assembled. That is great for compiling code, but too large for production if all you need is a binary.</p>
        <p>With a multi-stage build, the first stage compiles the binary, and the final stage copies only the compiled artifact. A final stage based on <code>scratch</code> starts from an empty filesystem. <strong>scratch</strong> is Docker's special empty base image, and it works well for statically compiled languages like Go because the binary can run without the original build tools or runtime libraries. The result is often around a <strong>10MB</strong> production image instead of a 600MB build environment.</p>
        <p>Some teams choose <strong>distroless</strong> images instead of scratch. Distroless images are Google's minimal runtime images that include only the essentials needed to run an app, often including CA certificates and timezone data. That makes them a good option when you want a tiny runtime image but still need TLS trust stores or timezone handling.</p>
        <p>The key syntax is <code>COPY --from=builder</code>. That instruction copies files from a previous build stage into the current one. It is what lets you take the compiled Go binary from the build image and place it into the empty runtime image without carrying the whole toolchain along for the ride.</p>
      `,
      codeExamples: [
        {
          language: "dockerfile",
          title: "Go multi-stage build",
          code: 'FROM golang:1.22-alpine AS builder\nWORKDIR /src\nCOPY . .\nRUN go build -o /out/app ./cmd/app\n\nFROM scratch\nCOPY --from=builder /out/app /app\nENTRYPOINT ["/app"]',
          explanation:
            "The builder stage contains the toolchain, but the final image contains only the compiled binary, which keeps the runtime image tiny.",
        },
      ],
      keyTakeaways: [
        "Multi-stage builds separate build tooling from the final runtime image",
        "scratch is an empty base image that works well for statically compiled binaries",
        "distroless images are a minimal alternative that keep CA certificates and timezone data",
        "COPY --from=builder copies only the needed artifact into the final image",
      ],
    },
  ],
};

const securityPage = {
  id: "security",
  title: "Docker Security",
  icon: "🛡️",
  subtitle:
    "Practical guidance for safer container builds and runtime defaults.",
  tags: ["security", "hardening", "scanning", "non-root"],
  meta: ["📖 11 min read", "🟠 Advanced"],
  sections: [
    {
      id: "security-basics",
      title: "Security Baselines",
      content:
        "<p>Containers are not secure by default. Start with least privilege, minimal images, and clear separation of secrets from image content.</p>",
      keyTakeaways: [
        "Run as non-root",
        "Pin exact image versions",
        "Limit capabilities and resources",
      ],
    },
    {
      id: "security-tools",
      title: "Scanning and Review",
      codeExamples: [
        {
          language: "bash",
          title: "Security workflow",
          code: "docker scout cves myapp:1.0\ndocker inspect myapp\ndocker run --read-only myapp",
          explanation: "Review images before shipping them to production.",
        },
      ],
    },
    {
      id: "security-operating",
      title: "Operational Habits",
      content:
        "<p>Prefer immutable deployments, rotate secrets outside the image, and keep logs and storage policies explicit.</p>",
      keyTakeaways: [
        "Never store secrets in Dockerfiles",
        "Use read-only filesystems when possible",
        "Keep images small and auditable",
      ],
    },
    {
      id: "running-as-non-root",
      title: "Running as Non-Root - The Complete Picture",
      content: `
        <p>Containers run as root by default because the Docker daemon itself runs as root on the host, and if you do not specify a <code>USER</code> instruction, the container process inherits root inside the container. That does not mean the container has unrestricted access to the host, but it does mean the process inside the container starts with a powerful identity inside its own namespace.</p>
        <p>If an attacker compromises a root-running container, the impact depends on what is mounted into it. If a bind mount or volume is attached, the attacker may be able to modify host files through that mount. They can also interact with other container namespaces if they escape the container boundary, and they can write to bind-mounted paths with root privileges inside the container. That is why root inside a container is still a risk even though it is not the same thing as host root.</p>
        <p>The correct pattern is to create a dedicated system user during the image build, fix file ownership at build time, and then switch to that user before the final process starts. On Alpine, you typically use <code>addgroup</code> and <code>adduser</code>. On Debian-based images, you use <code>groupadd</code> and <code>useradd</code>. The important part is that the application files and writable directories are owned by the non-root user before the <code>USER</code> instruction takes effect.</p>
        <p>Example pattern:</p>
        <p><code>RUN addgroup -S app &amp;&amp; adduser -S app -G app</code><br><code>COPY --chown=app:app . /app</code><br><code>USER app</code></p>
        <p>On Debian-style images, the equivalent is usually:</p>
        <p><code>RUN groupadd -r app &amp;&amp; useradd -r -g app app</code><br><code>RUN chown -R app:app /app</code><br><code>USER app</code></p>
        <p>Docker also supports user namespace remapping at the daemon level with <code>--userns-remap</code>. That maps container root to an unprivileged host user, so even if a container process thinks it is UID 0 inside the container, that identity is translated to a non-root user on the host. This is defence in depth: it does not replace non-root containers, but it reduces the blast radius if a container escape ever happens.</p>
      `,
      codeExamples: [
        {
          language: "dockerfile",
          title: "Non-root Dockerfile pattern",
          code: 'FROM alpine:3.21\nRUN addgroup -S app && adduser -S app -G app\nWORKDIR /app\nCOPY --chown=app:app . /app\nUSER app\nCMD ["node", "server.js"]',
          explanation:
            "Create a dedicated user, make the application files owned by that user, and switch to it before the main process starts.",
        },
      ],
      keyTakeaways: [
        "Root inside the container is the default unless you set USER",
        "Mounted paths are the biggest practical risk because root in the container can write to them",
        "Create a dedicated system user and chown files during the image build",
        "--userns-remap maps container root to an unprivileged host user for extra protection",
      ],
    },
    {
      id: "linux-capabilities",
      title: "Linux Capabilities - Drop Everything You Do Not Need",
      content: `
        <p>Docker does not give containers full root by default. Instead, it grants a limited set of Linux capabilities that cover common application needs. Capabilities are small pieces of root power, so the security goal is to keep only the ones your process genuinely needs.</p>
        <p>The default Docker capability set includes <code>AUDIT_WRITE</code>, <code>CHOWN</code>, <code>DAC_OVERRIDE</code>, <code>FOWNER</code>, <code>FSETID</code>, <code>KILL</code>, <code>MKNOD</code>, <code>NET_BIND_SERVICE</code>, <code>NET_RAW</code>, <code>SETFCAP</code>, <code>SETGID</code>, <code>SETPCAP</code>, <code>SETUID</code>, and <code>SYS_CHROOT</code>. That is already a reduced set compared with host root, but some of those are still dangerous if your workload does not need them.</p>
        <p><code>NET_RAW</code> is risky because it allows raw packet crafting, which is useful for network attacks and traffic manipulation. <code>SYS_PTRACE</code> is not part of the default set, but if you add it, a process can attach debuggers to other processes and inspect memory. <code>SYS_ADMIN</code> is the classic "almost full root" capability; if you grant it, you are giving away far more power than most applications need, and it should almost never be enabled in normal production use.</p>
        <p>The safest pattern is to start with nothing and add back only what you need. For a web server that only needs to bind to port 80, the right policy is often:</p>
        <p><code>docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx</code></p>
        <p>That keeps the ability to bind to privileged ports without carrying the rest of the default capability set. If a container really needs extra privileges, add them one by one and document why. Avoid <code>--privileged</code> entirely in production. <code>--privileged</code> effectively gives the container access to all host capabilities, devices, and kernel interfaces, which is close to handing over host root and defeats most of Docker's isolation model.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Drop all capabilities and add one back",
          code: "docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx\ndocker run --cap-drop ALL --cap-add NET_BIND_SERVICE --name web nginx",
          explanation:
            "Start from zero capabilities and add only the single capability required to bind to port 80.",
        },
      ],
      keyTakeaways: [
        "Docker gives containers a limited default capability set, not full root",
        "NET_RAW is part of the default set and can be abused for packet-level attacks",
        "SYS_PTRACE and SYS_ADMIN are highly dangerous if added and should be avoided unless absolutely necessary",
        "--privileged should not be used in production because it removes most containment benefits",
      ],
    },
    {
      id: "image-scanning-supply-chain",
      title: "Image Scanning and Supply Chain Security",
      content: `
        <p>A <strong>CVE</strong> is a publicly known vulnerability that has been cataloged and assigned an identifier. In container security, a CVE usually means one of the packages bundled into the image contains a known bug that attackers can exploit.</p>
        <p>There are three places CVEs can enter your image: your application code, your dependencies, and your base image. A secure container review has to consider all three. Your own code may contain vulnerabilities, your package manager dependencies may pull in unsafe libraries, and the base image itself may include an old shell, SSL library, or OS package with known issues.</p>
        <p><code>docker scout cves myapp:1.0</code> scans an image and reports the vulnerabilities it finds. Docker Scout requires you to be signed in with <code>docker login</code>, and public-image scanning is available on the free tier. When reading the output, focus first on severity, then on fix availability, then on whether the vulnerable package is actually used in the runtime image. Not every CVE is equally urgent, but none of them should be ignored blindly.</p>
        <p>One of the easiest ways to reduce CVE count is to use a smaller base image. Alpine-based images typically contain far fewer packages than Debian or Ubuntu-based images, so they often have fewer vulnerabilities to begin with. Distroless images go even further by stripping the runtime down to the essentials. That does not make them magically secure, but it does remove a lot of attack surface and package maintenance burden.</p>
        <p>For supply-chain integrity, Docker Content Trust adds image signing with Notary-backed signatures. When you set <code>DOCKER_CONTENT_TRUST=1</code>, Docker refuses to pull unsigned images from registries that support the signing workflow. This helps you avoid accidentally consuming a tampered or unverified image, especially in environments where provenance matters.</p>
        <p>The practical rule is simple: scan images before they ship, minimize the number of packages you carry, and prefer signed, trusted sources whenever your workflow supports them.</p>
      `,
      codeExamples: [
        {
          language: "bash",
          title: "Scan and enforce signed pulls",
          code: "docker login\ndocker scout cves myapp:1.0\nDOCKER_CONTENT_TRUST=1 docker pull nginx:alpine",
          explanation:
            "Docker Scout shows known vulnerabilities in the image layers, and Docker Content Trust can refuse unsigned image pulls when trust is enabled.",
        },
      ],
      keyTakeaways: [
        "A CVE is a known vulnerability in a package, library, or component bundled into the image",
        "Your code, your dependencies, and your base image all contribute to the final CVE profile",
        "Docker Scout helps identify vulnerabilities and requires Docker login for registry access",
        "Alpine and distroless images often reduce CVE counts by carrying fewer packages",
        "DOCKER_CONTENT_TRUST=1 refuses unsigned pulls for registries that support signed content",
      ],
    },
  ],
};

const contactPage = {
  id: "contact",
  title: "Contact",
  icon: "✉️",
  subtitle: "Ways to get in touch about content, corrections, and feedback.",
  tags: ["contact", "support"],
  meta: ["📖 5 min read"],
  sections: [
    {
      id: "contact-info",
      title: "Contact Information",
      content: `
        <p>If you have corrections, content requests, or other feedback, email <a href="mailto:roko14865@gmail.com">roko14865@gmail.com</a>.</p>
        <p>For project links and updates, visit the About page or the GitHub profile linked there.</p>
      `,
      keyTakeaways: [
        "Email: roko14865@gmail.com",
        "Use the About page for project context",
        "Privacy and terms are linked in the footer",
      ],
    },
    {
      id: "report-content-error",
      title: "How to Report a Content Error",
      content: `
        <p>This is a technical educational site, so accuracy matters. If you spot a mistake, the best reports are specific and easy to reproduce.</p>
        <p>Please include the page name, the exact command or statement that is wrong, and the corrected version of the information. If possible, add a reference such as a Docker documentation URL or release note that supports the correction. Docker CLI behaviour can differ between versions, especially across Docker Engine 24.x, 25.x, and Buildx, so version context is extremely helpful.</p>
        <p>For example, if a command behaves differently in BuildKit or a newer CLI release, say which version you used and what you observed. That lets us verify whether the issue is a documentation problem, a version-specific change, or a misunderstanding that needs clarification.</p>
        <p>For corrections, email <a href="mailto:roko14865@gmail.com">roko14865@gmail.com</a>.</p>
      `,
      keyTakeaways: [
        "Include the page name and the exact incorrect statement or command",
        "Provide the corrected version plus a Docker docs or release-note reference",
        "Mention your Docker Engine or Buildx version when behaviour differs across releases",
        "Use roko14865@gmail.com for correction reports",
      ],
    },
    {
      id: "useful-official-resources",
      title: "Useful Official Resources",
      content: `
        <p>These are the official Docker resources worth bookmarking. They are the most reliable places to verify behaviour, read release notes, and follow product updates.</p>
        <ul>
          <li><a href="https://docs.docker.com/" target="_blank" rel="noreferrer">docs.docker.com</a> — the official Docker documentation and the authoritative reference for CLI flags, workflows, and product behaviour.</li>
          <li><a href="https://hub.docker.com/" target="_blank" rel="noreferrer">hub.docker.com</a> — the official image registry; when choosing base images, always check for the <strong>Official Image</strong> badge.</li>
          <li><a href="https://github.com/docker" target="_blank" rel="noreferrer">github.com/docker</a> — Docker's open source organization, useful for release notes, source code, and open issues.</li>
          <li><a href="https://forums.docker.com/" target="_blank" rel="noreferrer">forums.docker.com</a> — the Docker community forums for questions that documentation alone does not answer.</li>
          <li><a href="https://github.com/docker/roadmap" target="_blank" rel="noreferrer">github.com/docker/roadmap</a> — Docker's public product roadmap for upcoming features and community feedback.</li>
        </ul>
      `,
      keyTakeaways: [
        "Use docs.docker.com as the primary source of truth for CLI and engine behaviour",
        "Check the Official Image badge on Docker Hub before trusting a base image",
        "Use Docker's GitHub org for source, issues, and release context",
        "Use the forums for community support and the roadmap for future feature visibility",
      ],
    },
    {
      id: "learning-path-recommendation",
      title: "Learning Path Recommendation",
      content: `
        <p>Use the site in a deliberate order. Start with <strong>L0</strong> even if you already know a little Docker, because the VM-vs-container comparison alone saves most people hours of confusion. The early mental model is worth more than skipping ahead.</p>
        <p>Do not skip the <strong>Glossary</strong>. It collects the 30 terms that keep appearing throughout the site, and those terms are what let the rest of the content click together.</p>
        <p>Bookmark <strong>Quick Notes</strong> as a daily reference. It is the page you will return to when you need a fast reminder of commands, patterns, or common definitions.</p>
        <p>Read <strong>Common Mistakes</strong> before your first production deployment, not after. It covers the errors that are easiest to make when you are moving from learning to actually shipping containers.</p>
        <p>That sequence gives you a cleaner learning curve: foundation first, vocabulary second, quick reference third, and production safety last.</p>
      `,
      keyTakeaways: [
        "Start with L0 even if you already have some experience",
        "Use the Glossary to lock in the recurring terms",
        "Keep Quick Notes bookmarked for everyday reference",
        "Read Common Mistakes before your first production deployment",
      ],
    },
  ],
};

const aboutPage = {
  id: "about",
  title: "About",
  icon: "ℹ️",
  subtitle: "About the Docker Learning Hub and its mission.",
  tags: ["about", "project"],
  meta: ["📖 3 min read"],
  sections: [
    {
      id: "about-project",
      title: "About This Project",
      content: `
        <p>The Docker Learning Hub is a free, open-source resource designed to help developers understand Docker concepts, workflows, and best practices.</p>
        <p>This site covers everything from fundamental concepts like images and containers to advanced topics like system design patterns and security.</p>
        <p>Whether you're just starting with Docker or looking to deepen your expertise, the Hub provides practical explanations and real-world examples.</p>
      `,
      keyTakeaways: [
        "Free educational resource for Docker developers",
        "Covers beginner to advanced topics",
        "Practical, real-world focused content",
      ],
    },
  ],
};

const privacyPolicyPage = {
  id: "privacy-policy",
  title: "Privacy Policy",
  icon: "🔒",
  subtitle: "How we handle your data and privacy.",
  tags: ["privacy", "policy"],
  meta: ["📖 2 min read"],
  sections: [
    {
      id: "privacy-info",
      title: "Privacy Policy",
      content: `
        <p>We respect your privacy. This website does not collect personal information without your consent.</p>
        <p>We may use analytics tools to understand how visitors use the site, but no personally identifiable information is collected or stored.</p>
        <p>If you have questions about our privacy practices, please contact us via the Contact page.</p>
      `,
      keyTakeaways: [
        "No personal information collection",
        "Analytics for site improvement only",
        "Your privacy is respected",
      ],
    },
  ],
};

const termsPage = {
  id: "terms",
  title: "Terms of Service",
  icon: "⚖️",
  subtitle: "Terms and conditions for using this site.",
  tags: ["terms", "service", "legal"],
  meta: ["📖 2 min read"],
  sections: [
    {
      id: "terms-info",
      title: "Terms of Service",
      content: `
        <p>By using the Docker Learning Hub, you agree to these terms and conditions.</p>
        <p>The content on this site is provided "as is" for educational purposes. While we strive for accuracy, we make no warranties about completeness or accuracy.</p>
        <p>You are free to use, share, and reference this content in your learning journey. For detailed usage rights, please contact us.</p>
      `,
      keyTakeaways: [
        "Content provided for educational purposes",
        "No warranties or guarantees",
        "Free to use and reference",
      ],
    },
  ],
};

export const PAGES = {
  "quick-notes": quickNotes,
  overview,
  images: imagesPage,
  containers: containersPage,
  volumes: volumesPage,
  networking: networkingPage,
  dockerfile: dockerfilePage,
  compose,
  features,
  tools,
  integrations,
  guides,
  "system-design": systemDesign,
  mistakes,
  glossary,
  resources,
  implementation,
  languages,
  security: securityPage,
  contact: contactPage,
  about: aboutPage,
  "privacy-policy": privacyPolicyPage,
  terms: termsPage,
  "level-0": levels["level-0"],
  "level-1": levels["level-1"],
  "level-2": levels["level-2"],
  "level-3": levels["level-3"],
  "level-4": levels["level-4"],
};

export const ROUTES = [
  {
    key: "overview",
    path: "/",
    pageKey: "overview",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    key: "quick-notes",
    path: "/quick-notes",
    pageKey: "quick-notes",
    priority: "0.8",
    changefreq: "weekly",
  },
  {
    key: "images",
    path: "/images",
    pageKey: "images",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "containers",
    path: "/containers",
    pageKey: "containers",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "volumes",
    path: "/volumes",
    pageKey: "volumes",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "networking",
    path: "/networking",
    pageKey: "networking",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "dockerfile",
    path: "/dockerfile",
    pageKey: "dockerfile",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "compose",
    path: "/compose",
    pageKey: "compose",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "features",
    path: "/features",
    pageKey: "features",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "tools",
    path: "/tools",
    pageKey: "tools",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "integrations",
    path: "/integrations",
    pageKey: "integrations",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "languages",
    path: "/languages",
    pageKey: "languages",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "implementation",
    path: "/implementation",
    pageKey: "implementation",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "guides",
    path: "/guides",
    pageKey: "guides",
    priority: "0.8",
    changefreq: "weekly",
  },
  {
    key: "system-design",
    path: "/system-design",
    pageKey: "systemDesign",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "mistakes",
    path: "/mistakes",
    pageKey: "mistakes",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "security",
    path: "/security",
    pageKey: "security",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    key: "glossary",
    path: "/glossary",
    pageKey: "glossary",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    key: "resources",
    path: "/resources",
    pageKey: "resources",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    key: "contact",
    path: "/contact",
    pageKey: "contact",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    key: "about",
    path: "/about",
    pageKey: "about",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    key: "privacy-policy",
    path: "/privacy-policy",
    pageKey: "privacy-policy",
    priority: "0.5",
    changefreq: "yearly",
  },
  {
    key: "terms",
    path: "/terms",
    pageKey: "terms",
    priority: "0.5",
    changefreq: "yearly",
  },
  {
    key: "level-0",
    path: "/level-0",
    pageKey: "level-0",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    key: "level-1",
    path: "/level-1",
    pageKey: "level-1",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    key: "level-2",
    path: "/level-2",
    pageKey: "level-2",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    key: "level-3",
    path: "/level-3",
    pageKey: "level-3",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    key: "level-4",
    path: "/level-4",
    pageKey: "level-4",
    priority: "0.9",
    changefreq: "monthly",
  },
];

export function routeToPath(routeKey) {
  if (!routeKey || routeKey === "overview") return "/";
  return routeKey.startsWith("/") ? routeKey : `/${routeKey}`;
}

export function pathToRoute(pathname = "/") {
  const clean =
    pathname.replace(/index\.html?$/i, "").replace(/\/+$/, "") || "/";
  if (clean === "/" || clean === "") return "overview";
  return clean.split("/").filter(Boolean)[0] || "overview";
}

export function getPageByRoute(routeKey) {
  return PAGES[routeKey] || PAGES.overview;
}
