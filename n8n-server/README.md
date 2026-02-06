# n8n Server

This folder contains the Docker configuration for running n8n.

## How to start

1. Navigate to this directory:
   ```bash
   cd n8n-server
   ```

2. Start the server:
   ```bash
   docker-compose up -d
   ```

3. Access n8n:
   Open [http://localhost:5678](http://localhost:5678) in your browser.

## Configuration

You can customize the setup by editing the `.env` file.

- `N8N_HOST`: The hostname where n8n is running.
- `N8N_PORT`: The port on which n8n should be accessible.
- `WEBHOOK_URL`: The URL where webhooks should be received (important for production).
- `GENERIC_TIMEZONE`: The timezone for n8n.
