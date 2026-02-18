import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
//adding jwt
import { decode, sign, verify } from 'hono/jwt'


import { signInSchema,signUpSchema } from '../zod'



export const userRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string,
    ACC_DATABASE_URL: string
  },
  Variables: {
    userId: string
  }
}>()
userRouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({

		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const parseResult = signInSchema.safeParse(body);
	if (!parseResult.success) {
		c.status(400);
		return c.json({ error: "Invalid input" });
	}
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
      		password: body.password
		}
	});

	if (!user) {
		c.status(403); //common status code for authentication failure
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET,'HS256');
	return c.json({ jwt });
})


//signup route
userRouter.post('/signup', async (c) => {
	const prisma = new PrismaClient({

		accelerateUrl: c.env.ACC_DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const parseResult = signUpSchema.safeParse(body);
	if (!parseResult.success) {
		c.status(400);
		return c.json({ error: "Invalid input" });
	}
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

