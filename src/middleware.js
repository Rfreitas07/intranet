// src/middleware.js
// Este middleware é executado em cada requisição para proteger rotas e gerenciar o redirecionamento.

import { NextResponse } from 'next/server';
// REMOVIDO: import { getIronSession } from 'iron-session'; // Esta importação está sendo removida
import Cookies from 'js-cookie'; // Importa js-cookie para ler cookies

// Define os caminhos que são públicos (não exigem autenticação)
const publicPaths = ['/', '/api/auth/login', '/api/auth/logout', '/api/auth/request-reset', '/api/auth/reset-password', '/set-new-password', '/reset-password', '/icon-error.png', '/icon-loading.png', '/icon-success.png', '/logoLukSoft.jpg', '/emoji.jpg', '/imgPorta.jpg'];

// Regex para verificar se o caminho começa com uma das rotas da API que não precisam de sessão (ex: /api/auth/...)
const apiPublicPathsRegex = /^\/api\/auth\/(login|logout|request-reset|reset-password)/;

export async function middleware(request) {
  const { nextUrl } = request;
  const path = nextUrl.pathname;

  // Tenta obter o cookie de sessão do usuário
  let userSessionCookie;
  try {
    userSessionCookie = request.cookies.get('userSession');
  } catch (e) {
    console.error("Erro ao ler cookie no middleware:", e);
    userSessionCookie = undefined; // Garante que é undefined se houver erro
  }

  let userSession;
  if (userSessionCookie) {
    try {
      userSession = JSON.parse(userSessionCookie.value);
    } catch (e) {
      console.error("Erro ao parsear userSession cookie:", e);
      userSession = null; // Invalida a sessão se o cookie estiver corrompido
    }
  }

  const isAuthenticated = !!userSession; // Transforma userSession em um booleano
  const isLoginPage = path === '/';
  const isPublicPath = publicPaths.includes(path) || apiPublicPathsRegex.test(path);

  // Redireciona usuários autenticados da página de login para seus dashboards
  if (isAuthenticated && isLoginPage) {
    // Se o usuário precisa redefinir a senha, redireciona para a página de redefinição
    if (userSession.mustResetPassword) {
      return NextResponse.redirect(new URL('/set-new-password', request.url));
    }
    // Caso contrário, redireciona para o dashboard apropriado
    if (userSession.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    } else if (userSession.role === 'PUBLIC') {
      return NextResponse.redirect(new URL('/public-dashboard', request.url));
    }
  }

  // Protege rotas que não são públicas e exigem autenticação
  if (!isPublicPath && !isAuthenticated) {
    console.log(`Redirecionando para login: ${path} (sem sessão válida)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protege rotas de dashboard/admin para usuários que precisam redefinir senha
  if (isAuthenticated && userSession.mustResetPassword && !path.startsWith('/set-new-password')) {
    // Se o usuário precisa redefinir a senha, mas está tentando acessar outra página,
    // o redireciona de volta para a página de redefinição.
    console.log(`Redirecionando para redefinição de senha: ${path} (senha obrigatória)`);
    return NextResponse.redirect(new URL('/set-new-password', request.url));
  }

  // Protege rotas administrativas para usuários não-admin
  if (path.startsWith('/admin-dashboard') && isAuthenticated && userSession.role !== 'ADMIN') {
    console.log(`Acesso negado: ${path} (usuário não-admin)`);
    return NextResponse.redirect(new URL('/public-dashboard', request.url)); // Ou uma página de acesso negado
  }

  // Permite a requisição continuar se nenhuma das condições acima for atendida
  return NextResponse.next();
}

// Configura o matcher para que o middleware seja executado em todas as rotas
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Exclui estáticos e favicon
};
