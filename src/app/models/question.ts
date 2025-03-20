export interface Question {
  id?: string;
  title: string;
  content: string;
  location: {
    latitude: number;
    longitude: number;
  };
  created_at?: Date;
  updated_at?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  distance?: number;
  answers_count?: number;
}
