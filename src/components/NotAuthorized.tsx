import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function NotAuthorized() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Not Authorized</h1>
        <p className="text-gray-500 mb-8">
          You don&apos;t have permission to view this page. If you believe this is an error, please
          contact your administrator.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/login"
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
