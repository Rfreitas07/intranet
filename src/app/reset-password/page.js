// src/app/reset-password/page.js
// Esta página permite que o usuário solicite um link de redefinição de senha.

"use client"; // Marca este componente como um Client Component para usar hooks do React

import React, { useState } from 'react';
import Link from 'next/link';

export default function RequestResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // ====================================================================
      // CORREÇÃO AQUI: Verificando se a resposta é OK e se há conteúdo para parsear
      // ====================================================================
      if (response.ok) {
        // Tenta parsear o JSON apenas se o status não for 204 (No Content)
        // e se o Content-Length for maior que 0 (indica que há corpo)
        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json") && response.status !== 204) {
          try {
            data = await response.json(); // Tenta ler o JSON
          } catch (jsonError) {
            console.error('Erro ao parsear JSON da resposta:', jsonError);
            setMessage('Resposta inválida do servidor. Tente novamente.');
            setLoading(false);
            return; // Sai da função se o JSON for inválido
          }
        }
        
        setMessage(data.message || 'Se o email estiver cadastrado, um link de redefinição será enviado para sua caixa de entrada.');
        setEmail('');
      } else {
        // Se a resposta não for OK, tenta ler o JSON para uma mensagem de erro específica
        let errorData = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json") && response.status !== 204) {
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.error('Erro ao parsear JSON de erro da resposta:', jsonError);
            // Fallback para mensagem de erro genérica se o JSON de erro for inválido
            setMessage('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
            setLoading(false);
            return;
          }
        }
        setMessage(errorData.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação de redefinição:', error);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Redefinir Senha</h1>
        <p className="text-gray-600 text-center mb-6">
          Informe seu email para receber um link de redefinição de senha.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
              Email:
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Enviando...' : 'Solicitar Link'}
          </button>
        </form>
        {message && (
          <p className={`mt-6 text-center text-sm font-medium ${message.includes('sucesso') || message.includes('enviado') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Lembrou da senha? {' '}
            <Link href="/" className="text-blue-600 hover:underline">
              Voltar ao Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
