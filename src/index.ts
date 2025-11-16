import { Hono } from 'hono';
import { githubRoutes } from './routes/github';

const app = new Hono()

app.route('/api/github', githubRoutes)

export default app;