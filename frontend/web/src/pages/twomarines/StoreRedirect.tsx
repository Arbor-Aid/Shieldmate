import { useEffect } from "react";
import { SHOPIFY_STORE_URL } from "@/config/marketingLinks";
import TwoMarinesShop from "./TwoMarinesShop";

export default function StoreRedirect() {
  useEffect(() => {
    if (SHOPIFY_STORE_URL) {
      window.location.replace(SHOPIFY_STORE_URL);
    }
  }, []);

  if (SHOPIFY_STORE_URL) {
    return null;
  }

  return <TwoMarinesShop />;
}
