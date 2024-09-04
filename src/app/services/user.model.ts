// src/app/services/user.model.ts
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobile: string;
  city: string;
  role: string;
  image?: string;
}
