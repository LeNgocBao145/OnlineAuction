import type { User } from "./User";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;

  setAccessToken: (newAccessToken: string) => void;

  register: (
    name: string,
    email: string,
    password: string,
    birthdate: string,
    address: string,
  ) => Promise<void>;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  fetchMe: () => Promise<void>;

  refresh: () => Promise<void>;
}