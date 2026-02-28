import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ROLE_REDIRECT: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor',
  health_officer: '/health-worker',
  health_worker: '/health-worker',
  public_user: '/public',
};

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    const redirect = ROLE_REDIRECT[user.role] || '/dashboard';
    return <Navigate to={redirect} />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Invalid credentials. Try a demo account below.');
    }
  };

  const demoAccounts = [
    { email: 'admin@ccipx.com', role: 'Admin', color: 'bg-primary/10 text-primary' },
    { email: 'doctor@ccipx.com', role: 'Doctor', color: 'bg-accent/10 text-accent' },
    { email: 'officer@ccipx.com', role: 'Health Worker', color: 'bg-warning/10 text-warning' },
    { email: 'public@ccipx.com', role: 'Public User', color: 'bg-muted text-muted-foreground' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CCIP-X</h1>
          <p className="text-sm text-muted-foreground mt-1">Tamil Nadu Cancer System Fragility Dashboard</p>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered Diagnostic Delay & Infrastructure Risk Intelligence</p>
        </div>

        <div className="bg-card rounded-xl clinical-shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="mt-1" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              <Shield className="w-4 h-4 mr-2" /> Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick Demo Access</p>
            <div className="space-y-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('demo123'); }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${acc.color}`}>{acc.role}</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
