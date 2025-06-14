import React, { useState, useMemo } from 'react';
import { useBooks } from '../../contexts/BookContext';
import BookCard from '../../components/Books/BookCard';
import Input from '../../components/Common/Input';
import { Book } from '../../types';

const BookCatalogPage: React.FC = () => {
  const { books, isLoading, error } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const genres = useMemo(() => {
    const allGenres = new Set(books.map(book => book.genre));
    return ['', ...Array.from(allGenres).sort()]; // Add "All Genres" option
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearchTerm = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
      return matchesSearchTerm && matchesGenre;
    });
  }, [books, searchTerm, selectedGenre]);

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading books...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">Error loading books: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Book Catalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            id="searchBooks"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-0" // Remove default bottom margin from Input component
          />
          <div>
            <label htmlFor="genreFilter" className="block text-sm font-medium text-gray-700 sr-only">Filter by genre</label>
            <select
              id="genreFilter"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {genres.map(genre => (
                <option key={genre || 'all'} value={genre}>
                  {genre || 'All Genres'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">No books found matching your criteria.</p>
          { (searchTerm || selectedGenre) && <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters.</p> }
        </div>
      )}
    </div>
  );
};

export default BookCatalogPage;
