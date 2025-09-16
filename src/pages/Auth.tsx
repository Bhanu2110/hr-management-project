import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2 } from 'lucide-react';

const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');

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
    
    const { error } = await signIn(loginUserId, loginPassword, loginType);
    
    if (!error) {
      // Redirect will happen automatically via AuthProvider
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
          <div className="p-3 bg-[#E15B55] rounded-xl shadow-lg">
        <Building2 className="h-8 w-8 text-white" />
        </div>


          </div>
          <h1 className="text-2xl font-bold text-[#E15B55]">
            Syncall Technology Solutions
</h1>


          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
          
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-type">Login As</Label>
                <Select value={loginType} onValueChange={(value: 'employee' | 'admin') => setLoginType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select login type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-userid">
                  {loginType === 'employee' ? 'PAN Number' : 'Email Address'}
                </Label>
                <Input
                  id="login-userid"
                  type="text"
                  placeholder={loginType === 'employee' ? 'Enter your PAN number' : 'Enter your email address'}
                  value={loginUserId}
                  onChange={(e) => setLoginUserId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {loginType === 'employee' 
                    ? 'Employees only need their PAN number to login' 
                    : 'Admins must provide both email and password'
                  }
                </p>
              </div>
              {loginType === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required={loginType === 'admin'}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#E15B55] hover:bg-[#cc4e49] text-white" 
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

      </div>
    </div>
  );
};

export default Auth;