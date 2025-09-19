
import { defineConfig } from 'auth-astro';
import Credentials from '@auth/core/providers/credentials';
import bcrypt from 'bcryptjs';
import type { AdapterUser } from '@auth/core/adapters';
import prisma from './src/db';

export default defineConfig({
  providers: [
    //TODO:
    // GitHub({
    //   clientId: import.meta.env.GITHUB_CLIENT_ID,
    //   clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    // }),

    Credentials({
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials: Partial<Record<"email" | "password", unknown>>, request: Request) => {
        // Validar y asegurar que las credenciales sean del tipo esperado
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          throw new Error("Correo electrónico y contraseña son obligatorios.");
        }
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        if (!bcrypt.compareSync(password as string, user.password)) {
          throw new Error("Contraseña incorrecta");
        }

        const { password: _, ...rest } = user;
        return rest;
      }
    }),
  ],

  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }

      return token;
    },

    session: ({ session, token }) => {
      session.user = token.user as AdapterUser;
      return session;
    },
  },
});