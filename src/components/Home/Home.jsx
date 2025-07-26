import { RiDoubleQuotesL } from "react-icons/ri";

function Home() {
  return (
    <div>
      <p className="quote">
        <RiDoubleQuotesL className="quote-icon" />
        É estupidez pedir aos deuses aquilo que se pode conseguir sozinho.
      </p>
      <div className="author">~ Epicuro</div>
    </div>
  );
}

export default Home;
