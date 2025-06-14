// src/app/api/admin/users/password/route.js
// Esta API Route permite que um administrador altere a senha de outro usuário.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Para fazer o hash da nova senha

// Garante uma única instância do PrismaClient globalmente em desenvolvimento.
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ====================================================================
// Função para lidar com requisições PUT (Alterar Senha de Usuário por Admin)
// Acessível via PUT /api/admin/users/password
// (No futuro, esta rota será protegida para apenas ADMINs)
// ====================================================================
export async function PUT(request) {
  try {
    const body = await request.json(); // Obtém o corpo da requisição
    const { userId, newPassword } = body; // Desestrutura o ID do usuário e a nova senha

    // 1. Validação: Verifica se todos os campos foram fornecidos
    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ message: 'ID do usuário e nova senha são obrigatórios.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
        status: 404, // Not Found
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Gera o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10); // '10' é o saltRounds

    // 4. Atualiza a senha do usuário no banco de dados e define mustResetPassword para false
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword, // Salva a nova senha hash
        mustResetPassword: false, // Define para false, pois o admin alterou a senha
      },
    });

    // 5. Retorna sucesso
    return new Response(JSON.stringify({ message: `Senha do usuário ${userId} alterada com sucesso!` }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao alterar senha por administrador:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao alterar senha.' }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
