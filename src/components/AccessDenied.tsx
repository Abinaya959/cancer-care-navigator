import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
    </div>
  );
};

export default AccessDenied;
