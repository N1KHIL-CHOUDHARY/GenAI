import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate(); // 1. Initialize the navigate function
    const onHomePage = location.pathname === '/';

    const navLinks = [
        { name: "Features", path: "features" },
        { name: "How To Use", path: "how-to-use" },
        { name: "Contact", path: "/contact" }
    ];

    // This sub-component correctly handles which link to render
    const NavLink = ({ link, isMobile = false }) => {
        const closeMenu = () => isMobile && setIsOpen(false);

        if (link.path.startsWith('/')) {
            return (
                <RouterLink to={link.path} className="text-gray-600 hover:text-[#193A83] transition-colors" onClick={closeMenu}>
                    {link.name}
                </RouterLink>
            );
        }
        
        return onHomePage ? (
            <ScrollLink
                to={link.path}
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-600 hover:text-[#193A83] transition-colors"
                onClick={closeMenu}
            >
                {link.name}
            </ScrollLink>
        ) : (
            <RouterLink to={`/#${link.path}`} className="text-gray-600 hover:text-[#193A83] transition-colors" onClick={closeMenu}>
                {link.name}
            </RouterLink>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <motion.div whileHover={{ scale: 1.05 }}>
                    <RouterLink to="/" className="text-2xl font-bold text-[#19154E]">Aeztrix AI</RouterLink>
                </motion.div>

                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                        <motion.div key={link.name} whileHover={{ y: -2 }}>
                            <NavLink link={link} />
                        </motion.div>
                    ))}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    {/* 2. Add onClick to navigate to the login page */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="bg-white text-[#19154E] border-[1.5px] border-[#19154E] font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Log In
                    </motion.button>
                    {/* 3. Add onClick to navigate to the signup page */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/signup')}
                        className="bg-[#193A83] text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-opacity-90 transition-all"
                    >
                        Try for Free
                    </motion.button>
                </div>
                
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-[#19154E] focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={!isOpen ? "M4 6h16M4 12h16m-7 6h7" : "M6 18L18 6M6 6l12 12"}></path></svg>
                    </button>
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-200"
                    >
                        <div className="px-6 pt-2 pb-4 flex flex-col space-y-4">
                            {navLinks.map(link => (
                                <NavLink key={link.name} link={link} isMobile={true} />
                            ))}
                            <RouterLink to="/login" className="text-gray-600 hover:text-[#193A83]" onClick={() => setIsOpen(false)}>
                                Log In
                            </RouterLink>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    navigate('/signup');
                                    setIsOpen(false);
                                }}
                                className="w-full bg-[#193A83] text-white px-4 py-3 rounded-lg font-medium shadow-sm hover:bg-opacity-90"
                            >
                                Try for Free
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;