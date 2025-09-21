
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { 
  Avatar,
  AvatarImage,
  AvatarFallback
} from "./ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { 
  Home,
  User,
  LogOut,
  Settings,
  Users,
  Building2,
  Menu,
  X,
  MessageSquare
} from "lucide-react";

function NavigationWithNotifications() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { userRole } = useRoleAuth();
  const { profile } = useUserProfile();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Remove the trackEvent that doesn't exist
      // trackEvent("user_signed_out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    currentUser && userRole === "admin" && { name: "Admin", href: "/admin", icon: Settings },
    currentUser && userRole === "organization" && { name: "Dashboard", href: "/organization", icon: Building2 },
    currentUser && userRole === "client" && { name: "Profile", href: "/profile", icon: User },
    currentUser && (userRole === "client" || userRole === "admin") && { 
      name: "My Conversations", 
      href: "/my-conversations", 
      icon: MessageSquare 
    },
  ].filter(Boolean);

  const userInitials = currentUser?.displayName
    ? getInitials(currentUser.displayName)
    : "VA";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4 relative">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            2Marines
          </Link>

          <nav className="hidden md:flex mx-6 items-center space-x-4">
            {navLinks.map(
              (link) =>
                link && (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <NotificationBell />
          )}
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.photoURL || currentUser.photoURL || ""}
                      alt={currentUser.displayName || "User"}
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {userRole === "organization" && (
                  <DropdownMenuItem asChild>
                    <Link to="/organization" className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" />
                      Organization Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {userRole === "client" && (
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                {userRole === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/users" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          )}

          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden z-50">
            <nav className="container py-4">
              <ul className="space-y-4">
                {navLinks.map(
                  (link) =>
                    link && (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className={`flex items-center py-2 ${
                            location.pathname === link.href
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.name}
                        </Link>
                      </li>
                    )
                )}
                {!currentUser && (
                  <li>
                    <Link
                      to="/login"
                      className="flex items-center py-2 text-muted-foreground"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Log In
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavigationWithNotifications;
