import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { themeColor } = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    useEffect(() => {
        // Check if we have a valid session from the reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setIsValidToken(true);
            } else {
                toast.error('Invalid or expired reset link');
                setTimeout(() => navigate('/auth'), 2000);
            }
            setIsCheckingToken(false);
        };

        checkSession();
    }, [navigate]);

    // Password validation function
    const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (password.length < 8) {
            errors.push('At least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Uppercase letter (A–Z)');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Lowercase letter (a–z)');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Number (0–9)');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Special character (@, #, $, %, &, !, etc.)');
        }
        
        return { isValid: errors.length === 0, errors };
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            toast.error('Password must contain: ' + validation.errors.join(', '));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsResetting(true);

        try {
            // Get the current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error('Session expired. Please request a new reset link.');
                navigate('/auth');
                return;
            }

            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                toast.error('Failed to reset password: ' + updateError.message);
                setIsResetting(false);
                return;
            }

            // Also update password_hash and password_plain in employees table
            const { error: employeeUpdateError } = await supabase
                .from('employees')
                .update({
                    password_hash: newPassword,
                    password_plain: newPassword
                })
                .eq('email', session.user.email);

            if (employeeUpdateError) {
                console.error('Failed to update employee password:', employeeUpdateError);
            }

            // Sign out after password reset
            await supabase.auth.signOut();

            toast.success('Password reset successfully! Please sign in with your new password.');

            // Redirect to login page
            setTimeout(() => {
                navigate('/auth');
            }, 2000);

        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('An error occurred while resetting password');
        }

        setIsResetting(false);
    };

    if (isCheckingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isValidToken) {
        return null;
    }

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
                    <p className="text-muted-foreground">Reset your password</p>
                </div>

                {/* Reset Password Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Create New Password</CardTitle>
                        <CardDescription>
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleResetPassword}>
                        <CardContent className="space-y-4">
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
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p className="font-medium">Password must contain:</p>
                                    <ul className="list-disc pl-4 space-y-0.5">
                                        <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>At least 8 characters</li>
                                        <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>Uppercase letter (A–Z)</li>
                                        <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>Lowercase letter (a–z)</li>
                                        <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>Number (0–9)</li>
                                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-green-600' : ''}>Special character (@, #, $, %, &, !, etc.)</li>
                                    </ul>
                                </div>
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
                                disabled={isResetting}
                            >
                                {isResetting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={() => navigate('/auth')}
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                Back to Sign In
                            </button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
