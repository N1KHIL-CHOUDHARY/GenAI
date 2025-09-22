import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const DashboardHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Documents", path: "/dashboard/documents" }, // Assuming this is your files page
        { name: "Contact Us", path: "/contact" },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    // This effect handles closing the menu when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <header className="w-full bg-white border-b border-gray-200">
            <div className="w-full px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="text-xl font-bold text-[#19154E]">Aeztrix AI</Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `text-gray-600 hover:text-gray-900 transition-colors ${isActive ? 'font-semibold text-gray-900' : ''}`
                                }
                                end={link.path === '/dashboard'}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#193A83]"
                    >
                        {user ? user.name.charAt(0).toUpperCase() : 'U'}
                    </button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 origin-top-right"
                            >
                                <div className="py-1">
                                    <Link
                                        to="/dashboard/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <FiUser />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <FiLogOut />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;