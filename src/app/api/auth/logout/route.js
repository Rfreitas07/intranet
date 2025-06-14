// src/app/api/auth/logout/route.js
// Esta API Route lida com o processo de logout do usuário, limpando o cookie de sessão.

import { NextResponse } from 'next/server';

// ====================================================================
// Função para lidar com requisições POST (Processar Logout)
// Acessível via POST /api/auth/logout
// ====================================================================
export async function POST(request) {
  try {
    // Cria uma nova resposta
    const response = NextResponse.json({ message: 'Logout realizado com sucesso!' });

    // Limpa o cookie 'userSession'
    // Define o cookie com um valor vazio, data de expiração no passado e maxAge em 0
    response.cookies.set('userSession', '', {
      httpOnly: true, // Recomendado para segurança, mas aqui estamos no cliente
      secure: process.env.NODE_ENV === 'production', // Use HTTPS em produção
      expires: new Date(0), // Define a expiração para o passado
      maxAge: 0, // Garante que o cookie seja excluído imediatamente
      path: '/', // O caminho do cookie deve cobrir todo o site
    });

    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao realizar logout.' }, {
      status: 500, // Internal Server Error
    });
  }
}
