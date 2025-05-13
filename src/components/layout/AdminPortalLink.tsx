
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AdminPortalLink() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        to="/admin" 
        className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-full opacity-70 hover:opacity-100 transition-opacity"
      >
        <ShieldCheck className="h-4 w-4" />
        <span>Admin Portal</span>
      </Link>
    </div>
  );
}
