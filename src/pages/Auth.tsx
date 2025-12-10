import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { themeColor } = useTheme();

  // Login form state
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginUserId, loginPassword);

    if (!error) {
      // Redirect will happen automatically via AuthProvider
    }

    setIsLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!changePasswordEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!currentPassword.trim()) {
      toast.error('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify credentials by signing in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: changePasswordEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      // Update password in Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error('Failed to update password: ' + updateError.message);
        setIsChangingPassword(false);
        return;
      }

      // Also update password_hash and password_plain in employees table
      const { error: employeeUpdateError } = await supabase
        .from('employees')
        .update({
          password_hash: newPassword,
          password_plain: newPassword
        })
        .eq('email', changePasswordEmail);

      if (employeeUpdateError) {
        console.error('Failed to update employee password hash:', employeeUpdateError);
      }

      // Sign out after password change
      await supabase.auth.signOut();

      toast.success('Password changed successfully! Please sign in with your new password.');

      // Reset form
      setShowChangePassword(false);
      setChangePasswordEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoginUserId(changePasswordEmail);
      setLoginPassword('');

    } catch (error) {
      console.error('Password change error:', error);
      toast.error('An error occurred while changing password');
    }

    setIsChangingPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: themeColor ? `${themeColor}0D` : '' }}>
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: themeColor }}>
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: themeColor }}>
            Syncall Technology Solutions
          </h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {/* Login Form */}
        {!showChangePassword ? (
          <Card>
            <CardHeader>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-userid">
                    Email Address
                  </Label>
                  <Input
                    id="login-userid"
                    type="email"
                    placeholder="Enter your email address"
                    value={loginUserId}
                    onChange={(e) => setLoginUserId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your registered email address to login.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(true)}
                      className="text-sm hover:underline"
                      style={{ color: themeColor }}
                    >
                      Change Password?
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: themeColor, borderColor: themeColor }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          /* Change Password Form */
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>
                Enter your current password and set a new password
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="change-email">Email Address</Label>
                  <Input
                    id="change-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={changePasswordEmail}
                    onChange={(e) => setChangePasswordEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: themeColor, borderColor: themeColor }}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setChangePasswordEmail('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Back to Sign In
                </button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
