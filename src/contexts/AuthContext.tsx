
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Define our user type
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// Define our auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For this MVP, we'll mock authentication using localStorage
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('diceyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For MVP, we'll just check if email contains @ and password is not empty
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create a mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: email.split('@')[0],
        createdAt: new Date(),
      };
      
      // Save user to localStorage
      localStorage.setItem('diceyUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!displayName.trim()) {
        throw new Error('Display name is required');
      }
      
      // Create a mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName,
        createdAt: new Date(),
      };
      
      // Save user to localStorage
      localStorage.setItem('diceyUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('diceyUser');
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
