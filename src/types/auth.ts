export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isBusinessClient?: boolean;
  companyName?: string;
  businessType?: string;
  employeeCount?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  avatar?: string;
  isBusinessClient?: boolean;
  companyName?: string;
  businessType?: string;
  employeeCount?: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

export interface AuthValidationResult {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}