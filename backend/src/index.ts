import { Hono } from 'hono'
import { blogRouter } from './routes/blog'
import { userRouter } from './routes/user'

const app = new Hono<{
  Bindings: {
    JWT_SECRET: string,
    ACC_DATABASE_URL: string
  }
}>()
app.route('/api/v1/blog/*', blogRouter)
app.route('/api/v1/user/*', userRouter)

export default app
