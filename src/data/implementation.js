// IMPLEMENTATION.JS — Ways to use Docker
export const implementation = {
  id:'implementation',title:'Implementation Methods',icon:'🖥️',
  subtitle:'All the ways you can use and interact with Docker.',
  tags:['cli','desktop','vscode','automation','tools'],
  meta:['📖 10 min','🟢 All Levels'],
  sections:[
    {
      id:'cli-method',title:'Docker CLI (Primary Method)',
      content:`<p>The <strong>Docker CLI</strong> is the primary way developers interact with Docker. It's installed with Docker Engine and Docker Desktop.</p>
      <ul>
        <li><strong>Most powerful</strong> — full access to every Docker feature</li>
        <li><strong>Scriptable</strong> — easy to automate with shell scripts</li>
        <li><strong>Universal</strong> — works on Linux, macOS, Windows (via WSL)</li>
        <li><strong>CI/CD ready</strong> — used in all pipeline systems</li>
      </ul>`,
      codeExamples:[{language:'bash',title:'CLI workflow example',code:`# Build
docker build -t myapp:1.0 .

# Test
docker run --rm myapp:1.0 npm test

# Run locally
docker compose up -d

# Deploy
docker push myregistry.com/myapp:1.0`,explanation:'The CLI covers the entire lifecycle: build, test, run, deploy'}],
      keyTakeaways:['CLI is the most complete Docker interface','All automation and CI/CD uses the CLI','Learn CLI first, then explore GUI tools','docker --help and docker <command> --help are your friends']
    },
    {
      id:'docker-desktop',title:'Docker Desktop',
      content:`<p><strong>Docker Desktop</strong> provides a GUI for managing Docker on Windows and macOS.</p>
      <ul>
        <li><strong>GUI dashboard</strong> — visual container, image, and volume management</li>
        <li><strong>Integrated tools</strong> — Docker Compose, Kubernetes, Docker Scout</li>
        <li><strong>Resource management</strong> — configure CPU, memory limits</li>
        <li><strong>Extensions</strong> — marketplace of additional tools</li>
        <li><strong>WSL 2 backend</strong> — native Linux containers on Windows</li>
      </ul>`,
      alerts:[{type:'info',title:'Licensing',text:'Docker Desktop is <strong>free for personal use</strong> and small businesses (< 250 employees and < $10M revenue). Larger organizations need a paid subscription.'}],
      keyTakeaways:['Best for developers on Windows/macOS','Free for personal use and small businesses','Includes Docker Engine, Compose, and Kubernetes','WSL 2 backend for Windows performance']
    },
    {
      id:'vscode-integration',title:'VS Code Integration',
      content:`<p>The <strong>Docker extension for VS Code</strong> provides integrated container management:</p>
      <ul>
        <li><strong>Explorer panel</strong> — view and manage containers, images, volumes, networks</li>
        <li><strong>Dockerfile IntelliSense</strong> — autocomplete, syntax highlighting, linting</li>
        <li><strong>Compose IntelliSense</strong> — YAML validation and autocomplete</li>
        <li><strong>Dev Containers</strong> — develop inside a container with full VS Code support</li>
        <li><strong>One-click actions</strong> — start, stop, attach, view logs from the sidebar</li>
      </ul>`,
      codeExamples:[{language:'json',title:'.devcontainer/devcontainer.json',code:`{
  "name": "Node.js Dev Container",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint"]
    }
  }
}`,explanation:'Dev Containers let you develop inside a container with all tools pre-configured'}],
      keyTakeaways:['Install "Docker" extension from Microsoft','Dev Containers provide reproducible dev environments','IntelliSense for Dockerfiles and Compose files','Right-click containers to start/stop/attach/logs']
    },
    {
      id:'automation',title:'Automation Scripts',
      content:`<p>Docker is designed for automation. Common patterns:</p>`,
      codeExamples:[
        {language:'bash',title:'Build and deploy script',code:`#!/bin/bash
set -e

VERSION=$(git rev-parse --short HEAD)
IMAGE="myregistry.com/myapp:$VERSION"

echo "Building $IMAGE..."
docker build -t "$IMAGE" .

echo "Running tests..."
docker run --rm "$IMAGE" npm test

echo "Pushing to registry..."
docker push "$IMAGE"

echo "Deploying..."
docker compose -f compose.prod.yaml up -d --pull always

echo "✅ Deployed $IMAGE"`,explanation:'A simple deploy script that builds, tests, pushes, and deploys'},
        {language:'bash',title:'Cleanup script',code:`#!/bin/bash
echo "Cleaning up Docker resources..."
docker container prune -f
docker image prune -a -f
docker volume prune -f
docker network prune -f
echo "✅ Cleanup complete"
docker system df`,explanation:'Run periodically to reclaim disk space'}
      ],
      keyTakeaways:['Automate repetitive Docker tasks with scripts','Use set -e to stop on errors','Tag images with git SHA for traceability','Cleanup scripts prevent disk space issues']
    }
  ]
};
