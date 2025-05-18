
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AppHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-background border-b py-3">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            DiceyDecisions
          </h1>
        </Link>

        <nav className="hidden md:flex gap-6">
          <Link to="/" className="text-foreground/80 hover:text-foreground">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/rooms" className="text-foreground/80 hover:text-foreground">
                My Rooms
              </Link>
              <Link to="/history" className="text-foreground/80 hover:text-foreground">
                History
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm">
                Hi, {user?.displayName}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
