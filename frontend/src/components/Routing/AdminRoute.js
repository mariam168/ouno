import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
    const { isAuthenticated, currentUser, loadingAuth } = useAuth();
    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-black">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }
    if (isAuthenticated && currentUser?.role === 'admin') {
        return <Outlet />; 
    }
    return <Navigate to="/" replace />;
};

export default AdminRoute;