// Simple in-memory storage for development/testing
// In production, this would be replaced with a proper database

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  created_at: Date;
}

// In-memory users storage
let users: User[] = [];

export const userStorage = {
  // Add a new user
  create: (user: User) => {
    users.push(user);
    console.log("Storage - User created:", user.email, "Total users:", users.length);
    return user;
  },

  // Find user by email
  findByEmail: (email: string) => {
    const user = users.find(u => u.email === email);
    console.log("Storage - Find by email:", email, "Found:", !!user);
    return user;
  },

  // Find user by ID
  findById: (id: string) => {
    const user = users.find(u => u.id === id);
    console.log("Storage - Find by ID:", id, "Found:", !!user);
    return user;
  },

  // Get all users (for debugging)
  getAll: () => {
    console.log("Storage - Get all users, count:", users.length);
    return users;
  },

  // Clear all users (for testing)
  clear: () => {
    users = [];
    console.log("Storage - All users cleared");
  }
};