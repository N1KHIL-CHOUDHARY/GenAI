// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import DashboardLayout from './DashboardLayout';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Only render the layout and its children if authenticated
    return isAuthenticated ? (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ) : null;
};

export default ProtectedRoute;