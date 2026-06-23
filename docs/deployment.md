# SentinelAI Deployment & Setup Guide

This document provides complete instructions for setting up, deploying, and maintaining **SentinelAI** in local development, containerized Docker, and production-grade Kubernetes environments. It also details the CI/CD deployment pipeline.

---

## Local Development Setup

### 1. Prerequisites
Ensure the host development machine meets the following requirements:
* **Operating System**: Linux (Ubuntu 22.04+ recommended), macOS, or Windows (WSL2 required).
* **Languages**: Python 3.11+ and Node.js 18+ (with npm v9+).
* **Databases/Services**: PostgreSQL 15+, Redis 7+.

---

### 2. Environment Configuration
Create a `.env` file in the project root directory.

```ini
# --- Core Config ---
ENVIRONMENT=development
SECRET_KEY=super-secret-gateway-key-change-in-production-98124
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# --- Databases ---
DATABASE_URL=postgresql://sentinel_user:SentinelPass123!@localhost:5432/sentinel_db
REDIS_URL=redis://localhost:6379/0

# --- LLM API Gateways ---
GEMINI_API_KEY=AIzaSyD_YourGeminiAPIKeyHere
OPENAI_API_KEY=sk-proj-YourOpenAIApiKeyHere
LLM_PROVIDER=gemini # Option: gemini | openai

# --- Alerts & Integrations ---
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_key
ADMIN_EMAIL=security_alerts@sentinelai.local
```

---

### 3. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Run database migrations to construct schemas:
   ```bash
   # Assumes Alembic is configured
   alembic upgrade head
   ```
5. Launch the FastAPI application:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

### 4. Running the AI Engine & Celery
SentinelAI uses Celery tasks to run the LangGraph multi-agent loop asynchronously.
1. Ensure Redis is running locally:
   ```bash
   redis-server
   ```
2. Launch the Celery worker from the `backend` folder:
   ```bash
   celery -A app.core.celery_app worker --loglevel=info --concurrency=4
   ```

---

### 5. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The dashboard is now accessible at `http://localhost:3000`.

---

## Docker Compose Deployment

For containerized sandbox deployment, a `docker-compose.yml` configures all microservices.

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sentinel-postgres
    environment:
      POSTGRES_USER: sentinel_user
      POSTGRES_PASSWORD: SentinelPass123!
      POSTGRES_DB: sentinel_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sentinel_user -d sentinel_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sentinel-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sentinel-backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://sentinel_user:SentinelPass123!@postgres:5432/sentinel_db
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=AIzaSyD_YourGeminiAPIKeyHere
      - LLM_PROVIDER=gemini
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sentinel-celery
    command: celery -A app.core.celery_app worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://sentinel_user:SentinelPass123!@postgres:5432/sentinel_db
      - REDIS_URL=redis://redis:6379/0
      - GEMINI_API_KEY=AIzaSyD_YourGeminiAPIKeyHere
      - LLM_PROVIDER=gemini
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sentinel-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Docker CLI Commands
* **Build Containers**:
  ```bash
  docker compose build
  ```
* **Start Services**:
  ```bash
  docker compose up -d
  ```
* **Stop Services**:
  ```bash
  docker compose down -v
  ```
* **View Logs**:
  ```bash
  docker compose logs -f backend
  ```

---

## Kubernetes Production Deployment

For enterprise deployments, configurations are managed via Kubernetes manifests.

### 1. namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sentinel-soc
```

### 2. secrets.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sentinel-secrets
  namespace: sentinel-soc
type: Opaque
data:
  # Base64 encoded values
  DATABASE_URL: cG9zdGdyZXNxbDovL3NlbnRpbmVsX3VzZXI6U2VudGluZWxQYXNzMTIzIUBwb3N0Z3JlczoxMjM0L2Ri
  GEMINI_API_KEY: QUl6YVN5RF9Zb3VyR2VtaW5pQVBJS2V5SGVyZQ==
```

