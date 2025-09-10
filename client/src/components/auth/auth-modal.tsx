import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoginForm from './login-form';
import RegisterForm from './register-form';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Reset mode when modal opens with new defaultMode
  useState(() => {
    setMode(defaultMode);
  });

  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setMode('login')} />
        )}
      </DialogContent>
    </Dialog>
  );
}
