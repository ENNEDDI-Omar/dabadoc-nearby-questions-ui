
export interface User {
  id?: string;
  name: string;
  email: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at?: Date;
  updated_at?: Date;
}export interface User {
}
