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

blogRouter.use('/*', async (c, next) => {
  const auth = c.req.header('Authorization');

  // 1️⃣ Check header format
  if (!auth || !auth.startsWith('Bearer ')) {
    c.status(403);
    return c.json({ error: 'Unauthorized' });
  }

  const token = auth.slice(7);
  try {
    // 2️⃣ Verify token
    const payload = await verify(
      token,
      c.env.JWT_SECRET,
      'HS256'
    ) as { id?: string };

    // 3️⃣ Ensure user id exists
    if (!payload.id) {
      c.status(403);
      return c.json({ error: 'Invalid token' });
    }

    // 4️⃣ Store userId safely
    c.set('userId', payload.id);
    await next();

  } catch {
    c.status(403);
    return c.json({ error: 'Unauthorized' });
  }
});

blogRouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());

  // pagination (optional but recommended)
  const page = Number(c.req.query('page') ?? '1');
  const limit = Number(c.req.query('limit') ?? '10');
  const skip = (page - 1) * limit;

  const blogs = await prisma.post.findMany({
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return c.json({
    page,
    limit,
    count: blogs.length,
    blogs,
  });
});


blogRouter.get('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());
	const blogs = await prisma.post.findMany({
		where: {
			authorId: userId
		},
		orderBy: {
			createdAt: 'desc'
		}
	})
	return c.json(blogs)
})

blogRouter.post('/create', async (c) => {
  try {
    const body = await c.req.json()
    const userId = c.get('userId');

    const prisma = new PrismaClient({
      accelerateUrl: c.env.ACC_DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.post.create({
      data:{
        title: body.title,
        content: body.content,
        authorId: userId
      }
    })

    return c.json(blog)
  } catch (e) {
    c.status(500);
    return c.json({ error: 'Failed to create blog' });
  }
})



blogRouter.put('/:id', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json()
  const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const blog = await prisma.post.update({
      where:{
          id: c.req.param('id')
      },
      data:{
          title: body.title,
          content: body.content,
      }
    })
    return c.json(blog)
  }
  catch(e){
    c.status(404);
    return c.json({ error: "Blog not found" });
  }
})

blogRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const prisma = new PrismaClient({
    accelerateUrl: c.env.ACC_DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    await prisma.post.delete({
      where:{
          id: c.req.param('id')
      }
    })
    return c.json({ message: "Blog deleted successfully" })
  }
  catch(e){
    c.status(404);
    return c.json({ error: "Blog not found" });
  }
})

