// src/app/dashboard/page.js
// Esta página representa o dashboard principal com um menu lateral navegável
// e agora uma barra de navegação superior fixa.

"use client"; // Marca este componente como um Client Component

import React from 'react';
import Link from 'next/link'; // Componente para navegação otimizada no Next.js
import { usePathname } from 'next/navigation'; // Hook para obter o caminho da URL atual

import styles from './dashboard.module.css'; // Importa estilos CSS Modules para o layout geral
import DashboardNavbar from '../components/DashboardNavbar/DashboardNavbar'; // NOVO: Importa o componente da Navbar Superior

export default function DashboardPage() {
  const pathname = usePathname(); // Obtém o caminho da URL atual para destacar o link ativo

  // Função para verificar se um link está ativo
  const isActive = (path) => pathname === path;

  return (
    <div className={styles.dashboardContainer}>
      {/* Menu Lateral */}
      <aside className={styles.sidebar}>
        <nav>
          <ul className={styles.navList}>
            {/* Link para a Home do Dashboard */}
            <li>
              <Link href="/dashboard" className={isActive('/dashboard') ? styles.navLinkActive : styles.navLink}>
                {/* Ícone de Casa (SVG inline) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.navLinkIcon}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </Link>
            </li>

            {/* Link para Registrar Horas */}
            <li>
              <Link href="/dashboard/registrar-horas" className={isActive('/dashboard/registrar-horas') ? styles.navLinkActive : styles.navLink}>
                {/* Ícone de Relógio (SVG inline) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.navLinkIcon}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Registrar horas</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal do Dashboard */}
      {/* NOVO: Wrapper para o conteúdo principal e a navbar superior */}
      <div className={styles.mainContentWrapper}>
        <DashboardNavbar /> {/* NOVO: Navbar Superior */}
        <main className={styles.mainContent}>
          <h1 className={styles.mainContentTitle}>Bem-vindo ao Dashboard!</h1>
          <p className={styles.mainContentText}>
            Este é o espaço principal do seu sistema. Utilize o menu lateral para navegar entre as seções.
          </p>
          {/* Futuro conteúdo específico da Home do Dashboard */}
        </main>
      </div>
    </div>
  );
}
