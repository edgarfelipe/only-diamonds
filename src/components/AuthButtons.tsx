import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuthButtons() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">{isSignIn ? 'Sign In' : 'Create Account'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              {isSignIn ? 'Sign In' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200">
      <div className="max-w-md mx-auto space-y-3">
        <button
          onClick={() => {
            setIsSignIn(true);
            setShowForm(true);
          }}
          className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setIsSignIn(false);
            setShowForm(true);
          }}
          className="w-full py-3 px-4 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}