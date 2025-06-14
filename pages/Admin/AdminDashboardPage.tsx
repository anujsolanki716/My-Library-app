import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../../contexts/BookContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants';
import { UsersIcon, BookOpenIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface AdminStats {
  totalBookTitles: number;
  totalCopiesInLibrary: number;
  totalBorrowedBooks: number;
  totalAvailableCopies: number;
  totalUsers: number;
  totalAdmins: number;
}

const AdminDashboardPage: React.FC = () => {
  const { books, fetchBooks } = useBooks(); // `books` might be used if stats don't cover everything
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks(); // Ensure books list is fresh, though stats API is primary for numbers
    const fetchAdminStats = async () => {
      if (!token) {
        setIsLoadingStats(false);
        setStatsError("Authentication required to load admin stats.");
        return;
      }
      setIsLoadingStats(true);
      setStatsError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data: AdminStats = await response.json();
          setStats(data);
        } else {
          const errData = await response.json();
          setStatsError(errData.message || "Failed to load admin statistics.");
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        setStatsError("Network error or server unavailable while fetching admin stats.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, [token, fetchBooks]);

  if (isLoadingStats) {
    return <div className="text-center py-10 text-gray-600">Loading admin dashboard data...</div>;
  }
  if (statsError) {
    return <div className="text-center py-10 text-red-600">Error: {statsError}</div>;
  }
  if (!stats) {
    return <div className="text-center py-10 text-gray-600">Admin data not available.</div>;
  }


  return (
    <div className="space-y-8">
      <div className="p-6 bg-white shadow rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Oversee and manage the library's collection and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Book Titles" value={stats.totalBookTitles.toString()} icon={<BookOpenIcon className="h-8 w-8 text-blue-500" />} />
        <StatCard title="Total Copies (All Books)" value={stats.totalCopiesInLibrary.toString()} icon={<BookOpenIcon className="h-8 w-8 text-indigo-500" />} />
        <StatCard title="Currently Borrowed" value={stats.totalBorrowedBooks.toString()} icon={<UsersIcon className="h-8 w-8 text-red-500" />} />
        <StatCard title="Total Available Copies" value={stats.totalAvailableCopies.toString()} icon={<BookOpenIcon className="h-8 w-8 text-green-500" />} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <ActionCard
          title="Manage Books"
          description="Add new books, update details, or remove books from the collection."
          linkTo="/admin/books"
          icon={<BookOpenIcon className="h-10 w-10 text-purple-500" />}
          actionText="Go to Book Management"
        />
        <ActionCard
          title="User Statistics"
          description={`Total Users: ${stats.totalUsers} (Admins: ${stats.totalAdmins}, Regular Users: ${stats.totalUsers - stats.totalAdmins})`}
          linkTo="#" 
          icon={<UsersIcon className="h-10 w-10 text-teal-500" />}
          actionText="View User Details (Soon)"
          disabled
        />
      </div>
       <div className="mt-8 p-6 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
            <Link to="/admin/books#add-new-book" className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Book
            </Link>
             <Link to="/admin/books" className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <BookOpenIcon className="h-5 w-5 mr-2" /> View All Books
            </Link>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-6 shadow rounded-lg">
    <div className="flex items-center space-x-3 mb-2">
      {icon}
      <p className="text-sm text-gray-500">{title}</p>
    </div>
    <p className="text-3xl font-semibold text-gray-800">{value}</p>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
  actionText: string;
  disabled?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, linkTo, icon, actionText, disabled }) => {
   const content = (
    <>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-gray-100 rounded-full">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-1 text-sm">{description}</p>
        </div>
      </div>
      <span className={`inline-block mt-4 text-sm font-medium ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 group-hover:underline'}`}>
        {actionText} &rarr;
      </span>
    </>
  );
  
  return disabled ? (
     <div className="bg-white p-6 shadow rounded-lg flex flex-col group opacity-70">
      {content}
    </div>
  ) : (
    <Link to={linkTo} className="bg-white p-6 shadow rounded-lg flex flex-col hover:shadow-md transition-shadow group">
       {content}
    </Link>
  );
};

export default AdminDashboardPage;
