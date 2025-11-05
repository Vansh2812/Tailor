// frontend/src/components/LoginForm.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE;

  // --- Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      setLoading(false);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        onLogin();
      } else {
        setError(response.data.message || 'Invalid email or password');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Server error, please try again');
    }
  };

  // --- Forgot password: Step 1 ---
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setResetLoading(true);

    if (!resetEmail) {
      setError('Please enter your email address');
      setResetLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email: resetEmail });
      setResetMessage('Reset code sent to your email.');
      setResetStep(2);
      setResetLoading(false);
    } catch (err) {
      setResetLoading(false);
      setError(err.response?.data?.message || 'Failed to send reset code');
    }
  };

  // --- Forgot password: Step 2 ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setResetLoading(true);

    if (!resetCode || !newPassword) {
      setError('Please enter both reset code and new password');
      setResetLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/reset-password`, {
        email: resetEmail,
        resetCode,
        newPassword,
      });
      setResetLoading(false);

      if (response.data.success) {
        setResetMessage('Password reset successfully. You can now login.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetStep(1);
          setResetEmail('');
          setResetCode('');
          setNewPassword('');
          setResetMessage('');
          setError('');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setResetLoading(false);
      setError(err.response?.data?.message || 'Server error, please try again');
    }
  };

  // --- Forgot password UI ---
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">Reset Password</CardTitle>
            <CardDescription>
              {resetStep === 1
                ? 'Enter your email to receive a reset code'
                : 'Enter the code and your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={resetStep === 1 ? handleSendResetCode : handleResetPassword}
              className="space-y-4"
            >
              {resetStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                  />
                </div>
              )}

              {resetStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resetCode">Reset Code</Label>
                    <Input
                      id="resetCode"
                      type="text"
                      placeholder="Enter code from email"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      disabled={resetLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={resetLoading}
                    />
                  </div>
                </>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {resetMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{resetMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={resetLoading}>
                  {resetStep === 1 ? (resetLoading ? 'Sending...' : 'Send Reset Code') : (resetLoading ? 'Resetting...' : 'Reset Password')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetStep(1);
                    setResetEmail('');
                    setResetCode('');
                    setNewPassword('');
                    setResetMessage('');
                    setError('');
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Login UI ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-700">Tailor Management</CardTitle>
          <CardDescription>Admin Login Portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tailorshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
