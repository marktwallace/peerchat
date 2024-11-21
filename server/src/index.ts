import http from 'http';
import app from './app';
import { setupWebSocket } from './websocket';

const { PORT = 6765 } = process.env;

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket server
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
