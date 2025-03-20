export interface LoginResponse
{
  status: {
    code: number;
    message: string;
  };
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      created_at: string;
      updated_at: string;
    };
  };
}
