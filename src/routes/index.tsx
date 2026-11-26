import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/site/site-layout";

import Home from "./home";
import Info from "./info";
import ShieldMate from "./shieldmate";
import MarineCoin from "./marinecoin";
import Shop from "./shop";
import Partnerships from "./partnerships";
import Brand from "./brand";
import Socials from "./socials";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<Info />} />
        <Route path="/shieldmate" element={<ShieldMate />} />
        <Route path="/marinecoin" element={<MarineCoin />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/brand" element={<Brand />} />
        <Route path="/socials" element={<Socials />} />

        {/* safe fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}