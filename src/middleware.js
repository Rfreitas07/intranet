// src/middleware.js
// Middleware do Next.js para proteger rotas com base na autenticação e função (role) do usuário.

import { NextResponse } from 'next/server';
// REMOVIDO: A importação de 'js-cookie' não é necessária aqui, pois cookies são lidos diretamente de request.cookies.

export async function middleware(request) {
  // Pega a URL da requisição
  const { pathname } = request.nextUrl;

  // Define as rotas que precisam de autenticação
  // Qualquer rota que comece com um destes prefixos será protegida.
  const protectedRoutes = [
    '/dashboard', // Dashboard geral
    '/admin-dashboard', // Dashboard administrativo
    '/set-new-password' // Página para definir nova senha (também protegida, mas com lógica especial)
  ];

  // Define as rotas que são acessíveis apenas para ADMIN
  const adminRoutes = ['/admin-dashboard'];

  // Define as rotas que são acessíveis para usuários PUBLIC (e também para ADMINs, por herança)
  const publicUserRoutes = ['/dashboard'];

  // As APIs de autenticação (login, logout, request-reset, reset-password)
  // são tratadas de forma diferente e não exigem sessão prévia para serem acessadas.
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Tenta obter a sessão do usuário a partir do cookie 'userSession'.
  // O middleware é executado no ambiente do Edge Runtime (servidor),
  // então acessamos os cookies via `request.cookies.get()`.
  let userSession = null;
  const sessionCookie = request.cookies.get('userSession');
  if (sessionCookie) {
    try {
      userSession = JSON.parse(sessionCookie.value);
    } catch (e) {
      console.error("Erro ao parsear cookie de sessão no middleware:", e);
      userSession = null; // Invalida a sessão se o cookie estiver corrompido
    }
  }

  // === Lógica de Proteção de Rotas ===

  // 1. Redireciona para a página de login ('/') se não houver sessão válida
  // e o usuário tentar acessar uma rota que está na lista de protegidas.
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!userSession) {
      console.log(`Redirecionando para login: ${pathname} (sem sessão válida)`);
      // Redireciona para a raiz (página de login)
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 2. Lógica de autorização baseada na 'role' do usuário.
    // Se o usuário tem uma sessão, verifica se ele tem permissão para a rota.
    if (userSession.role) {
      // Se for uma rota de ADMIN e o usuário NÃO for ADMIN, redireciona para o dashboard geral.
      if (adminRoutes.some(route => pathname.startsWith(route)) && userSession.role !== 'ADMIN') {
        console.log(`Acesso negado: ${pathname} (ADMIN required, but role is ${userSession.role})`);
        // Redireciona para o dashboard padrão de usuário público (o novo '/dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Se for uma rota de usuário público (como '/dashboard')
      // e o usuário NÃO for 'PUBLIC' e NÃO for 'ADMIN', redireciona para o login.
      // (Isso é uma camada extra, geralmente ADMIN e PUBLIC podem acessar o /dashboard).
      if (publicUserRoutes.some(route => pathname.startsWith(route)) && userSession.role !== 'PUBLIC' && userSession.role !== 'ADMIN') {
        console.log(`Acesso negado: ${pathname} (PUBLIC/ADMIN required, but role is ${userSession.role})`);
        return NextResponse.redirect(new URL('/', request.url));
      }

      // 3. Se o usuário precisa redefinir a senha (`mustResetPassword: true`)
      // e tenta acessar qualquer página que não seja `/set-new-password`, ele é redirecionado.
      if (userSession.mustResetPassword && !pathname.startsWith('/set-new-password')) {
        console.log(`Redirecionando para redefinição de senha: ${pathname} (senha obrigatória)`);
        return NextResponse.redirect(new URL('/set-new-password', request.url));
      }

      // 4. Se o usuário tenta acessar `/set-new-password` mas *não* precisa mais redefinir a senha,
      // ele é redirecionado para o dashboard apropriado.
      if (pathname.startsWith('/set-new-password') && !userSession.mustResetPassword) {
        console.log(`Redirecionando de set-new-password: ${pathname} (senha já redefinida)`);
        if (userSession.role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin-dashboard', request.url));
        } else if (userSession.role === 'PUBLIC') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url)); // Fallback para login se a role não for reconhecida
      }
    }
  }

  // 5. Se o usuário está logado e tentando acessar a página de login ('/') ou a página de loading
  // ele é redirecionado para o seu dashboard, a menos que precise redefinir a senha.
  const publicNonAuthRoutesAfterLogin = ['/', '/loading']; // Rotas que não deveriam ser acessadas se já logado
  if (publicNonAuthRoutesAfterLogin.includes(pathname) && userSession && !userSession.mustResetPassword) {
    if (userSession.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    } else if (userSession.role === 'PUBLIC') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Permite a requisição continuar se nenhuma das condições acima for atendida
  return NextResponse.next();
}

// ====================================================================
// Configuração do matcher para o Middleware
// O matcher define quais rotas o middleware deve ser executado.
// ====================================================================
export const config = {
  matcher: [
    // As rotas que o middleware deve "ouvir" e proteger.
    // Inclui todas as rotas de apps e APIs, excluindo arquivos estáticos e pastas internas do Next.js.
    // A ordem importa: regras mais específicas primeiro.
    '/', // A página inicial de login
    '/dashboard/:path*', // Todas as rotas sob o novo /dashboard
    '/admin-dashboard/:path*', // Mantém, pois é um dashboard específico
    // '/public-dashboard/:path*', // Esta rota foi removida/renomeada
    '/set-new-password', // A página de redefinição de senha
    '/reset-password', // A página de solicitação de redefinição (Middleware verifica, mas não protege com sessão)
    '/loading', // A página de loading precisa ser coberta pelo middleware para o redirecionamento funcionar

    // Incluir APIs de autenticação para que o middleware possa ler cookies, mas elas se excluem via `if (pathname.startsWith('/api/auth/'))`
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/request-reset',
    '/api/auth/reset-password',

    // Excluir diretórios _next/static, _next/image, favicon.ico e arquivos diretamente na raiz do public
    // Isso é feito com uma regex mais complexa no matcher de alguns exemplos, mas o padrão aqui é mais simples.
    // Para Next.js 13+, 'public' assets são automaticamente excluídos do matcher se não forem rotas.
    // O matcher ['/((?!api|_next/static|_next/image|favicon.ico).*)'] já faz grande parte disso.
    // Mas para rotas específicas como /loading, ele precisa estar explicitamente listado se não for um caminho geral.
  ],
};
