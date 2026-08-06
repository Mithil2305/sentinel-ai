
## How to Run on Vast.ai

To deploy the stack on a vast.ai GPU instance:

1. **Rent an Instance**:
   - Rent a VM/Docker instance on vast.ai (e.g., using an Ubuntu image with CUDA and Docker enabled, or selecting a template that supports Docker-in-Docker).
   - Ensure the rented instance has a GPU (e.g., RTX 3090, RTX 4090, or A10G) and at least 15GB of disk space to accommodate models.

2. **Connect to the Instance**:
   - SSH into your vast.ai instance:
     ```bash
     ssh -p <port> root@<host-ip>
     ```

3. **Clone and Run**:
   - Clone this repository inside the instance:
     ```bash
     git clone <your-repo-url> sentinel-ai
     cd sentinel-ai
     ```
   - Start the stack:
     ```bash
     docker compose -f docker/docker-compose.yml up -d --build
     ```

4. **Verify Deployment**:
   - The sidecar container `sentinel-ollama-pull-models` will run and pull the LLM models to the container. Check pull logs with:
     ```bash
     docker logs -f sentinel-ollama-pull-models
     ```
   - Once the models are pulled, access the frontend dashboard at `http://<your-instance-ip>:3000` (make sure port `3000` and backend port `8000` are exposed/forwarded on vast.ai console settings).