### 3. deployment-backend.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-backend
  namespace: sentinel-soc
  labels:
    app: sentinel-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sentinel-backend
  template:
    metadata:
      labels:
        app: sentinel-backend
    spec:
      containers:
      - name: backend
        image: sentinelai/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sentinel-secrets
              key: DATABASE_URL
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: sentinel-secrets
              key: GEMINI_API_KEY
        - name: REDIS_URL
          value: "redis://sentinel-redis-service:6379/0"
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: 100m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### 4. service-backend.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: sentinel-backend-service
  namespace: sentinel-soc
spec:
  selector:
    app: sentinel-backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

### 5. ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sentinel-ingress
  namespace: sentinel-soc
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: soc.sentinelai.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: sentinel-backend-service
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sentinel-frontend-service
            port:
              number: 3000
```

### 6. autoscaler.yaml
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sentinel-backend-hpa
  namespace: sentinel-soc
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sentinel-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

### 7. Prometheus Annotations
Add annotations to backend pods in the deployment manifest for automatic collection of security metrics:
```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8000"
    prometheus.io/path: "/metrics"
```

---

## CI/CD Deployment Pipeline

This GitHub Actions workflow automates the quality check, container compilation, and rolling updates to Kubernetes.

### `.github/workflows/deploy.yml`
```yaml
name: SentinelAI CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'

    - name: Install Python Dev Dependencies
      run: |
        cd backend
        pip install flake8 pytest
        pip install -r requirements.txt

    - name: Run Backend Linter (Flake8)
      run: |
        cd backend
        flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics

    - name: Run Backend Tests (PyTest)
      run: |
        cd backend
        pytest tests/

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: './frontend/package-lock.json'

    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci

    - name: Run Frontend Lint (ESLint)
      run: |
        cd frontend
        npm run lint

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and Push Backend Image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: sentinelai/backend:${{ github.sha }}, sentinelai/backend:latest

    - name: Build and Push Frontend Image
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: sentinelai/frontend:${{ github.sha }}, sentinelai/frontend:latest

  deploy-to-k8s:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Set up Kubernetes CLI (kubectl)
      uses: azure/setup-kubectl@v3

    - name: Configure Kubeconfig
      run: |
        echo "${{ secrets.KUBECONFIG }}" > kubeconfig.yaml
        export KUBECONFIG=kubeconfig.yaml

    - name: Deploy Kubernetes Manifests
      run: |
        kubectl apply -f infrastructure/k8s/namespace.yaml
        kubectl apply -f infrastructure/k8s/secrets.yaml
        kubectl apply -f infrastructure/k8s/ingress.yaml
        kubectl apply -f infrastructure/k8s/
        
    - name: Rollout Update Images
      run: |
        kubectl set image deployment/sentinel-backend backend=sentinelai/backend:${{ github.sha }} -n sentinel-soc
        kubectl set image deployment/sentinel-frontend frontend=sentinelai/frontend:${{ github.sha }} -n sentinel-soc
        
    - name: Verify Rollout Status
      run: |
        kubectl rollout status deployment/sentinel-backend -n sentinel-soc
        kubectl rollout status deployment/sentinel-frontend -n sentinel-soc

---

## Rollback Strategy

If a deployment fails validation or health checks, roll back the release immediately to restore uptime:

1. **Kubernetes Rollback Command**:
   ```bash
   kubectl rollout undo deployment/sentinel-backend -n sentinel-soc
   kubectl rollout undo deployment/sentinel-frontend -n sentinel-soc
   ```
2. **CI/CD Automatic Rollback**:
   The `Verify Rollout Status` step in the GitHub Actions workflow checks the rollout. If the health probe fails to report `200 OK` within the timeout, the deployment job exits with an error status. The ops responder script triggers the rollback commands automatically.
3. **Database State Retention**:
   SentinelAI database migrations (Alembic) are backward-compatible. Rolling back application pods to a previous image version will not break database communication, avoiding data corruption.
