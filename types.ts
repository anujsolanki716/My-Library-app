
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  email: string; // Email used for login
  password?: string; // Only used for registration/login, not stored as plain text long-term
  role: Role;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  coverImageUrl?: string; // Optional cover image
  borrowedCount?: number; // Number of copies currently borrowed
}

export interface BorrowedBookRecord {
  id: string; // Unique ID for the borrow record
  userId: string;
  bookId: string;
  borrowDate: string; // ISO Date string
}

// Props for common components
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
