import { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { Admin } from "../types"; // Importamos a tipagem do Admin

// 1. Definimos o que o Contexto oferece
interface AuthContextType {
  isAuthenticated: boolean;
  user: Admin | null; // <--- ADICIONADO: Agora o contexto sabe que existe um usuário
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Admin | null>(null); // Estado para guardar o Admin
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao recarregar a página, recupera o token E os dados do usuário
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      setIsAuthenticated(true);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // AQUI ESTÁ O TRUQUE:
      // O seu backend precisa retornar { token: "...", user: { id: 1, name: "...", email: "..." } }
      // Se o backend retornar apenas o token, precisaremos decodificá-lo ou fazer um fetch extra.
      // Vou assumir que você ajustará o backend ou que ele já retorna algo assim:

      const { token, name, id } = response.data;

      // Se o backend retornar os dados soltos ou dentro de um objeto 'user', ajuste aqui:
      // Exemplo de objeto User provisório se o backend só mandar token por enquanto:
      const userObj: Admin = {
        id: id || 1, // Fallback para 1 se o back não mandar ID (para testar)
        name: name || "Admin",
        email: email,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userObj)); // Salvamos o objeto usuário

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(userObj);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login falhou", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.defaults.headers.common.Authorization = "";
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
