import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, User, Phone, Lock } from 'lucide-react';
import { useLanguageContext } from '@/components/language-provider';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, registerLoading, registerError } = useAuth();
  const { t } = useLanguageContext();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validEmailRequired');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0">
      <CardHeader className="text-center space-y-1 pb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <User className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription className="text-gray-600">
          Join us to manage your bookings and get exclusive cruise deals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {registerError && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertDescription>
                {registerError?.message || 'Registration failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="John"
                  className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
                  data-testid="input-first-name"
                />
              </div>
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="Doe"
                  className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : ''}`}
                  data-testid="input-last-name"
                />
              </div>
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                placeholder="john@example.com"
                className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                data-testid="input-email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-gray-400">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="+1 (555) 123-4567"
                className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                data-testid="input-phone"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium">
              Password *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                required
                placeholder="At least 6 characters"
                className={`pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={registerLoading}
            data-testid="button-register"
          >
            {registerLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
              data-testid="link-login"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
