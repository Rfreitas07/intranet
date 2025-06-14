
// Esta API Route lida com a redefinição final da senha do usuário.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';


const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function POST(request) {
  try {
    const body = await request.json(); 
    const { email, token, newPassword } = body; 

    if (!email || !token || !newPassword) {
      return new Response(JSON.stringify({ message: 'Email, token e nova senha são obrigatórios.' }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json' },
      });
    }

    
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        resetToken: token,
        
        resetTokenExpires: {
          gt: new Date(), 
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Token inválido ou expirado, ou email incorreto.' }), {
        status: 400, 
        headers: { 'Content-Type': 'application/json' },
      });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10); // '10' é o saltRounds

    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword, 
        resetToken: null, 
        resetTokenExpires: null, 
        mustResetPassword: false, 
      },
    });

    
    return new Response(JSON.stringify({ message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' }), {
      status: 200, 
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao redefinir senha.' }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
