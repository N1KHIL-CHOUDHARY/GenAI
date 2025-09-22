// src/pages/SummaryPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiCopy } from 'react-icons/fi';

const SummaryPage = () => {
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: 'This document is about Linux Process Management. Ask me anything.' }
    ]);

    const handleNewMessage = (e) => {
        e.preventDefault();
        const userInput = e.target.elements.message.value;
        if (!userInput.trim()) return;

        setChatMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        e.target.reset();

        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: 'This is a RAG-generated answer based on the document content.' }]);
        }, 1000);
    };

    return (
        <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Summary Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[#19154E]">Summary</h3>
                            <button className="text-gray-400 hover:text-black"><FiCopy /></button>
                        </div>
                        <div className="p-5 text-gray-600 text-sm leading-relaxed max-h-[65vh] overflow-y-auto">
                            <p>This document provides a comprehensive overview of the Linux Process API, focusing on the core functionalities of fork(), wait(), and exec(). It details how new processes are created using fork() and how a parent process can wait for its child to terminate using wait(). The exec() family of functions is explained as the mechanism for replacing a process's current memory image with a new program.</p>
                        </div>
                    </div>

                    {/* RAG Chat Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <div className="p-5 border-b border-gray-200"><h3 className="text-xl font-semibold text-[#19154E]">Chat with Document</h3></div>
                        <div className="p-5 flex-grow overflow-y-auto h-[60vh]">
                            <div className="space-y-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                        <p className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-black text-white'}`}>{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <form onSubmit={handleNewMessage} className="flex items-center gap-2">
                                <input name="message" type="text" placeholder="Ask a question..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" />
                                <button type="submit" className="p-3 bg-black text-white rounded-lg"><FiSend /></button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SummaryPage;