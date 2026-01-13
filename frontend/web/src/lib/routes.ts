export const isPublicRoute = (pathname: string) => {
  if (!pathname || pathname === "/") return true;
  if (pathname.startsWith("/site")) return true;
  if (pathname.startsWith("/marinecoin")) return true;

  return [
    "/features",
    "/info",
    "/shieldmate",
    "/shop",
    "/partnerships",
    "/brand",
    "/socials",
    "/pricing",
    "/about",
    "/contact",
    "/signin",
    "/signup",
    "/login",
  ].includes(pathname);
};
