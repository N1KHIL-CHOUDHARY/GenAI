import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiUploadCloud, FiX, FiFile, FiCheckCircle, FiSend, FiCopy } from 'react-icons/fi';
import { useFileUpload } from '../hooks/useFileUpload';

const FileUploadModal = ({ closeModal }) => {
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();
    const { uploading, progress, error, uploadFile, resetUpload } = useFileUpload();

    const onDrop = useCallback(acceptedFiles => {
        setFiles([acceptedFiles[0]]); // Only allow one file for this flow
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'application/pdf': ['.pdf']}, multiple: false });

    const handleUpload = async () => {
        if (files.length === 0) return;
        
        const result = await uploadFile(files[0]);
        
        if (result.success) {
            setTimeout(() => {
                closeModal();
                navigate('/dashboard/documents');
            }, 500);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={e => e.stopPropagation()}
            >
                {uploading ? (
                    <div className="text-center p-12">
                        <h3 className="text-xl font-semibold text-[#19154E] mb-4">Analyzing Document...</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5"><motion.div className="bg-black h-2.5 rounded-full" animate={{ width: `${progress}%` }}/></div>
                        <p className="mt-3 text-lg font-medium text-black">{progress}%</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-200"><h3 className="text-xl font-bold text-[#19154E]">Upload File</h3></div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300'}`}>
                                <input {...getInputProps()} />
                                <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="font-semibold text-gray-700">Drag & drop or click to upload</p>
                                <p className="text-sm text-gray-500 mt-1">PDF only</p>
                            </div>
                            {files.length > 0 && <div className=" text-black mt-4 text-sm flex items-center gap-2"><FiFile /> {files[0].name}</div>}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <motion.button
                                onClick={handleUpload}
                                disabled={files.length === 0 || uploading}
                                className="bg-black text-white font-semibold px-5 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                whileHover={{ scale: files.length > 0 && !uploading ? 1.05 : 1 }} 
                                whileTap={{ scale: files.length > 0 && !uploading ? 0.95 : 1 }}
                            >
                                {uploading ? 'Uploading...' : 'Upload & Analyze'}
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFileActive, setIsFileActive] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: 'I have analyzed your document. Ask me anything about its content.' }
    ]);

    const handleNewMessage = (e) => {
        e.preventDefault();
        const userInput = e.target.elements.message.value;
        if (!userInput.trim()) return;

        const newMessages = [...chatMessages, { sender: 'user', text: userInput }];
        setChatMessages(newMessages);
        e.target.reset();

        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: 'This is a RAG-generated answer based on the document content.' }]);
        }, 1000);
    };

    return (
        <>
            <div className="w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-[#19154E]">Dashboard</h2>
                        <motion.button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md font-semibold bg-black text-white"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                            <FiUpload /> Upload File
                        </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isFileActive ? 'analysis' : 'getting-started'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {isFileActive ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Summary Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="text-xl font-semibold text-[#19154E]">Summary</h3>
                                            <button className="text-gray-400 hover:text-black"><FiCopy /></button>
                                        </div>
                                        <div className="p-5 text-gray-600 text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
                                            <p>This is a mock summary generated by the AI after analyzing your document. It highlights the main arguments, identifies key entities, and provides a concise overview of the content to help you quickly grasp the core information without reading the entire file.</p>
                                        </div>
                                    </div>

                                    {/* RAG Chat Section */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                                        <div className="p-5 border-b border-gray-200"><h3 className="text-xl font-semibold text-[#19154E]">Chat with Document</h3></div>
                                        <div className="p-5 flex-grow overflow-y-auto h-[55vh]">
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
                                                <input name="message" type="text" placeholder="Ask a question about your document..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black" />
                                                <button type="submit" className="p-3 bg-black text-white rounded-lg"><FiSend /></button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                                    <h3 className="text-xl font-semibold text-[#19154E]">Upload a file to start analyzing</h3>
                                    <p className="text-gray-500 mt-2 mb-6">You don't have an active document. Upload a PDF to begin.</p>
                                    <div className="aspect-video max-w-2xl mx-auto bg-gray-200 rounded-xl shadow-inner overflow-hidden">
                                        <iframe className="w-full h-full" src="" title="Tutorial video" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <AnimatePresence>
                {isModalOpen && <FileUploadModal closeModal={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default Dashboard;