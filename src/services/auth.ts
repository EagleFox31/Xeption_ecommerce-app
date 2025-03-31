// Mock user type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// Mock authentication state
let currentUser: User | null = null;

// Mock user data
const mockUsers: User[] = [
  {
    id: "user-1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    phone: "+237 691234567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jean",
  },
  {
    id: "user-2",
    firstName: "Marie",
    lastName: "Kouam",
    email: "marie.k@example.com",
    phone: "+237 677889900",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
  },
];

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For demo purposes, find a user with matching email
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (!user) {
    throw new Error("Identifiants incorrects. Veuillez réessayer.");
  }

  // In a real app, we would verify the password here
  // For demo, we'll just check if password is at least 6 chars
  if (password.length < 6) {
    throw new Error("Identifiants incorrects. Veuillez réessayer.");
  }

  // Set the current user
  currentUser = user;

  // Store in localStorage (in a real app, we'd store a token)
  localStorage.setItem("xeption_user", JSON.stringify(user));

  return user;
};

// Register function
export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Check if user already exists
  const existingUser = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (existingUser) {
    throw new Error("Cette adresse e-mail est déjà utilisée.");
  }

  // In a real app, we would create the user in the database
  // For demo, we'll just add to our mock array
  const newUser: User = {
    id: `user-${mockUsers.length + 1}`,
    firstName,
    lastName,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName.toLowerCase()}`,
  };

  mockUsers.push(newUser);

  // We don't automatically log in the user after registration
  // They will need to go to the login page
};

// Logout function
export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem("xeption_user");
};

// Get current user function
export const getCurrentUser = (): User | null => {
  if (currentUser) {
    return currentUser;
  }

  // Try to get from localStorage
  const storedUser = localStorage.getItem("xeption_user");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    } catch (e) {
      localStorage.removeItem("xeption_user");
    }
  }

  return null;
};

// Update user profile
export const updateUserProfile = async (
  userData: Partial<User>,
): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = getCurrentUser();
  if (!user) {
    throw new Error("Utilisateur non connecté");
  }

  // Update the user data
  const updatedUser = { ...user, ...userData };

  // Update in our mock array
  const index = mockUsers.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    mockUsers[index] = updatedUser;
  }

  // Update current user
  currentUser = updatedUser;

  // Update in localStorage
  localStorage.setItem("xeption_user", JSON.stringify(updatedUser));

  return updatedUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
