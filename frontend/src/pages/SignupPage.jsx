import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { signup, loginWithGoogle, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, loading, navigate]);

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        setError('');
        const result = await loginWithGoogle();
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const result = await signup(name, email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const OAuthButton = ({ icon, text, onClick, disabled }) => (
        <button 
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
            {icon}
            <span className="font-medium text-gray-900">{text}</span>
        </button>
    );

    return (
        <div className="min-h-screen w-screen overlow-x-hidden bg-gray-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="hidden md:flex flex-col items-center justify-center bg-[#193A83] p-12 text-white text-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <h1 className="text-4xl font-bold mb-4">Aeztrix AI</h1>
                        <p className="text-lg text-indigo-100">Unlock insights from your documents with the power of AI.</p>
                    </motion.div>
                </div>

                <div className="p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-[#19154E] mb-4">Create Your Account</h2>
                    <p className="text-gray-600 mb-8">Get started with the best AI document assistant.</p>

                    <div className="space-y-4 mb-8">
                        <OAuthButton 
                            icon={<FcGoogle size={22} />} 
                            text="Sign up with Google" 
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center my-8">
                        <hr className="flex-grow border-gray-300" />
                        <span className="mx-4 text-gray-500 font-medium">OR</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193A83] disabled:opacity-50 text-gray-900 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193A83] disabled:opacity-50 text-gray-900 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193A83] disabled:opacity-50 text-gray-900 bg-white"
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className="w-full bg-[#193A83] text-white font-bold py-3 rounded-lg shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </form>
                    
                    <p className="text-center text-gray-600 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#193A83] font-semibold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;