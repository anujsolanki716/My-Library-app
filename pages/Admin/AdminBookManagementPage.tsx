
import React, { useState, useEffect } from 'react';
import { useBooks } from '../../contexts/BookContext';
import { Book } from '../../types';
// BookCard is removed from here as we create a custom card structure below
import BookForm from '../../components/Books/BookForm';
import Modal from '../../components/Common/Modal';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input'; 

const AdminBookManagementPage: React.FC = () => {
  // contextError from useBooks is now the primary error display for API errors
  const { books, addBook, updateBook, deleteBook, isLoading: contextLoading, error: contextError, fetchBooks } = useBooks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Local success/error messages for immediate UI feedback post-action
  const [localFeedback, setLocalFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);


  useEffect(() => {
    fetchBooks(); // Ensure books are loaded on mount
  }, [fetchBooks]);

  useEffect(() => {
    if (localFeedback || contextError) {
      const timer = setTimeout(() => {
        setLocalFeedback(null);
        // contextError is cleared by the context on new actions, so no need to clear here
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [localFeedback, contextError]);

  const handleOpenModalForNew = () => {
    setEditingBook(null);
    setIsModalOpen(true);
    setLocalFeedback(null); // Clear previous feedback
  };

  const handleOpenModalForEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
    setLocalFeedback(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  const handleSubmitBookForm = async (bookData: Omit<Book, 'id' | 'coverImageUrl' | 'borrowedCount'> & { coverImageUrl?: string }) => {
    setLocalFeedback(null);
    let result = null;
    if (editingBook) {
      result = await updateBook(editingBook.id, bookData);
      if (result) setLocalFeedback({type: 'success', message: `Book "${result.title}" updated successfully.`});
    } else {
      result = await addBook(bookData);
      if (result) setLocalFeedback({type: 'success', message: `Book "${result.title}" added successfully.`});
    }
    
    if (result) { // If operation was successful (result is not null)
      handleCloseModal();
      fetchBooks(); // Re-fetch books to ensure list is up-to-date
    } else if (!contextError) { // If there's no contextError, it means the functions handled it or it was a non-API validation
        setLocalFeedback({type: 'error', message: editingBook ? "Failed to update book. Check details." : "Failed to add book. Check details."});
    }
    // If contextError is set, it will be displayed by the global error display logic.
  };

  const handleDeleteBook = async (bookId: string) => {
    setLocalFeedback(null);
    const bookToDelete = books.find(b => b.id === bookId);
    if (bookToDelete && window.confirm(`Are you sure you want to delete "${bookToDelete.title}"? This action cannot be undone.`)) {
      const success = await deleteBook(bookId);
      if (success) {
        setLocalFeedback({type: 'success', message: `Book "${bookToDelete.title}" deleted successfully.`});
        fetchBooks(); // Re-fetch
      } else if (!contextError) {
         setLocalFeedback({type: 'error', message: `Failed to delete book. It might be currently borrowed or another issue occurred.`});
      }
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    if (window.location.hash === '#add-new-book') {
      handleOpenModalForNew();
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);


  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow rounded-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Manage Books</h1>
          <p className="text-gray-600 mt-1">Add, edit, or delete books in the library.</p>
        </div>
        <Button onClick={handleOpenModalForNew} variant="primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Book
        </Button>
      </div>

      {contextError && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{contextError}</div>}
      {localFeedback && (
        <div className={`p-3 rounded-md border ${localFeedback.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
          {localFeedback.message}
        </div>
      )}


      <div className="bg-white p-4 shadow rounded-lg">
        <Input
          id="searchAdminBooks"
          placeholder="Search books by title, author, or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-0"
        />
      </div>

      {contextLoading && books.length === 0 && <div className="text-center py-10 text-gray-600">Loading books...</div>}
      
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            // Backend should provide borrowedCount or availableCopies.
            const borrowedCount = book.borrowedCount || 0; 
            const available = book.totalCopies - borrowedCount;

            return (
              <div key={book.id} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
                   <img 
                      src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/400/600`} 
                      alt={`Cover of ${book.title}`} 
                      className="w-full h-56 object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => ((e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale')}
                   />
                  <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800 truncate" title={book.title}>{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <p className="text-xs text-gray-500 mb-2 bg-gray-100 px-2 py-0.5 rounded-full self-start">{book.genre}</p>
                      <p className="text-sm text-gray-700">Total Copies: {book.totalCopies}</p>
                      <p className={`text-sm ${available > 0 ? 'text-green-600' : 'text-orange-600'}`}>Available: {available}</p>
                      <p className="text-sm text-red-600">Borrowed: {borrowedCount}</p>
                      <div className="mt-auto pt-3 flex space-x-2">
                          <Button onClick={() => handleOpenModalForEdit(book)} variant="secondary" size="sm" className="flex-1" disabled={contextLoading}>Edit</Button>
                          <Button onClick={() => handleDeleteBook(book.id)} variant="danger" size="sm" className="flex-1" disabled={contextLoading}>Delete</Button>
                      </div>
                  </div>
              </div>
            );
          })}
        </div>
      ) : (
        !contextLoading && <div className="text-center py-10 text-gray-500">No books found. {searchTerm && "Try a different search term."}</div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBook ? 'Edit Book' : 'Add New Book'}>
        <BookForm
          onSubmit={handleSubmitBookForm}
          initialData={editingBook}
          onCancel={handleCloseModal}
          submitButtonText={editingBook ? 'Update Book' : 'Add Book'}
          isLoading={contextLoading} // Pass loading state to disable form during API calls
        />
      </Modal>
    </div>
  );
};

export default AdminBookManagementPage;
