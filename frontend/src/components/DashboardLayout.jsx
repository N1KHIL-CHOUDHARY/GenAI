// src/components/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 w-screen">
            <DashboardHeader />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;