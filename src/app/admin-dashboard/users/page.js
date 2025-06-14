// src/app/admin-dashboard/users/page.js
// Esta página permite ao administrador visualizar a lista de usuários (ordenada e filtrável), CADASTRAR NOVOS, EDITAR e EXCLUIR existentes.
// AGORA COM BOTÃO DE LOGOUT.

"use client"; // Marca este componente como um Client Component para usar hooks do React

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importa useRouter para redirecionamento
import Cookies from 'js-cookie'; // Importa a biblioteca js-cookie para limpar o cookie no cliente

export default function AdminUsersPage() {
  const router = useRouter(); // Inicializa o hook de roteamento
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Estados para o formulário de cadastro de novo usuário
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('PUBLIC');
  const [newUserSector, setNewUserSector] = useState('');

  // Estados para o modal de edição de usuário
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingUser, setCurrentEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmNewPassword, setEditConfirmNewPassword] = useState(''); 
  const [editUserRole, setEditUserRole] = useState('PUBLIC');
  const [editUserSector, setEditUserSector] = useState('');

  // Estados para os campos de filtro
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterId, setFilterId] = useState('');
  const [filterSector, setFilterSector] = useState('');

  // Estados para o modal de confirmação de exclusão
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Função para buscar os dados dos usuários (com filtros e ordenação)
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filterName) queryParams.append('name', filterName);
      if (filterEmail) queryParams.append('email', filterEmail);
      if (filterId) queryParams.append('id', filterId);
      if (filterSector) queryParams.append('sector', filterSector);

      const queryString = queryParams.toString();
      const url = `/api/users${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      const data = await response.json();
      
      const sortedUsers = data.sort((a, b) => {
        const nameA = a.name ? a.name.toLowerCase() : '';
        const nameB = b.name ? b.name.toLowerCase() : ''; // Correção: de b.b para b.name
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });

      setUsers(sortedUsers);
    } catch (e) {
      console.error("Não foi possível buscar os usuários:", e);
      setError("Não foi possível carregar os dados dos usuários.");
    } finally {
      setLoading(false);
    }
  }, [filterName, filterEmail, filterId, filterSector]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lidar com o envio do formulário de cadastro de usuário
  const handleCreateUser = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setMessage('Por favor, preencha todos os campos do novo usuário.');
      return;
    }
    if (newUserPassword.length < 6) {
        setMessage('A senha do novo usuário deve ter pelo menos 6 caracteres.');
        return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          sector: newUserSector,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Usuário cadastrado com sucesso!');
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('PUBLIC');
        setNewUserSector('');
        fetchUsers();
      } else {
        setMessage(data.message || 'Erro ao cadastrar usuário. Tente novamente.');
      }
    } catch (createError) {
      console.error('Erro ao conectar com a API de criação de usuário:', createError);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente mais tarde.');
    }
  };

  // Lógica do modal de edição
  const openEditModal = (user) => {
    setCurrentEditingUser(user);
    setEditUserName(user.name || '');
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserSector(user.sector || '');
    setEditNewPassword('');
    setEditConfirmNewPassword('');
    setMessage('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingUser(null);
  };

  const handleEditUserSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!currentEditingUser) return;

    if (!editUserName || !editUserEmail) {
      setMessage('Nome e Email são obrigatórios para edição.');
      return;
    }
    if (editNewPassword && editNewPassword.length < 6) {
        setMessage('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (editNewPassword && editNewPassword !== editConfirmNewPassword) {
      setMessage('As novas senhas não coincidem.');
      return;
    }

    try {
      const updateData = {
        name: editUserName,
        email: editUserEmail,
        role: editUserRole,
        sector: editUserSector,
      };

      if (editNewPassword) {
        updateData.password = editNewPassword;
      }

      const response = await fetch(`/api/admin/users/${currentEditingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Usuário atualizado com sucesso!');
        closeEditModal();
        fetchUsers();
      } else {
        setMessage(data.message || 'Erro ao atualizar usuário. Tente novamente.');
      }
    } catch (editError) {
      console.error('Erro ao conectar com a API de atualização de usuário:', editError);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    }
  };

  // Lógica do modal de confirmação de exclusão
  const openDeleteConfirmModal = (user) => {
    setUserToDelete(user);
    setMessage(''); // Limpa mensagens anteriores
    setIsDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setMessage('');
    setLoading(true); // Indica loading para a exclusão

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) { // 204 No Content para DELETE bem-sucedido
        setMessage(`Usuário ${userToDelete.name || userToDelete.email} excluído com sucesso!`);
        closeDeleteConfirmModal(); // Fecha o modal
        fetchUsers(); // Recarrega a lista
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setMessage(errorData.message || 'Erro ao excluir usuário. Tente novamente.');
        } else {
          setMessage('Ocorreu um erro inesperado ao excluir o usuário. Tente novamente.');
        }
      }
    } catch (deleteError) {
      console.error('Erro ao conectar com a API de exclusão de usuário:', deleteError);
      setMessage('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  // Função para lidar com o logout (similar ao Dashboard Admin)
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
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Aqui você pode visualizar, cadastrar, editar e excluir usuários para a intranet.
        </p>

        {message && (
          <p className={`mb-4 text-center text-sm font-medium ${message.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        {/* Formulário de Cadastro de Novo Usuário */}
        <div className="mb-8 p-6 border rounded-lg bg-blue-50 shadow-md">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Cadastrar Novo Usuário</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newUserName" className="block text-sm font-medium text-gray-700">Nome:</label>
              <input
                id="newUserName"
                type="text"
                placeholder="Nome do Usuário"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                id="newUserEmail"
                type="email"
                placeholder="email@intranet.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700">Senha Inicial:</label>
              <input
                id="newUserPassword"
                type="password"
                placeholder="Senha inicial"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700">Função:</label>
              <select
                id="newUserRole"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Público</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label htmlFor="newUserSector" className="block text-sm font-medium text-gray-700">Setor:</label>
              <input
                id="newUserSector"
                type="text"
                placeholder="Setor do Usuário"
                value={newUserSector}
                onChange={(e) => setNewUserSector(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Cadastrar Usuário
              </button>
            </div>
          </form>
        </div>

        {/* Seção de Filtros */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50 shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Filtrar Usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterName" className="block text-sm font-medium text-gray-700">Nome:</label>
              <input
                id="filterName"
                type="text"
                placeholder="Filtrar por Nome"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label htmlFor="filterEmail" className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                id="filterEmail"
                type="email"
                placeholder="Filtrar por Email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label htmlFor="filterId" className="block text-sm font-medium text-gray-700">ID:</label>
              <input
                id="filterId"
                type="number"
                placeholder="Filtrar por ID"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label htmlFor="filterSector" className="block text-sm font-medium text-gray-700">Setor:</label>
              <input
                id="filterSector"
                type="text"
                placeholder="Filtrar por Setor"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 text-right">
              <button
                type="button"
                onClick={fetchUsers}
                className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
              >
                Aplicar Filtro
              </button>
            </div>
          </div>
        </div>

        {/* Seção de listagem de usuários */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Lista de Usuários Cadastrados:</h2>
          {loading && <p className="text-center">Carregando usuários...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && users.length === 0 && !error && <p className="text-center text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>}
          
          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Função</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Req. Redef.</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Setor</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{user.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{user.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{user.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{user.mustResetPassword ? 'Sim' : 'Não'}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{user.sector || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="bg-purple-500 text-white py-1 px-3 rounded text-xs hover:bg-purple-600 transition-colors mr-2"
                        >
                          Editar
                        </button>
                        <button 
                          type="button"
                          onClick={() => openDeleteConfirmModal(user)}
                          disabled={loading} 
                          className={`bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600 transition-colors ${
                            loading ? 'bg-red-300 cursor-not-allowed' : ''
                          }`}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center flex justify-center gap-4">
          <Link href="/admin-dashboard" className="inline-block text-blue-600 hover:underline py-2 px-4 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors">
            Voltar ao Dashboard
          </Link>
          {/* Botão de Logout para Gerenciamento de Usuários */}
          <button
            onClick={handleLogout}
            className="inline-block bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Modal de Edição de Usuário */}
      {isEditModalOpen && currentEditingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={closeEditModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Editar Usuário: {currentEditingUser.name || currentEditingUser.email}
            </h2>
            <form onSubmit={handleEditUserSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="editUserName" className="block text-sm font-medium text-gray-700">Nome:</label>
                <input
                  id="editUserName"
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="editUserEmail" className="block text-sm font-medium text-gray-700">Email:</label>
                <input
                  id="editUserEmail"
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="editUserRole" className="block text-sm font-medium text-gray-700">Função:</label>
                <select
                  id="editUserRole"
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="PUBLIC">Público</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div>
                <label htmlFor="editUserSector" className="block text-sm font-medium text-gray-700">Setor:</label>
                <input
                  id="editUserSector"
                  type="text"
                  placeholder="Setor do Usuário"
                  value={editUserSector}
                  onChange={(e) => setEditUserSector(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="border-t pt-4 mt-4 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Alterar Senha (Opcional):</h3>
                <div>
                  <label htmlFor="editNewPassword" className="block text-sm font-medium text-gray-700">Nova Senha:</label>
                  <input
                    id="editNewPassword"
                    type="password"
                    placeholder="Deixe em branco para não alterar"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="editConfirmNewPassword" className="block text-sm font-medium text-gray-700">Confirme a Nova Senha:</label>
                  <input
                    id="editConfirmNewPassword"
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={editConfirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteConfirmModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm relative">
            <button
              onClick={closeDeleteConfirmModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 text-center mb-6">
              Tem certeza que deseja excluir o usuário **{userToDelete.name || userToDelete.email}** (ID: {userToDelete.id})?
              Esta ação é irreversível.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={closeDeleteConfirmModal}
                className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={loading}
                className={`font-bold py-2 px-4 rounded-md transition-colors ${
                  loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
