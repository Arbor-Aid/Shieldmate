import ShieldmateLanding from "./ShieldmateLanding";
import TwoMarinesHome from "./twomarines/TwoMarinesHome";

const Public = () => {
  const host =
    typeof window !== "undefined" ? window.location.hostname : "";
  const twoMarinesHosts = new Set([
    "2marines.us",
    "www.2marines.us",
    "marines-ai-agent.web.app",
    "marines-ai-agent.firebaseapp.com",
  ]);

  if (twoMarinesHosts.has(host)) {
    return <TwoMarinesHome />;
  }

  return <ShieldmateLanding />;
};

export default Public;
