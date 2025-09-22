import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiCopy } from 'react-icons/fi';
import { documentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SummaryPage = () => {
    const { fileId } = useParams();
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!fileId) return;
            setLoading(true);
            setError('');
            try {
                const result = await documentService.getSummary(fileId);
                if (result.success) {
                    setSummary(result.data.content);
                    setChatMessages([{
                        sender: 'ai',
                        text: `I have analyzed your document. Ask me anything about its content.`
                    }]);
                } else {
                    setError(result.error || 'Failed to load document analysis.');
                }
            } catch (err) {
                setError('A network error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [fileId]);

    const handleNewMessage = async (e) => {
        e.preventDefault();
        const userInput = e.target.elements.message.value;
        if (!userInput.trim() || !user) return;

        const newMessages = [...chatMessages, { sender: 'user', text: userInput }];
        setChatMessages(newMessages);
        e.target.reset();
        setIsChatLoading(true);

        try {
            const result = await documentService.chatWithDocument(user.id, userInput);
            if (result.success) {
                setChatMessages(prev => [...prev, { sender: 'ai', text: result.data.aiResponse }]);
            } else {
                setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I couldn't get a response. ${result.error}` }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, a network error occurred.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[calc(100vh-65px)] p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#193A83] mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing document...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="w-full min-h-[calc(100vh-65px)] p-6 flex items-center justify-center">
                <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-xl font-semibold text-red-700">An Error Occurred</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[#19154E]">Summary</h3>
                            <button className="text-gray-400 hover:text-black"><FiCopy /></button>
                        </div>
                        <div className="p-5 text-gray-600 text-sm leading-relaxed max-h-[65vh] overflow-y-auto">
                            {summary?.summary?.map((point, index) => (
                                <p key={index} className="mb-2">{point}</p>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                        <div className="p-5 border-b border-gray-200"><h3 className="text-xl font-semibold text-[#19154E]">Chat with Document</h3></div>
                        <div className="p-5 flex-grow overflow-y-auto h-[60vh]">
                            <div className="space-y-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                        <p className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-black text-white'}`}>{msg.text}</p>
                                    </div>
                                ))}
                                {isChatLoading && (
                                     <div className="flex justify-start">
                                        <p className="max-w-xs lg:max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">...</p>
                                     </div>
                                )}
                            </div>
                        </div>
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                            <form onSubmit={handleNewMessage} className="flex items-center gap-2">
                                <input name="message" type="text" placeholder="Ask a question..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" disabled={isChatLoading} />
                                <button type="submit" className="p-3 bg-black text-white rounded-lg" disabled={isChatLoading}><FiSend /></button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SummaryPage;