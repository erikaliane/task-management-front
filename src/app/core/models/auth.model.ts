export interface LoginRequest {
  email: string;
  password: string;
}

// ✅ Actualizado según tu backend response
export interface LoginResponse {
  token: string;
  message: string;
  // user se extrae del token decodificado
}

// ✅ Actualizado según tu JWT payload
export interface TokenPayload {
  user_id: string;
  role: string; // "Admin" | "Employee"
  expires: string;
  iss: string;
  aud: string;
}

// ✅ User interface completa
export interface User {
  id: string; // Como string según tu backend
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee'
}

// ✅ Para construir el user desde el token
export interface UserProfile extends User {
  fullName: string;
}