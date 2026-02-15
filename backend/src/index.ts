import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { blogRouter } from './routes/blog'


//adding jwt
import { decode, sign, verify } from 'hono/jwt'
const app = new Hono<{
  Bindings: {
    JWT_SECRET: string,
    ACC_DATABASE_URL: string
  }
}>()
app.route('/api/v1/blog/*', blogRouter)


//signin route

app.post('/api/v1/user/signin', async (c) => {
	const prisma = new PrismaClient({

		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
      		password: body.password
		}
	});

	if (!user) {
		c.status(403);//common status code for authentication failure
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET,'HS256');
	return c.json({ jwt });
})

//signup route

app.post('/api/v1/user/signup', async (c) => {
	const prisma = new PrismaClient({

		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
        		name: body.name
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	}
  catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})


export default app
