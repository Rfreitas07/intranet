"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [statusType, setStatusType] = useState("idle");
  const [statusText, setStatusText] = useState("");
  const [statusDetail, setStatusDetail] = useState("");

  // ESTADO PARA A CITAÇÃO MOTIVACIONAL EM PORTUGUÊS
  const [motivationalQuote, setMotivationalQuote] = useState({
    frase: "",
    autor: "",
  });
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // useEffect para marcar que o componente foi hidratado
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    // Apenas executa a lógica de busca e localStorage APÓS a hidratação no cliente
    if (!hasHydrated) {
      return;
    }

    async function fetchMotivationalQuote() {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const response = await fetch('https://frases.docapi.dev/frase/obter');
        if (!response.ok) {
          throw new Error(`Erro ao buscar citação: ${response.statusText}`);
        }
        const apiResponse = await response.json();
const data = apiResponse.resposta;
        if (data && data.length > 0) {
          // Lógica para obter a citação do dia
          const today = new Date().toDateString(); // Ex: "Fri Jun 14 2025"
          const storedQuoteData = localStorage.getItem('dailyMotivationalQuote');
          let currentDailyQuote = null;

          if (storedQuoteData) {
            const parsedData = JSON.parse(storedQuoteData);
            // Verifica se a citação foi salva hoje
            if (parsedData.date === today) {
              currentDailyQuote = parsedData.quote;
            }
          }

          if (currentDailyQuote) {
            // Usa a citação salva se for do dia
            setMotivationalQuote(currentDailyQuote);
          } else {
            // Seleciona uma nova citação aleatoriamente se a data mudou ou não houver citação salva
            const randomIndex = Math.floor(Math.random() * data.length);
            const newQuote = data[randomIndex];
            const quoteToSave = {
              frase: newQuote.frase,
              nomeAutor: newQuote.autor || 'Autor desconhecido.'
            };
            setMotivationalQuote(quoteToSave);
            localStorage.setItem('dailyMotivationalQuote', JSON.stringify({ date: today, quote: quoteToSave }));
          }
        } else {
          setMotivationalQuote({ frase: 'Nenhuma citação encontrada hoje.', nomeAutor: 'Autor desconhecido.' });
        }
      } catch (error) {
        console.error('Erro ao buscar citação motivacional:', error);
        setQuoteError('Não foi possível carregar a citação motivacional.');
        setMotivationalQuote({ frase: 'Não foi possível carregar a citação.', nomeAutor: 'Erro de Conexão' });
      } finally {
        setQuoteLoading(false);
      }
    }
    fetchMotivationalQuote();
  }, [hasHydrated]); // Roda novamente quando hasHydrated muda para true
  // Objeto para mapear tipos de status aos nomes das classes CSS para background-image
  const statusIconClass = {
    success: styles.statusSuccessIcon,
    loading: styles.statusLoadingIcon,
    error: styles.statusErrorIcon,
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    setStatusType("loading");
    setStatusText("Carregando...");
    setStatusDetail("Aguarde, verificando suas credenciais...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);

        if (data.user) {
          localStorage.setItem("userSession", JSON.stringify(data.user));
          Cookies.set("userSession", JSON.stringify(data.user), {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
          });

          setStatusType("success");
          setStatusText("Sucesso!");
          setStatusDetail("Login realizado com sucesso! Redirecionando...");

          if (data.user.mustResetPassword) {
            router.push("/set-new-password");
          } else if (data.user.role === "ADMIN") {
            router.push("/admin-dashboard");
          } else if (data.user.role === "PUBLIC") {
            router.push("/public-dashboard");
          }
        }
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("userSession");
        Cookies.remove("userSession");

        setStatusType("error");
        setStatusText("Erro!");
        setStatusDetail("Credenciais inválidas. Por favor tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao conectar com a API de login:", error);
      setIsLoggedIn(false);
      localStorage.removeItem("userSession");
      Cookies.remove("userSession");

      setStatusType("error");
      setStatusText("Erro!");
      setStatusDetail(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    }
  };

  // Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Ícones SVG para os status (removendo a dependência de arquivos PNG/JPG)
  const StatusSuccessSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const StatusLoadingSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4"></path>
      <path d="M12 18v4"></path>
      <path d="M4.93 4.93l2.83 2.83"></path>
      <path d="M16.24 16.24l2.83 2.83"></path>
      <path d="M2 12h4"></path>
      <path d="M18 12h4"></path>
      <path d="M4.93 19.07l2.83-2.83"></path>
      <path d="M16.24 7.76l2.83-2.83"></path>
    </svg>
  );

  const StatusErrorSVG = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div className={styles.gridContainer}>
      <header className={styles.header_module}>
        <nav className={styles.navLogo}>
          <Image
            src="/logoLukSoft.jpg"
            alt="Logo LukSoft"
            width={230}
            height={40}
          ></Image>
        </nav>
        <div className={styles.formulario}>
          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <h2 className={styles.formTitle}>Acesse sua conta</h2>

            <div>
              {/* Email Field - SVG inline para o ícone e estrutura correta */}
              <label htmlFor="emailInput" className={styles.inputLabel}>
                Email
              </label>
              <div className={styles.inputFieldWrapper}>
                {/* Ícone de Email à esquerda */}
                <span className={styles.inputIcon}>
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
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  id="emailInput"
                  type="email"
                  // placeholder="Seu email" <-- REMOVIDO, ícone já indica o campo
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.formInput}
                />
              </div>
            </div>

            <div>
              {/* Password Field - SVG inline para o ícone de cadeado e estrutura correta */}
              <label htmlFor="passwordInput" className={styles.inputLabel}>
                Senha
              </label>
              <div className={styles.inputFieldWrapper}>
                {/* Ícone de Cadeado à esquerda */}
                <span className={styles.inputIcon}>
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
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  id="passwordInput"
                  type={showPassword ? "text" : "password"} // Alterna o tipo do input
                  // placeholder="Sua senha" <-- REMOVIDO, ícone já indica o campo
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={
                    styles.formInput + " " + styles.passwordInputWithToggle
                  } // Nova classe para ajustar o padding-right
                />
                {/* NOVO: Ícone de Olho à direita - Clicável para alternar visibilidade */}
                <span
                  className={styles.rightInputIcon}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    // Olho aberto (para esconder)
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
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    // Olho fechado (para mostrar)
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
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.54 18.54 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.54 18.54 0 0 1-5.06 5.94M1 1l22 22"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </span>
              </div>
            </div>
            <Link
              href="/set-new-password"
              className={styles.forgotPasswordLink}
            >
              Esqueceu a senha?
            </Link>
            <button type="submit" className={styles.loginButton}>
              Entrar
            </button>
          </form>
        </div>

        {statusType !== "idle" && (
          <div className={styles.statusContainer}>
            <span
              className={
                statusType === "loading" ? styles.statusLoadingIcon : ""
              }
            >
              {statusType === "success" && <StatusSuccessSVG />}
              {statusType === "loading" && <StatusLoadingSVG />}
              {statusType === "error" && <StatusErrorSVG />}
            </span>
            <div
              className={statusIconClass[statusType]}
              aria-hidden="true"
            ></div>
            <h2
              className={`${styles.statusTitle} ${
                statusType === "success"
                  ? styles.statusSuccessText
                  : statusType === "loading"
                  ? styles.statusLoadingText
                  : styles.statusErrorText
              }`}
            >
              {statusText}
            </h2>
            <p
              className={`${styles.message} ${
                statusType === "success"
                  ? styles.statusSuccessDetail
                  : statusType === "loading"
                  ? styles.statusLoadingDetail
                  : styles.statusErrorDetail
              }`}
            >
              {statusDetail}
            </p>
          </div>
        )}
      </header>

      <div className={styles.welcome_modules}>
        <div className={styles.title}>
          <h1>Bem-vindo(a) à nossa intranet! </h1>
          <Image
            className={styles.emoji}
            src="/emoji.jpg"
            alt="Emoji de boas-vindas"
            width={35}
            height={35}
          ></Image>
        </div>

        <div className={styles.apiMessageContainer}>
          {/* Garante que o conteúdo só é exibido após a hidratação e se não houver erro */}
          {quoteLoading || !hasHydrated ? (
            <p className={styles.quoteError}> Carregando citação...</p>
          ) : quoteError ? (
            <p className={styles.quoteError}>{quoteError}</p>
          ) : (
            <>
              <p className={styles.quoteText}>&ldquo;{motivationalQuote.frase}&rdquo;</p>
              <p className={styles.quoteText}>- Autor {motivationalQuote.nomeAutor}.</p>
            </>
          )}
        </div>

        <div className={styles.img_welcome}>
          <Image
            src="/imgPorta.jpg"
            alt="Imagem de porta"
            width={800}
            height={450}
          ></Image>
        </div>
      </div>
    </div>
  );
}
