
export interface UserProfile {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  troop: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    troop?: string;
    role?: string;
  };
}
