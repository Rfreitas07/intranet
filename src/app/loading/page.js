// src/app/loading/page.js

"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import styles from './loading.module.css';
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

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.nav}>
        <Image
                    src="/logoLukSoft.jpg"
                    alt="Logo LukSoft"
                    width={230}
                    height={40}
                  ></Image>
      </div>

      <h1>Bem-vindo(a), {userName}! Estamos preparando tudo para você...</h1>
       
      {/* Container da imagem de carregamento */}
      <div className={styles.imageHeader}>
        <Image
                    src="/load2.jpg"
                    alt="imagem caregamento"
                    width={846}
                    height={405}
                  className={styles.img}
                  ></Image>
      </div>
      
      {/* Container da barra de progresso */}
      <div className={styles.progressBarContainer}>
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
