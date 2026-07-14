import { useState, useEffect } from "react";
import { RiDoubleQuotesL } from "react-icons/ri";
import axios from "axios";

function Home() {
  const [quote, setQuote] = useState({
    text: "É estupidez pedir aos deuses aquilo que se pode conseguir sozinho.",
    author: "Epicuro",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://dummyjson.com/quotes/random");
      if (response.data && response.data.quote) {
        setQuote({
          text: response.data.quote,
          author: response.data.author || "Desconhecido",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar frase:", err);
      setError("Não foi possível carregar uma nova frase. Tente novamente!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="quote-container">
      <p className="quote">
        <RiDoubleQuotesL className="quote-icon" />
        {quote.text}
      </p>
      <div className="author">~ {quote.author}</div>
      {error && <div className="error-message">{error}</div>}
      <button 
        onClick={fetchQuote} 
        disabled={loading}
        className="fetch-button"
      >
        {loading ? "Carregando..." : "Nova Frase"}
      </button>
    </div>
  );
}

export default Home;

