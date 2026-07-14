import { useState, useEffect, useRef } from "react";
import { RiDoubleQuotesL } from "react-icons/ri";
import axios from "axios";

function Home() {
  const [currentQuote, setCurrentQuote] = useState({
    text: "",
    author: "",
  });
  const [nextQuote, setNextQuote] = useState({
    text: "",
    author: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const activePageRef = useRef(null);
  const shadowRef = useRef(null);

  const getRandomQuote = async () => {
    const response = await axios.get("https://dummyjson.com/quotes/random");
    if (response.data && response.data.quote) {
      return {
        text: response.data.quote,
        author: response.data.author || "Desconhecido",
      };
    }
    throw new Error("Formato de resposta inválido");
  };

  const prefetchNextQuote = async () => {
    try {
      const fetched = await getRandomQuote();
      setNextQuote(fetched);
    } catch (err) {
      console.error("Erro ao fazer prefetch da frase:", err);
    }
  };

  // Carrega as duas primeiras frases em paralelo
  useEffect(() => {
    const loadInitialQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const [q1, q2] = await Promise.all([getRandomQuote(), getRandomQuote()]);
        setCurrentQuote(q1);
        setNextQuote(q2);
      } catch (err) {
        console.error("Erro ao carregar frases iniciais:", err);
        setError("Não foi possível carregar as frases. Tente novamente!");
      } finally {
        setLoading(false);
      }
    };
    loadInitialQuotes();
  }, []);

  const handlePointerDown = (e) => {
    if (isFlipping || loading) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = startX - e.clientX;
    const deltaY = startY - e.clientY;

    // Se mover mais verticalmente do que horizontalmente, ignora o gesto
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      setIsDragging(false);
      return;
    }

    // Apenas deslizar da direita para a esquerda (deltaX > 0)
    const progress = Math.min(1, Math.max(0, deltaX / window.innerWidth));
    const angle = -180 * progress;

    if (activePageRef.current) {
      activePageRef.current.style.transition = "none";
      activePageRef.current.style.transform = `rotateY(${angle}deg)`;
    }
    if (shadowRef.current) {
      shadowRef.current.style.transition = "none";
      shadowRef.current.style.opacity = (Math.sin(progress * Math.PI) * 0.6).toString();
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = startX - e.clientX;
    const threshold = window.innerWidth * 0.2; // 20% da largura da janela

    if (deltaX > threshold && !isFlipping) {
      // Confirma e completa a virada de página
      setIsFlipping(true);
      if (activePageRef.current) {
        activePageRef.current.style.transition = "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
        activePageRef.current.style.transform = "rotateY(-180deg)";
      }
      if (shadowRef.current) {
        shadowRef.current.style.transition = "opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
        shadowRef.current.style.opacity = "0";
      }
    } else {
      // Cancela e volta para 0
      if (activePageRef.current) {
        activePageRef.current.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
        activePageRef.current.style.transform = "rotateY(0deg)";
      }
      if (shadowRef.current) {
        shadowRef.current.style.transition = "opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
        shadowRef.current.style.opacity = "0";
      }
    }
  };

  const handleTransitionEnd = (e) => {
    if (e.propertyName === "transform" && isFlipping) {
      setCurrentQuote(nextQuote);
      if (activePageRef.current) {
        activePageRef.current.style.transition = "none";
        activePageRef.current.style.transform = "rotateY(0deg)";
      }
      setIsFlipping(false);
      prefetchNextQuote();
    }
  };

  return (
    <div 
      className="app-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Página de Baixo (Underneath/New Page) */}
      <div className="page-layer page-underneath">
        <div className="quote-container">
          <p className="quote">
            <RiDoubleQuotesL className="quote-icon" />
            {nextQuote.text}
          </p>
          <div className="author">~ {nextQuote.author}</div>
        </div>
      </div>

      {/* Página Ativa (Active/Flipping Page) */}
      <div 
        className="page-layer page-active"
        ref={activePageRef}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="page-shadow" ref={shadowRef} />
        <div className="quote-container">
          <p className="quote">
            <RiDoubleQuotesL className="quote-icon" />
            {currentQuote.text}
          </p>
          <div className="author">~ {currentQuote.author}</div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default Home;
