
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';
import { BookOpenIcon, BookmarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Example icons

const UserDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { books, borrowedBooks, getAvailableCopies } = useBooks();

  const borrowedBooksCount = borrowedBooks.length;
  const totalAvailableBooks = books.reduce((sum, book) => sum + getAvailableCopies(book), 0);

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white shadow rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800">Welcome, {currentUser?.username}!</h1>
        <p className="text-gray-600 mt-1">Manage your books and explore our collection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Book Catalog"
          description={`Explore ${books.length} unique titles. ${totalAvailableBooks} copies currently available.`}
          linkTo="/books"
          icon={<MagnifyingGlassIcon className="h-8 w-8 text-blue-500" />}
          actionText="Browse Books"
        />
        <DashboardCard
          title="My Borrowed Books"
          description={`You currently have ${borrowedBooksCount} book${borrowedBooksCount === 1 ? '' : 's'} borrowed.`}
          linkTo="/my-books"
          icon={<BookmarkIcon className="h-8 w-8 text-green-500" />}
          actionText="View My Books"
        />
         <DashboardCard
          title="Library Stats"
          description={`Discover a collection of ${books.length} unique book titles. Our library aims to grow!`}
          icon={<BookOpenIcon className="h-8 w-8 text-indigo-500" />}
          actionText="Learn More (Coming Soon)"
          linkTo="#"
          disabled
        />
      </div>
       <div className="mt-8 p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Tips</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Use the "Book Catalog" to find new books to read.</li>
            <li>Check "My Borrowed Books" to see what you're currently reading and when to return them.</li>
            <li>Remember to return books on time so others can enjoy them!</li>
        </ul>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
  actionText: string;
  disabled?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, linkTo, icon, actionText, disabled }) => {
  const content = (
    <>
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      </div>
      <p className="text-gray-600 text-sm mb-4 h-10">{description}</p>
      <span className={`inline-block mt-auto text-sm font-medium ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 group-hover:underline'}`}>
        {actionText} &rarr;
      </span>
    </>
  );
  
  return disabled ? (
     <div className="bg-white p-6 shadow rounded-lg flex flex-col group opacity-60">
      {content}
    </div>
  ) : (
    <Link to={linkTo} className="bg-white p-6 shadow rounded-lg flex flex-col hover:shadow-md transition-shadow group">
       {content}
    </Link>
  );
};

export default UserDashboardPage;
