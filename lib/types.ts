
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

export interface Newsletter {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
