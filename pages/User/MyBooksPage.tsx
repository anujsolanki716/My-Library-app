import React, { useEffect } from 'react'; // Added useEffect
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';
import BookCard from '../../components/Books/BookCard';
import { Link }from 'react-router-dom';

const MyBooksPage: React.FC = () => {
  const { currentUser } = useAuth();
  // borrowedBooks are now directly from context, pre-fetched and typed with Book & { borrowDate: string }
  const { borrowedBooks, isLoading, error, fetchMyBorrowedBooks } = useBooks(); 

  useEffect(() => {
    // Ensure borrowed books are fetched if not already, or on component mount if user is present
    if (currentUser) {
      fetchMyBorrowedBooks();
    }
  }, [currentUser, fetchMyBorrowedBooks]);


  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">Please log in to see your borrowed books.</p>
        <Link to="/login" className="text-blue-500 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    );
  }
  
  if (isLoading && borrowedBooks.length === 0) { // Show loading only if initial fetch is happening
    return <div className="text-center py-10 text-gray-600">Loading your borrowed books...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error loading your books: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">My Borrowed Books</h1>
        <p className="text-gray-600">Here are the books you're currently enjoying.</p>
      </div>

      {borrowedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {borrowedBooks.map((bookDetail) => // bookDetail is now Book & { borrowDate: string }
            bookDetail && ( 
              <div key={bookDetail.id} className="relative">
                <BookCard book={bookDetail} /> 
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  Borrowed: {new Date(bookDetail.borrowDate).toLocaleDateString()}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white shadow rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-xl text-gray-500">You haven't borrowed any books yet.</p>
          <p className="text-gray-400 mt-2">Why not check out our <Link to="/books" className="text-blue-500 hover:underline">catalog</Link>?</p>
        </div>
      )}
    </div>
  );
};

export default MyBooksPage;
