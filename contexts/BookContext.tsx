
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Book, BorrowedBookRecord } from '../types';
import { API_BASE_URL } from '../constants';
import { useAuth } from './AuthContext';

interface BookContextType {
  books: Book[];
  borrowedBooks: (Book & { borrowDate: string })[]; // User's borrowed books with details
  isLoading: boolean;
  error: string | null;
  fetchBooks: () => Promise<void>;
  fetchMyBorrowedBooks: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'coverImageUrl' | 'borrowedCount'> & { coverImageUrl?: string }) => Promise<Book | null>;
  updateBook: (bookId: string, updates: Partial<Omit<Book, 'id' | 'borrowedCount'>>) => Promise<Book | null>;
  deleteBook: (bookId: string) => Promise<boolean>;
  borrowBook: (bookId: string) => Promise<boolean>;
  returnBook: (bookId: string) => Promise<boolean>;
  getAvailableCopies: (book: Book) => number; // Now takes full book object
  isBookBorrowedByUser: (bookId: string) => boolean; // No longer needs userId, uses context's borrowedBooks
  getBookById: (bookId: string) => Book | undefined;
  // getBorrowedCountForBook is implicitly handled by backend or can be calculated if all records were fetched (not efficient)
  // For admin, a separate endpoint might provide borrow counts, or it's part of book details from backend
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<(Book & { borrowDate: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, currentUser } = useAuth();

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (response.ok) {
        const data: Book[] = await response.json();
        // Assuming backend now sends totalCopies and currentBorrowedCount for each book
        setBooks(data);
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to fetch books.");
      }
    } catch (e) {
      console.error("Fetch books error:", e);
      setError("Network error or server unavailable while fetching books.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyBorrowedBooks = useCallback(async () => {
    if (!token) {
      setBorrowedBooks([]); // Not logged in, no borrowed books
      return;
    }
    setIsLoading(true); // Can set loading for this specific action
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/borrowed-books`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data: (Book & { borrowDate: string })[] = await response.json();
        setBorrowedBooks(data);
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to fetch borrowed books.");
        setBorrowedBooks([]);
      }
    } catch (e) {
      console.error("Fetch borrowed books error:", e);
      setError("Network error fetching borrowed books.");
      setBorrowedBooks([]);
    } finally {
      setIsLoading(false); // Ensure loading is reset
    }
  }, [token]);

  useEffect(() => {
    fetchBooks();
    if (currentUser) { // Fetch borrowed books if user is logged in
        fetchMyBorrowedBooks();
    } else {
        setBorrowedBooks([]); // Clear borrowed books if user logs out
    }
  }, [currentUser, fetchBooks, fetchMyBorrowedBooks]); // Add fetchMyBorrowedBooks to dependencies


  const getAvailableCopies = useCallback((book: Book): number => {
    // Backend provides `borrowedCount` on each book object.
    return book.totalCopies - (book.borrowedCount || 0);
  }, []); // Removed 'books' dependency as 'book.borrowedCount' comes with the book object itself.


  const isBookBorrowedByUser = useCallback((bookId: string): boolean => {
    return borrowedBooks.some(b => b.id === bookId);
  }, [borrowedBooks]);

  const getBookById = useCallback((bookId: string): Book | undefined => {
    return books.find(b => b.id === bookId);
  }, [books]);

  const addBook = useCallback(async (bookData: Omit<Book, 'id' | 'coverImageUrl' | 'borrowedCount'> & { coverImageUrl?: string }): Promise<Book | null> => {
    if (!token) { setError("Authentication required."); return null; }
    setError(null); setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      if (response.ok) {
        setBooks(prev => [...prev, data]);
        setIsLoading(false);
        return data;
      } else {
        setError(data.message || "Failed to add book.");
        setIsLoading(false);
        return null;
      }
    } catch (e) {
      console.error("Add book error:", e);
      setError("Network error or server failed to add book.");
      setIsLoading(false);
      return null;
    }
  }, [token]);

  const updateBook = useCallback(async (bookId: string, updates: Partial<Omit<Book, 'id' | 'borrowedCount'>>): Promise<Book | null> => {
    if (!token) { setError("Authentication required."); return null; }
    setError(null); setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (response.ok) {
        setBooks(prev => prev.map(b => b.id === bookId ? data : b));
        // If the updated book was in borrowedBooks, update it there too (title, etc might change)
        setBorrowedBooks(prev => prev.map(b => b.id === bookId ? {...data, borrowDate: b.borrowDate} : b));
        setIsLoading(false);
        return data;
      } else {
        setError(data.message || "Failed to update book.");
        setIsLoading(false);
        return null;
      }
    } catch (e) {
      console.error("Update book error:", e);
      setError("Network error or server failed to update book.");
      setIsLoading(false);
      return null;
    }
  }, [token]);

  const deleteBook = useCallback(async (bookId: string): Promise<boolean> => {
    if (!token) { setError("Authentication required."); return false; }
    setError(null); setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setBooks(prev => prev.filter(b => b.id !== bookId));
        setBorrowedBooks(prev => prev.filter(b => b.id !== bookId)); // Remove if it was borrowed
        setIsLoading(false);
        return true;
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete book.");
        setIsLoading(false);
        return false;
      }
    } catch (e) {
      console.error("Delete book error:", e);
      setError("Network error or server failed to delete book.");
      setIsLoading(false);
      return false;
    }
  }, [token]);

  const borrowBook = useCallback(async (bookId: string): Promise<boolean> => {
    if (!token) { setError("Authentication required."); return false; }
    setError(null); // setIsLoading(true); // Handled by component usually
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/borrow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        // Refetch user's borrowed books and all books to update counts
        await fetchMyBorrowedBooks();
        await fetchBooks(); // To update available counts potentially
        return true;
      } else {
        setError(data.message || "Failed to borrow book.");
        return false;
      }
    } catch (e) {
      console.error("Borrow book error:", e);
      setError("Network error or server failed to borrow book.");
      return false;
    }
  }, [token, fetchMyBorrowedBooks, fetchBooks]);

  const returnBook = useCallback(async (bookId: string): Promise<boolean> => {
    if (!token) { setError("Authentication required."); return false; }
    setError(null); // setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/return`, {
        method: 'POST', // Or DELETE if preferred RESTfully
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        await fetchMyBorrowedBooks();
        await fetchBooks(); // To update available counts
        return true;
      } else {
        setError(data.message || "Failed to return book.");
        return false;
      }
    } catch (e) {
      console.error("Return book error:", e);
      setError("Network error or server failed to return book.");
      return false;
    }
  }, [token, fetchMyBorrowedBooks, fetchBooks]);

  return (
    <BookContext.Provider value={{
      books, borrowedBooks, isLoading, error, fetchBooks, fetchMyBorrowedBooks,
      addBook, updateBook, deleteBook, borrowBook, returnBook,
      getAvailableCopies, isBookBorrowedByUser, getBookById,
    }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = (): BookContextType => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
