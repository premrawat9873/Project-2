import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
//adding jwt
import { decode, sign, verify } from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'


export const blogRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string,
    ACC_DATABASE_URL: string
  },
  Variables: {
    userId: string
  }
}>()

blogRouter.use('/api/v1/blog/*', async (c, next) => {
  const authorization = c.req.header('Authorization')?.split(' ')[1];
  if(!authorization) {
    c.status(403);
    return c.json({ error: "Unauthorized" });
  }
  const response = await verify(authorization!, c.env.JWT_SECRET,'HS256');
  if (!response) {
    c.status(403);
    return c.json({ error: "Unauthorized" });
  }else{
    c.set('userId', response.id);
    await next()
  }
})


blogRouter.post('/create', async (c) => {
  const body = await c.req.json()
  const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());
  const blog = await prisma.post.create({
    data:{
        title: body.title,
        content: body.content,
        authorId: "1"
    }
  })
  return c.json(blog.id)
})

blogRouter.put('/update', async (c) => {

  const body = await c.req.json()
  const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());
  try{
  const blog = await prisma.post.update({
    where:{
        id: body.id
    },
    data:{
        title: body.title,
        content: body.content,
    }
  })
  }
  catch(e){
    c.status(404);
    return c.json({ error: "Blog not found" });
  }
  return c.json({ message: "Blog updated successfully" })
})

//later add pagination
blogRouter.get('/api/v1/blog/bulk', async (c) => {
    const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());
  const blogs = await prisma.post.findMany()
  return c.json(blogs)
})

blogRouter.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})
