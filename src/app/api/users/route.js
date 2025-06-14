// src/app/api/users/route.js
// Esta API Route agora lida com a busca de usuários (GET com filtros)
// e a criação de novos usuários (POST) com hashing de senha e campo 'role'.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Importa a biblioteca bcrypt para hashing de senha

// Garante que uma única instância do PrismaClient seja usada globalmente em desenvolvimento.
// Isso evita problemas de "multiple PrismaClient instances" durante o hot-reload do Next.js.
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// ====================================================================
// Função para lidar com requisições GET (Buscar Usuários com Filtros)
// Acessível via GET /api/users?name=...&email=...&id=...&sector=...
// ====================================================================
export async function GET(request) {
  try {
    // Obtém os parâmetros de consulta da URL
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const sector = searchParams.get('sector');

    // Converte o ID para número se existir
    const userId = id ? parseInt(id, 10) : undefined;

    // Constrói o objeto 'where' para a consulta do Prisma com base nos filtros fornecidos
    const whereClause = {};
    if (name) {
      whereClause.name = { contains: name, mode: 'insensitive' }; // Busca por parte do nome, ignorando maiúsculas/minúsculas
    }
    if (email) {
      whereClause.email = { contains: email, mode: 'insensitive' }; // Busca por parte do email, ignorando maiúsculas/minúsculas
    }
    if (userId) {
      whereClause.id = userId; // Busca por ID exato
    }
    if (sector) {
      whereClause.sector = { contains: sector, mode: 'insensitive' }; // Busca por parte do setor, ignorando maiúsculas/minúsculas
    }

    // Busca os usuários no banco de dados usando o Prisma Client com as condições de filtro
    const users = await prisma.user.findMany({
      where: whereClause, // Aplica as condições de filtro
      // Exclui a senha do resultado para segurança.
      select: {
        id: true,
        email: true,
        name: true,
        mustResetPassword: true,
        role: true,
        sector: true, // Inclui o campo 'sector' na seleção
        createdAt: true,
        updatedAt: true,
      },
    });

    // Retorna a lista de usuários como uma resposta JSON.
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao buscar usuários.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// ====================================================================
// Função para lidar com requisições POST (Criar Novo Usuário)
// Acessível via POST /api/users
// (Já existente, sem alterações neste passo)
// ====================================================================
export async function POST(request) {
  try {
    const body = await request.json(); // Obtém o corpo da requisição (JSON)
    const { email, name, password, role, sector } = body; // Desestrutura email, nome, senha, role e sector

    // Validação básica dos campos obrigatórios
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email e senha são obrigatórios para criar um usuário.' }), {
        status: 400, // Bad Request
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ message: 'Um usuário com este email já existe.' }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Gera o hash da senha usando bcrypt.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário no banco de dados usando Prisma.
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null, // Garante que 'name' seja null se não for fornecido
        password: hashedPassword, // Salva o hash da senha
        mustResetPassword: true, // Define que o usuário deve redefinir a senha no primeiro login
        role: role || 'PUBLIC', // Define a role (ADMIN ou PUBLIC), padrão para PUBLIC se não for fornecido
        sector: sector || null, // Salva o setor, se fornecido
      },
      // Seleciona quais campos retornar para evitar expor o hash da senha.
      select: {
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

    // Retorna o novo usuário criado (sem a senha)
    return new Response(JSON.stringify(newUser), {
      status: 201, // 201 Created (sucesso na criação)
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return new Response(JSON.stringify({ message: 'Erro interno do servidor ao criar usuário.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
