export const isPublicRoute = (pathname: string) => {
  if (!pathname || pathname === "/") return true;
  if (pathname.startsWith("/site")) return true;
  if (pathname.startsWith("/marinecoin")) return true;

  return [
    "/features",
    "/pricing",
    "/about",
    "/contact",
    "/signin",
    "/signup",
    "/login",
  ].includes(pathname);
};
