
export interface UserProfile {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  troop?: string;
  role?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScoutEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'meeting' | 'activity' | 'camping' | 'service';
}

export interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}
