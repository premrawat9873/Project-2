import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
//adding jwt
import { decode, sign, verify } from 'hono/jwt'
const app = new Hono()

app.use('api/v1/blog/*', async (c, next) => {
  const body = await c.req.json()
  const authorization = c.req.header('Authorization'.split(' ')[1]);
  // @ts-expect-error
  const response = await verify(authorization!, c.env.JWT_SECRET,'HS256');
  if (!response) {
    c.status(403);
    return c.json({ error: "Unauthorized" });
  }else{
    await next()
  }
})


app.post('/api/v1/signin', async (c) => {
	const prisma = new PrismaClient({
    // @ts-expect-error
		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}
  // @ts-expect-error
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET,'HS256');
	return c.json({ jwt });
})

app.post('/api/v1/signup', async (c) => {
	const prisma = new PrismaClient({
    // @ts-expect-error
		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
    // @ts-expect-error
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	}
  catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})



app.post('/api/v1/blog', (c) => {
  
})

app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
