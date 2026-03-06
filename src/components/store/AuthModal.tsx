import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const { login, signup, verifyOtp, resendOtp } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [isLoading, setIsLoading] = useState(false);

    // OTP State
    const [showOtp, setShowOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    // Login State
    const [loginPhone, setLoginPhone] = useState('');

    // Signup State
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPhone, setSignupPhone] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loginPhone.length !== 10) {
            toast.error("Please enter a valid 10-digit number");
            return;
        }
        setIsLoading(true);
        const success = await login(loginPhone);
        if (success) {
            // Toast is handled in context
            onClose();
        }
        setIsLoading(false);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPhone.length !== 10) {
            toast.error("Please enter a valid 10-digit number");
            return;
        }
        if (!signupName.trim()) {
            toast.error("Name is required");
            return;
        }
        setIsLoading(true);
        const result = await signup(signupName, signupPhone, signupEmail);
        if (result.success) {
            if (result.requireOtp && result.userId) {
                setPendingUserId(result.userId);
                setShowOtp(true);
            } else {
                onClose();
            }
        }
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingUserId || otpCode.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setIsLoading(true);
        const success = await verifyOtp(pendingUserId, otpCode);
        if (success) {
            setShowOtp(false);
            setOtpCode('');
            setPendingUserId(null);
            onClose();
        }
        setIsLoading(false);
    };

    const handleResendOtp = async () => {
        if (!pendingUserId) return;
        setIsLoading(true);
        await resendOtp(pendingUserId);
        setIsLoading(false);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        const re = /^[0-9\b]+$/;
        if (e.target.value === '' || re.test(e.target.value)) {
            if (e.target.value.length <= 10) {
                setter(e.target.value);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account (Updated)'}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loginPhone">Mobile Number</Label>
                                <Input
                                    id="loginPhone"
                                    placeholder="9876543210"
                                    value={loginPhone}
                                    onChange={(e) => handlePhoneChange(e, setLoginPhone)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full text-white" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Login with OTP'}
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => window.location.href = '/api/auth/google'}
                            >
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Continue with Google
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup">
                        {showOtp ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-medium">Verify your phone</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        We've sent a 6-digit verification code via WhatsApp to {signupPhone}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="otpCode">Verification Code</Label>
                                    <Input
                                        id="otpCode"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        disabled={isLoading}
                                        className="text-center text-lg tracking-widest"
                                    />
                                </div>
                                <Button type="submit" className="w-full text-white" disabled={isLoading || otpCode.length !== 6}>
                                    {isLoading ? 'Verifying...' : 'Verify & Setup Account'}
                                </Button>
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Didn't receive the code? Resend
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtp(false)}
                                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Change phone number
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signupName">Full Name</Label>
                                    <Input
                                        id="signupName"
                                        placeholder="John Doe"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signupEmail">Email</Label>
                                    <Input
                                        id="signupEmail"
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signupPhone">Mobile Number (WhatsApp)</Label>
                                    <Input
                                        id="signupPhone"
                                        placeholder="9876543210"
                                        value={signupPhone}
                                        onChange={(e) => handlePhoneChange(e, setSignupPhone)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full text-white" disabled={isLoading}>
                                    {isLoading ? 'Sending OTP...' : 'Continue'}
                                </Button>

                                <div className="relative my-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.location.href = '/api/auth/google'}
                                >
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Continue with Google
                                </Button>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
