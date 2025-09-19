// With `output: 'static'` configured:
// export const prerender = false;
import { Prisma } from "@prisma/client";
import type { APIRoute } from "astro";
import prisma from "../../../db";
import { v4 as UUID } from "uuid";
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password) {
      return new Response("Email and password are required", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id: UUID(),
        email,
        password: hashedPassword,
        name,
        createAt: new Date(),
        roleId: "user",
      },
    });

    console.log(newUser);

    return new Response(JSON.stringify(newUser), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }), redirect("/products");

  } catch (error) {
    console.error(error);
    return new Response('Error creating user', { status: 500 });
  }
};