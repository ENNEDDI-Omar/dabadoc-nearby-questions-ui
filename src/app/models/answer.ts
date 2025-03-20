export interface Answer {
  id?: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  question_id?: string;
}
