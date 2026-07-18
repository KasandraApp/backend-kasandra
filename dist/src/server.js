import { createServer } from 'node:http';
import { env } from './config/env';
import app from './app';
const port = env.port;
const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    const request = new Request(url.toString(), {
        method: req.method,
        headers: new Headers(req.headers),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
    });
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
});
if (import.meta.main) {
    server.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
}
export default server;
