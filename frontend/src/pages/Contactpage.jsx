import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { contactService } from '../services/api';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const inputVariants = {
        focus: { 
            borderColor: "#193A83", 
            boxShadow: "0 0 0 2px rgba(25, 58, 131, 0.2)" 
        },
        blur: { 
            borderColor: "#E2E8F0" 
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const result = await contactService.sendMessage(formData);
            if (result.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white w-screen min-h-screen overflow-x-hidden font-sans">
            <div className="container mx-auto px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-sm font-semibold text-[#193A83] mb-1">QUESTIONS?</p>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-[#19154E]">Contact Us</h1>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-16 mt-12">
                        <motion.form 
                            className="md:col-span-2 space-y-6"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            onSubmit={handleSubmit}
                        >
                            {submitStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-lg ${
                                        submitStatus === 'success' 
                                            ? 'bg-green-100 text-green-800 border border-green-300' 
                                            : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}
                                >
                                    {submitStatus === 'success' 
                                        ? 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.' 
                                        : 'Sorry, there was an error sending your message. Please try again or contact us directly at aeztrix5@gmail.com'
                                    }
                                </motion.div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-6 text-[#19154E]">
                                <motion.input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Name" 
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-[#F0F5FA] rounded-lg border-2 border-transparent focus:outline-none disabled:opacity-50"
                                    variants={inputVariants}
                                    whileFocus="focus"
                                    initial="blur"
                                />
                                <motion.input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email" 
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-[#F0F5FA] rounded-lg border-2 border-transparent focus:outline-none disabled:opacity-50"
                                    variants={inputVariants}
                                    whileFocus="focus"
                                    initial="blur"
                                />
                            </div>
                            <motion.textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Message" 
                                rows="8" 
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 bg-[#F0F5FA] text-[#19154E] rounded-lg border-2 border-transparent focus:outline-none disabled:opacity-50"
                                variants={inputVariants}
                                whileFocus="focus"
                                initial="blur"
                            ></motion.textarea>
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#193A83] text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </motion.button>
                        </motion.form>

                        <motion.div 
                            className="text-gray-600"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-[#19154E] mb-3">Get in touch</h2>
                            <p className="mb-6">We're always here to help. Contact us if you have any questions, suggestions, or concerns.</p>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#193A83] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#19154E]">Email</p>
                                        <a href="mailto:aeztrix5@gmail.com" className="text-[#193A83] hover:underline">
                                            aeztrix5@gmail.com
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#193A83] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#19154E]">Response Time</p>
                                        <p className="text-gray-600">Within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;