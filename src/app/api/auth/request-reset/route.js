

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

   
    if (!email) {
      return new Response(JSON.stringify({ message: 'Email é obrigatório para redefinir a senha.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });


    if (!user) {
      console.log(`Tentativa de redefinição de senha para email não encontrado: ${email}`);
      return new Response(JSON.stringify({ message: 'Se o email estiver cadastrado, um link de redefinição será enviado.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }


    const resetToken = crypto.randomBytes(32).toString('hex'); 
    const resetTokenExpires = new Date(Date.now() + 3600000);

    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpires: resetTokenExpires,
      },
    });

   
    const resetLink = `${request.headers.get('origin')}/reset-password?token=${resetToken}`;
    console.log(`Link de redefinição de senha para ${user.email}: ${resetLink}`);

    return new Response(JSON.stringify({ message: 'Se o email estiver cadastrado, um link de redefinição será enviado.' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao solicitar redefinição de senha.' }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
