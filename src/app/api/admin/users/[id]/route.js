// src/app/api/admin/users/[id]/route.js
// Esta API Route permite que um administrador atualize (PUT) ou exclua (DELETE)
// os dados de um usuário específico.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Para fazer o hash da nova senha (usado no PUT)

// Garante uma única instância do PrismaClient globalmente em desenvolvimento.
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ====================================================================
// Função para lidar com requisições PUT (Atualizar Dados do Usuário)
// Acessível via PUT /api/admin/users/[id]
// ====================================================================
export async function PUT(request, { params }) {
  try {
    // CORREÇÃO AQUI: await params para desestruturar
    const { id } = await params; // Obtém o ID do usuário da URL (parâmetros da rota)
    const body = await request.json(); // Obtém o corpo da requisição
    const { name, email, password, role, sector } = body; // Desestrutura os campos a serem atualizados

    // 1. Validação básica do ID
    if (!id) {
      return new Response(JSON.stringify({ message: 'ID do usuário é obrigatório para atualização.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Converte o ID para um número inteiro, pois ele vem como string da URL
    const userId = parseInt(id, 10);

    // 2. Prepara os dados para atualização
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;
    if (sector !== undefined) dataToUpdate.sector = sector; // Inclui o setor

    // Se uma nova senha for fornecida, faça o hash e adicione aos dados
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
      dataToUpdate.mustResetPassword = false; // Se a senha foi alterada, não precisa mais redefinir
    }

    // 3. Atualiza o usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { // Seleciona quais campos retornar
        id: true,
        email: true,
        name: true,
        mustResetPassword: true,
        role: true,
        sector: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. Retorna sucesso
    return new Response(JSON.stringify({ message: 'Usuário atualizado com sucesso!', user: updatedUser }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Se o erro for por usuário não encontrado, retorna 404
    if (error.code === 'P2025') { // Código de erro do Prisma para "record not found"
      return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
        status: 404, // Not Found
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Erro ao atualizar usuário:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao atualizar usuário.' }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ====================================================================
// Função para lidar com requisições DELETE (Excluir Usuário)
// Acessível via DELETE /api/admin/users/[id]
// ====================================================================
export async function DELETE(request, { params }) {
  try {
    // CORREÇÃO AQUI: await params para desestruturar
    const { id } = await params; // Obtém o ID do usuário da URL

    // 1. Validação básica do ID
    if (!id) {
      return new Response(JSON.stringify({ message: 'ID do usuário é obrigatório para exclusão.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Converte o ID para um número inteiro
    const userId = parseInt(id, 10);

    // 2. Tenta excluir o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    // 3. Retorna sucesso sem conteúdo
    return new Response(null, {
      status: 204, // 204 No Content (sucesso na exclusão sem retorno de corpo)
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Se o erro for por usuário não encontrado
    if (error.code === 'P2025') {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado para exclusão.' }), {
        status: 404, // Not Found
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('Erro ao excluir usuário:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao excluir usuário.' }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
