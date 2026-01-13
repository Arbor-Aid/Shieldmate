import MarineCoinLanding from "./marinecoin/MarineCoinLanding";
import TwoMarinesMarineCoin from "./twomarines/TwoMarinesMarineCoin";

const isTwoMarinesHost = () => {
  if (typeof window === "undefined") return false;
  return ["2marines.us", "www.2marines.us", "marines-ai-agent.web.app", "marines-ai-agent.firebaseapp.com"].includes(
    window.location.hostname
  );
};

export default function MarineCoinRoute() {
  return isTwoMarinesHost() ? <TwoMarinesMarineCoin /> : <MarineCoinLanding />;
}
