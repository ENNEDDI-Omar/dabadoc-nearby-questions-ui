export interface Question {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  location: {
    type?: string;
    coordinates?: number[];
    latitude?: number;
    longitude?: number;
  };
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  distance?: number;
  answers_count?: number;
  favorites_count?: number;
}
