
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; 

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function POST(request) {
  try {
    const body = await request.json(); 
    const { email, password } = body; 

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email e senha são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas.' }), {
        status: 401, 
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      message: 'Login bem-sucedido!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        mustResetPassword: user.mustResetPassword,
        role: user.role, 
      },
    }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor no processo de login.' }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
