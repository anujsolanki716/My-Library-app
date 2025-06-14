import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { APP_NAME } from '../../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const { login, error: authError, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) { // Check for email
        setFormError("Email and password are required.");
        return;
    }
    const success = await login(email, password); // Pass email to login function
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-700">{APP_NAME}</h1>
        <p className="mt-2 text-lg text-gray-600">Welcome back! Please login.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email" // Changed from username to email
          label="Email" // Changed from Username to Email
          type="email" // Changed from text to email
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., admin@example.com or alice@example.com"
          required
          disabled={isLoading}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
        {(authError || formError) && <p className="text-sm text-red-600 text-center">{authError || formError}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Register here
        </Link>
      </p>
       {/* <p className="text-xs text-center text-gray-500 mt-2">
        Hint: Try 'admin@example.com'/'adminpassword' or 'alice@example.com'/'alicepassword' (after registration).
      </p> */}
    </div>
  );
};

export default LoginPage;