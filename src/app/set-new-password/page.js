// src/app/set-new-password/page.js
// Esta página permite que o usuário digite a nova senha, usando o token de redefinição.
// AGORA COM BOTÕES DE LOGOUT E PARA SOLICITAR NOVO LINK, E LOGOUT MAIS ROBUSTO.

"use client"; // Marca este componente como um Client Component para usar hooks do React

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Importa hooks do Next.js para router e search params
import Cookies from 'js-cookie'; // Importa a biblioteca js-cookie para limpar o cookie

export default function SetNewPasswordPage() {
  const router = useRouter(); // Hook para navegação
  const searchParams = useSearchParams(); // Hook para acessar os parâmetros da URL
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // Estado para o token
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect para ler o token da URL quando a página carregar
  useEffect(() => {
    const urlToken = searchParams.get('token'); // Tenta pegar o token do parâmetro 'token' na URL
    if (urlToken) {
      setToken(urlToken); // Preenche o campo de token se ele estiver na URL
    }
  }, [searchParams]); // Roda quando os parâmetros de busca da URL mudam

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    // Validação básica de senha
    if (newPassword !== confirmNewPassword) {
      setMessage('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) { // Exemplo de validação de força de senha
        setMessage('A nova senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', { // Chama a API de redefinição final
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, newPassword }), // Envia email, token e nova senha
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Senha redefinida com sucesso! Você pode fazer login agora.');
        // Limpa a sessão do localStorage e cookie após redefinição de senha
        localStorage.removeItem('userSession');
        Cookies.remove('userSession', { path: '/' }); // Garante que o cookie é removido para toda a aplicação
        // Redireciona para a página de login após sucesso
        setTimeout(() => {
          router.push('/'); 
        }, 3000);
      } else {
        setMessage(data.message || 'Ocorreu um erro ao redefinir a senha. Verifique o token e o email.');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação de nova senha:', error);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO DE LOGOUT ATUALIZADA
  const handleLogout = async () => {
    setMessage(''); // Limpa mensagens anteriores

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST', // Chama a API de logout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Logout realizado com sucesso! Redirecionando...');
        localStorage.removeItem('userSession'); // Limpa a sessão do localStorage
        Cookies.remove('userSession', { path: '/' }); // Limpa o cookie 'userSession' do navegador para toda a aplicação
        
        // REDIRECIONAMENTO ROBUSTO: Força um recarregamento completo para garantir limpeza de cookie.
        // Usa window.location.replace para substituir a entrada atual no histórico do navegador.
        setTimeout(() => {
          window.location.replace('/'); 
        }, 100); // Pequeno atraso para garantir que o navegador processe a remoção do cookie
      } else {
        setMessage(data.message || 'Erro ao realizar logout. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar com a API de logout:', error);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Definir Nova Senha</h1>
        <p className="text-gray-600 text-center mb-6">
          Preencha os campos para redefinir sua senha.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
              Email:
            </label>
            <input
              id="email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 sr-only">
              Token de Redefinição:
            </label>
            <input
              id="token"
              type="text"
              placeholder="Token de redefinição"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 sr-only">
              Nova Senha:
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 sr-only">
              Confirme a Nova Senha:
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-semibold transition duration-200
              ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
        {message && (
          <p className={`mt-6 text-center text-sm font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <div className="mt-6 text-center flex flex-col gap-3">
          <Link href="/reset-password" className="text-blue-600 hover:underline inline-block py-2 px-4 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Solicitar Novo Link
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors w-full"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
