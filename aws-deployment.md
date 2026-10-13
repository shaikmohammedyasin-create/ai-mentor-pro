# AWS App Runner Deployment Guide

This guide describes how to deploy the containerized AI Mentor Pro application to AWS App Runner.

## Deployment Overview
AWS App Runner is a fully managed service that makes it easy for developers to quickly deploy containerized web applications and APIs, at scale and with no prior infrastructure experience.

There are two primary deployment methods:
1. **Container Registry (ECR) based deployment (Recommended for production)**
2. **GitHub Repository based deployment (Automatic builds from source)**

---

## Method 1: Deploying via Amazon ECR (Recommended)

### 1. Build and Tag the Docker Image Locally
Run the following commands to build the production image:
```bash
docker build -t ai-mentor-pro .
```

### 2. Push Image to Amazon ECR
Create a repository in Amazon ECR and push your image:
```bash
# Log in to ECR
aws ecr get-login-password --region <aws-region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com

# Create repository (if it doesn't exist)
aws ecr create-repository --repository-name ai-mentor-pro

# Tag and push the image
docker tag ai-mentor-pro:latest <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/ai-mentor-pro:latest
docker push <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/ai-mentor-pro:latest
```

### 3. Create the AWS App Runner Service
1. Go to the AWS Console, open **AWS App Runner**, and click **Create Service**.
2. For **Repository type**, choose **Container registry**.
3. For **Provider**, choose **Amazon ECR**.
4. Browse or paste your ECR image URI (`<aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/ai-mentor-pro:latest`).
5. Choose **Deployment settings**: *Manual* or *Automatic* (triggers redeployment whenever you push a new image).
6. Configure service settings:
   - **Service Name**: `ai-mentor-pro`
   - **Virtual CPU & Memory**: `1 vCPU, 2 GB` (recommended starting config).
   - **Port**: `8000` (Next.js server port configured in the Dockerfile).

---

## Method 2: Deploying via GitHub Source Code

1. Commit your project and push it to a private or public GitHub repository.
2. In the AWS App Runner console, click **Create Service**.
3. For **Repository type**, choose **Source code repository**.
4. Connect your GitHub account and select your repository and branch.
5. Under **Deployment settings**, choose **Automatic**.
6. Under **Configure build**:
   - **Runtime**: `Node.js 18` or `Node.js 20` (Note: ECR container method is preferred if your Next.js version requires Node 24 dependencies).
   - **Build command**: `npm install && npx prisma generate && npm run build`
   - **Start command**: `node .next/standalone/server.js`
   - **Port**: `8000`

---

## Configuration Settings

### Environment Variables
Configure these variables in the **Environment variables** section of the App Runner console:

| Variable Name | Value | Description |
|---|---|---|
| `DATABASE_URL` | `file:./db/custom.db` | Relative SQLite database connection path |
| `GROQ_API_KEY` | `your_actual_groq_api_key` | Secure API key (kept backend-only, never sent to client) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq inference LLM model |
| `NODE_ENV` | `production` | Production environment flag |
| `PORT` | `8000` | Port on which the container listens |

### Health Checks
Configure the health check to verify endpoint status in production:

- **Protocol**: `HTTP`
- **Path**: `/api/health`
- **Port**: `8000`
- **Interval**: `5 seconds`
- **Timeout**: `2 seconds`
- **Healthy threshold**: `3`
- **Unhealthy threshold**: `3`
