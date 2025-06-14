// src/app/admin-dashboard/page.js
// Esta é a página inicial do dashboard administrativo, agora com botão de logout.

"use client"; // Marca este componente como um Client Component para usar hooks do React

import React, { useState } from 'react';
import Link from 'next/link'; // Mantido caso precise de outros links
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionamento
import Cookies from 'js-cookie'; // Importa a biblioteca js-cookie para limpar o cookie no cliente

export default function AdminDashboardPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Mantido o estado de loading, caso seja útil no futuro

  // Função para lidar com o logout
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
        setMessage(data.message || 'Logout realizado com sucesso!');
        localStorage.removeItem('userSession'); // Limpa a sessão do localStorage
        Cookies.remove('userSession'); // Limpa o cookie 'userSession' do navegador
        router.push('/'); // Redireciona para a página de login
      } else {
        setMessage(data.message || 'Erro ao realizar logout. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar com a API de logout:', error);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Bem-vindo, administrador! Aqui você gerenciará os usuários do sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cartão para Gerenciamento de Usuários */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-blue-700 mb-3">
              Gerenciar Usuários
            </h2>
            <p className="text-gray-700 mb-4">
              Visualize, cadastre e edite as informações dos usuários, incluindo senhas e permissões.
            </p>
            <Link
              href="/admin-dashboard/users"
              className="inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Acessar
            </Link>
          </div>

          {/* Cartão para Configurações (exemplo futuro) */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-green-700 mb-3">
              Configurações do Sistema
            </h2>
            <p className="text-gray-700 mb-4">
              Ajuste as configurações gerais da intranet e outras opções administrativas.
            </p>
            <button
              className="inline-block bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors cursor-not-allowed opacity-50"
              disabled
            >
              Em Breve
            </button>
          </div>
        </div>

        {message && (
          <p className={`mt-6 text-center text-sm font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          {/* Botão de Logout para Admin */}
          <button
            onClick={handleLogout}
            className="inline-block bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
