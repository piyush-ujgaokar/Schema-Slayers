import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../application/context/AuthContext';
import { Box, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Decorative Warm Accent Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-brand-border/40 blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-border/30 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full bg-brand-card border border-brand-border/60 p-8 rounded-3xl shadow-xl shadow-brand-text/5 relative z-10 animate-scale-in">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/10 mb-4 transition duration-300 hover:rotate-6">
            <Box size={28} className="text-brand-bg" />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-text tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Get Started
          </h2>
          <p className="text-brand-muted text-sm mt-2.5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Create an account to start visual coding
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm flex items-center gap-2 animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-1.5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-brand-text">Full Name</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-brand-muted transition duration-200" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/40 border border-brand-border hover:border-brand-accent/50 focus:border-brand-primary focus:bg-brand-card rounded-2xl text-sm text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-accent/10 transition duration-300"
                placeholder="Alex Mercer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-brand-text">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-4 text-brand-muted transition duration-200" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/40 border border-brand-border hover:border-brand-accent/50 focus:border-brand-primary focus:bg-brand-card rounded-2xl text-sm text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-accent/10 transition duration-300"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-brand-text">Password</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-brand-muted transition duration-200" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-brand-bg/40 border border-brand-border hover:border-brand-accent/50 focus:border-brand-primary focus:bg-brand-card rounded-2xl text-sm text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-accent/10 transition duration-300"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-bg text-sm font-bold rounded-2xl shadow-lg shadow-brand-primary/10 transition duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Create Account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-brand-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-text hover:underline font-bold transition">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
