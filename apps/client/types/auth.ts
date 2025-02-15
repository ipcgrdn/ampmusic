export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

export type AuthError = {
  message: string;
  code: string;
};

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  error: AuthError | null;
  clearError: () => void;
} 