import { Construction, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function PartnerPage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">MFD Dashboard</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full">
              Partner
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6">
            <Construction className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Partner View Coming Soon</h1>
          <p className="text-gray-500 max-w-md mb-2">
            The partner-facing dashboard is under development.
          </p>
          <p className="text-sm text-gray-400 max-w-md">
            The partner-visible fields are being finalized. Once ready, partners will see their own
            investor data, portfolio metrics, and activity here.
          </p>
          {profile && (
            <p className="mt-8 text-xs text-gray-400">
              Signed in as {profile.id.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
