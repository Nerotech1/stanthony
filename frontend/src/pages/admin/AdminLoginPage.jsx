import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cross, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const AdminLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isLogin && !form.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.email, form.password, form.name);
        toast.success('Account created successfully!');
      }
      navigate('/admin');
    } catch (error) {
      const message = error.response?.data?.detail || 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-warm-100 flex items-center justify-center p-4" data-testid="admin-login-page">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Cross className="h-12 w-12 text-church-red" />
          </div>
          <CardTitle className="font-cinzel text-2xl text-church-red">
            {isLogin ? 'Admin Login' : 'Create Admin Account'}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-dm-sans mt-2">
            St. Anthony Catholic Church CMS
          </p>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-dm-sans">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="border-stone-warm-200 focus:border-church-gold"
                  data-testid="admin-name-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-dm-sans">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="Enter your email"
                className="border-stone-warm-200 focus:border-church-gold"
                data-testid="admin-email-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-dm-sans">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="Enter your password"
                  className="border-stone-warm-200 focus:border-church-gold pr-10"
                  data-testid="admin-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-stone-warm-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-church-red hover:bg-church-red-dark font-cinzel uppercase tracking-wider py-5"
              data-testid="admin-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-church-red hover:text-church-red-dark font-dm-sans underline"
              data-testid="admin-toggle-form-btn"
            >
              {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
