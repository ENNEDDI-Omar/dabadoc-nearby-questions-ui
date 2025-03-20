export interface RegisterRequest
{
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  location?: { latitude: number; longitude: number } | null;
}
