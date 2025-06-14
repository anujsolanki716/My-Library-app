
import React from 'react';
import { Book, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';
import Button from '../Common/Button';

interface BookCardProps {
  book: Book; // Book might now contain availableCopies or borrowedCount from backend
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const { borrowBook, returnBook, getAvailableCopies, isBookBorrowedByUser, isLoading: bookContextLoading } = useBooks();

  // getAvailableCopies now might take the full book object if it contains necessary fields
  // or the context method is updated to fetch/calculate it.
  // Assuming book object from API might contain `availableCopies` or enough info for `getAvailableCopies(book)`
  const availableCopies = getAvailableCopies(book); 
  const isBorrowedByCurrentUser = isBookBorrowedByUser(book.id);

  const handleBorrow = async () => {
    if (currentUser) {
      const success = await borrowBook(book.id);
      if (success) {
        alert(`Book "${book.title}" borrowed successfully!`);
      }
      // Error is handled by context and displayed globally, or can be shown locally too.
    }
  };

  const handleReturn = async () => {
    if (currentUser) {
      const success = await returnBook(book.id);
      if (success) {
        alert(`Book "${book.title}" returned successfully!`);
      }
    }
  };
  
  // Use book.borrowedCount if available from backend, otherwise use 0
  const borrowedCount = book.borrowedCount || 0;


  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl">
      <img
        src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/400/600`}
        alt={`Cover of ${book.title}`}
        className="w-full h-64 object-cover"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => (e.currentTarget.src = 'https://picsum.photos/400/600?grayscale')}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate" title={book.title}>{book.title}</h3>
        <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
        <p className="text-xs text-gray-500 mb-3 bg-gray-100 px-2 py-1 rounded-full self-start">{book.genre}</p>

        <div className="mt-auto">
           <p className={`text-sm mb-1 ${availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {availableCopies > 0 ? `${availableCopies} available` : 'Out of stock'}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            Total: {book.totalCopies} (Borrowed: {borrowedCount})
          </p>


          {currentUser && (
            <div className="space-y-2">
              {currentUser.role === Role.ADMIN && onEdit && onDelete && (
                <div className="flex space-x-2">
                  <Button onClick={() => onEdit(book)} variant="secondary" size="sm" className="w-full">Edit</Button>
                  <Button onClick={() => onDelete(book.id)} variant="danger" size="sm" className="w-full">Delete</Button>
                </div>
              )}
              {currentUser.role === Role.USER && (
                <>
                  {isBorrowedByCurrentUser ? (
                    <Button
                      onClick={handleReturn}
                      disabled={bookContextLoading}
                      variant="secondary"
                      className="w-full"
                    >
                      {bookContextLoading ? 'Returning...' : 'Return Book'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBorrow}
                      disabled={availableCopies <= 0 || bookContextLoading}
                      variant="primary"
                      className="w-full"
                    >
                      {bookContextLoading ? 'Processing...' : 'Borrow Book'}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
