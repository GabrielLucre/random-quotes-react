import { useState, useEffect } from "react";
import { RiDoubleQuotesL } from "react-icons/ri";
import axios from "axios";

function Home() {
  const [currentQuote, setCurrentQuote] = useState({
    text: "É estupidez pedir aos deuses aquilo que se pode conseguir sozinho.",
    author: "Epicuro",
  });
  const [nextQuote, setNextQuote] = useState({
    text: "É estupidez pedir aos deuses aquilo que se pode conseguir sozinho.",
    author: "Epicuro",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://dummyjson.com/quotes/random");
      if (response.data && response.data.quote) {
        const fetched = {
          text: response.data.quote,
          author: response.data.author || "Desconhecido",
        };
        setNextQuote(fetched);
        setIsFlipping(true);
      }
    } catch (err) {
      console.error("Erro ao buscar frase:", err);
      setError("Não foi possível carregar uma nova frase. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationEnd = () => {
    setCurrentQuote(nextQuote);
    setIsFlipping(false);
  };

  // Se for o carregamento inicial, busca a primeira frase da API sem rodar a animação
  useEffect(() => {
    const loadInitialQuote = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/quotes/random");
        if (response.data && response.data.quote) {
          const fetched = {
            text: response.data.quote,
            author: response.data.author || "Desconhecido",
          };
          setCurrentQuote(fetched);
          setNextQuote(fetched);
        }
      } catch (err) {
        console.error("Erro ao carregar frase inicial:", err);
      }
    };
    loadInitialQuote();
  }, []);

  return (
    <div className="app-viewport">
      {/* Página de Baixo (Underneath/New Page) */}
      <div className="page-layer page-underneath">
        <div className="quote-container">
          <p className="quote">
            <RiDoubleQuotesL className="quote-icon" />
            {nextQuote.text}
          </p>
          <div className="author">~ {nextQuote.author}</div>
          <button className="fetch-button" disabled>
            Nova Frase
          </button>
        </div>
      </div>

      {/* Página Ativa (Active/Flipping Page) */}
      <div 
        className={`page-layer page-active ${isFlipping ? "is-flipping" : ""}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="quote-container">
          <p className="quote">
            <RiDoubleQuotesL className="quote-icon" />
            {currentQuote.text}
          </p>
          <div className="author">~ {currentQuote.author}</div>
          {error && <div className="error-message">{error}</div>}
          <button 
            onClick={fetchQuote} 
            disabled={loading || isFlipping}
            className="fetch-button"
          >
            {loading ? "Carregando..." : "Nova Frase"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

