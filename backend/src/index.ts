import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { blogRouter } from './routes/blog'
import { userRouter } from './routes/user'

const app = new Hono<{
  Bindings: {
    JWT_SECRET: string,
    ACC_DATABASE_URL: string
  }
}>()

// Enable CORS for all origins
app.use('*', cors())

app.route('/api/v1/blog', blogRouter)
app.route('/api/v1/user', userRouter)

export default app
