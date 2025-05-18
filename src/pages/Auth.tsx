
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        <h1 className="game-headline mb-2">DiceyDecisions</h1>
        <p className="game-subheading mb-8">Login or create an account to get started</p>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
