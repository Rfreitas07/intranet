// src/app/loading/page.js
// Esta é uma página de loading simples para exibir enquanto o conteúdo principal está sendo carregado,
// agora com uma barra de progresso visual, combinando com a estrutura existente,
// e exibindo o nome do usuário logado.

"use client"; // Marca este componente como um Client Component

import React, { useState, useEffect } from 'react'; // Importa useState e useEffect
import Image from 'next/image'; // Importa o componente Image
import styles from './loading.module.css'; // Importa estilos específicos da página de loading

export default function LoadingPage() {
  // Estado para controlar o progresso da barra (de 0 a 100)
  const [progress, setProgress] = useState(0);
  // NOVO: Estado para armazenar o nome do usuário
  const [userName, setUserName] = useState('');

  // useEffect para simular o preenchimento da barra de progresso
  useEffect(() => {
    // Define um intervalo para atualizar o progresso
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Se o progresso já atingiu 100%, limpa o intervalo e retorna 100
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Incrementa o progresso em 5% a cada 100ms, mas não ultrapassa 100
        return Math.min(prevProgress + 5, 100);
      });
    }, 100); // A cada 100 milissegundos

    // NOVO: Carregar o nome do usuário do localStorage
    const userSessionString = localStorage.getItem('userSession');
    if (userSessionString) {
      try {
        const userSession = JSON.parse(userSessionString);
        // Verifica se 'name' existe ou usa 'email' como fallback, ou 'usuário'
        setUserName(userSession.name || userSession.email || 'usuário');
      } catch (error) {
        console.error("Erro ao parsear userSession do localStorage:", error);
        setUserName('usuário'); // Em caso de erro no parse, usa 'usuário'
      }
    } else {
      setUserName('usuário'); // Se não houver sessão no localStorage, usa 'usuário'
    }

    // Função de limpeza: importante para parar o intervalo quando o componente é desmontado,
    // evitando vazamentos de memória.
    return () => clearInterval(interval);
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez ao montar o componente

  return (
    <div className={styles.loadingContainer}>
      {/* Título de boas-vindas com o nome do usuário dinâmico */}
      <h1>Bem-vindo(a), {userName}! Estamos preparando tudo para você...</h1>
      
      {/* Container da imagem de carregamento */}
      <div className={styles.imageHeader}>
        <Image 
          src="/Loading.jpg"
          alt="Imagem de carregamento"
          width={845}
          height={0} // Ajuste a altura conforme necessário para manter a proporção
          className={styles.headerImage} // Aplica uma classe para estilo da imagem
        />
      </div>
      
      {/* Container da barra de progresso */}
      <div className={styles.progressBarContainer}>
        {/* A barra de preenchimento, cuja largura é controlada pelo estado 'progress' */}
        <div
          className={styles.progressBarFill}
          style={{ width: `${progress}%` }} // Define a largura em porcentagem
        ></div>
      </div>
      {/* Exibe a porcentagem de carregamento */}
      <p className={styles.loadingPercentage}>{progress}%</p>
      
      <p className={styles.subText}>Aguarde um momento...</p>
    </div>
  );
}
