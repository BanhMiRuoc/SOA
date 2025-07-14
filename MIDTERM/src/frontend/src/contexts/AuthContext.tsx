import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, LoginResponse } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Đảm bảo token từ localStorage được đính kèm vào đối tượng user
        parsedUser.token = storedToken;
        setUser(parsedUser);
        console.log('Restored user session from localStorage');
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
      }
    } else {
      console.log('No stored user session found');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        throw new Error('Invalid credentials');
      }

      const data: LoginResponse = await response.json();
      console.log('Login response received:', { ...data, token: data.token.substring(0, 15) + '...' });
      
      // Convert backend response to User format
      const authenticatedUser: User = {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        token: data.token
      };
      
      // Lưu token riêng biệt trong localStorage
      localStorage.setItem('token', data.token);
      
      // Lưu thông tin người dùng mà không có token
      const userWithoutToken = { ...authenticatedUser };
      delete userWithoutToken.token;
      localStorage.setItem('userData', JSON.stringify(userWithoutToken));
      
      setUser(authenticatedUser);
      console.log('User logged in successfully:', authenticatedUser.name);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    console.log('User logged out');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};