import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCamera } from 'react-icons/fi';

const ProfilePage = () => {
    const [userName, setUserName] = useState('Nikhil Chaudhary');
    const [userEmail, setUserEmail] = useState('nikhil@example.com');
    const fileInputRef = useRef(null);
    
    const ProfileCard = ({ title, children }) => (
        <motion.div 
            className="bg-white rounded-xl border border-gray-200 shadow-sm mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-[#19154E]">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
    
    const InputField = ({ label, type, value, setValue, icon, readOnly = false }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    readOnly={readOnly}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${readOnly ? 'bg-gray-100 text-gray-500' : 'border-gray-300 focus:ring-2 focus:ring-[#193A83] focus:border-transparent'}`}
                />
            </div>
        </div>
    );


    return (
        <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-[#19154E]">Profile Settings</h2>
                    <p className="text-gray-500 mt-1">Manage your account details and password.</p>
                </motion.div>

                <div className="flex items-center space-x-6 mt-8">
                    <div className="relative">
                        <img 
                            src="https://i.pravatar.cc/100" 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full" 
                        />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <FiCamera size={16}/>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{userName}</h3>
                        <p className="text-gray-500">{userEmail}</p>
                    </div>
                </div>

                <ProfileCard title="Personal Information">
                    <form className="space-y-6">
                        <InputField 
                            label="Username" 
                            type="text" 
                            value={userName} 
                            setValue={setUserName}
                            icon={<FiUser className="text-gray-400" />}
                        />
                         <InputField 
                            label="Email Address" 
                            type="email" 
                            value={userEmail} 
                            setValue={setUserEmail}
                            icon={<FiMail className="text-gray-400" />}
                            readOnly={true}
                        />
                        <div className="flex justify-end">
                            <motion.button
                                className="px-5 py-2.5 rounded-lg shadow-md font-semibold bg-black text-white"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </ProfileCard>

                 <ProfileCard title="Update Password">
                    <form className="space-y-6">
                        <InputField 
                            label="Current Password" 
                            type="password"
                            icon={<FiLock className="text-gray-400" />}
                        />
                         <InputField 
                            label="New Password" 
                            type="password"
                            icon={<FiLock className="text-gray-400" />}
                        />
                         <InputField 
                            label="Confirm New Password" 
                            type="password"
                            icon={<FiLock className="text-gray-400" />}
                        />
                        <div className="flex justify-end">
                             <motion.button
                                className="px-5 py-2.5 rounded-lg shadow-md font-semibold bg-black text-white"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Update Password
                            </motion.button>
                        </div>
                    </form>
                </ProfileCard>
            </div>
        </div>
    );
};

export default ProfilePage;