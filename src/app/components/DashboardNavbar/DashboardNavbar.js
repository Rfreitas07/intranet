// src/app/components/DashboardNavbar/DashboardNavbar.js
// Componente da Barra de Navegação Superior do Dashboard.

"use client"; // Marca como Client Component para usar hooks e interatividade.

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Para o link do perfil do usuário
import Image from 'next/image'; // <<<<< NOVO: Importa o componente Image do Next.js
import styles from './DashboardNavbar.module.css'; // Estilos CSS Modules

export default function DashboardNavbar() {
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('Usuário'); // Valor padrão
  // Ajusta a imagem padrão para um placeholder na pasta public
  const [userImage, setUserImage] = useState('/placeholder-profile.png'); 

  // Efeito para atualizar a data e carregar as informações do usuário
  useEffect(() => {
    // Atualiza a data a cada segundo
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
      // Formata a data para "segunda-feira 22/10/2025"
      const formattedDate = now.toLocaleDateString('pt-BR', options);
      // Ajusta para ter a primeira letra do dia da semana em maiúscula
      setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
    };

    updateDate(); // Define a data inicial
    const intervalId = setInterval(updateDate, 1000 * 60); // Atualiza a cada minuto

    // Carrega o nome e a imagem do usuário do localStorage
    const userSessionString = localStorage.getItem('userSession');
    if (userSessionString) {
      try {
        const userSession = JSON.parse(userSessionString);
        setUserName(userSession.name || userSession.email || 'Usuário');
        // Se houver uma URL de imagem no userSession, use-a. Caso contrário, mantém o placeholder.
        // userSession.profileImageUrl (exemplo de campo para imagem de perfil)
        if (userSession.profileImageUrl) {
          setUserImage(userSession.profileImageUrl);
        }
      } catch (error) {
        console.error("Erro ao parsear userSession do localStorage na Navbar:", error);
      }
    }

    // Função de limpeza para parar o intervalo
    return () => clearInterval(intervalId);
  }, []); // Executa apenas uma vez ao montar o componente

  return (
    <nav className={styles.navbarContainer}>
      <div className={styles.navbarLeft}>
        {/* Botão de Notificação */}
        <button className={styles.navbarButton} aria-label="Notificações">
          {/* Ícone de Sino (SVG inline) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>

        {/* Botão de Calendário */}
        <button className={styles.navbarButton} aria-label="Abrir Calendário">
          {/* Ícone de Calendário (SVG inline) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </button>
      </div>

      <div className={styles.navbarRight}>
        {/* Div com Data Atual */}
        <div className={styles.dateDisplay}>
          {currentDate}
        </div>

        {/* Link para Perfil do Usuário */}
        <Link href="/profile" className={styles.userProfileLink}>
          {/* <<<<< CORRIGIDO: Usando o componente Image do Next.js */}
          <Image 
            src={userImage} // Caminho da imagem (placeholder ou do usuário)
            alt="Miniatura do perfil do usuário" 
            width={40} // Largura da miniatura
            height={40} // Altura da miniatura (deve ser a mesma da largura para circular)
            className={styles.userProfileImage} 
          />
          <span className={styles.userName}>{userName}</span>
        </Link>
      </div>
    </nav>
  );
}
