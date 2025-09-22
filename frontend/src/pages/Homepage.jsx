import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Element, scroller } from 'react-scroll';
import { FiChevronDown } from 'react-icons/fi';
import { FaReact } from 'react-icons/fa';
import { SiFastapi, SiGooglecloud, SiTailwindcss, SiFramer,SiPython } from 'react-icons/si';

const HomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.hash) {
            const element = location.hash.substring(1);
            scroller.scrollTo(element, {
                duration: 800,
                delay: 100,
                smooth: 'easeInOutQuart',
                offset: -80
            });
        }
    }, [location]);

    const features = [
        {
            title: "Generate Summaries",
            description: "Aeztrix AI summarizes long documents in seconds, saving you hours per week.",
            image: "/placeholder-summary.png"
        },
        {
            title: "Get Highlighted Citations",
            description: "Aeztrix AI gives you a clickable page number and highlight reference with every answer.",
            image: "/placeholder-citations.png"
        }
    ];

      const faqs = [

        { question: "What file types are supported?", answer: "Our platform currently supports PDF and DOCX file formats. We are actively working on expanding our support for other document types." },

        { question: "How secure is my data?", answer: "We prioritize your data's security. All uploaded documents are encrypted and processed in a secure, isolated environment." },

        { question: "Can I use this for legal documents?", answer: "While our AI provides a powerful analysis, it is not a substitute for professional legal advice. We recommend consulting with a qualified attorney for any legal matters." },

        { question: "What languages do you support?", answer: "Our AI can analyze documents in multiple languages. For a full list of supported languages, please refer to our documentation." }

    ];
    
    // Added a 'color' property to each tech item
    const techStack = [
        { name: 'React', icon: <FaReact size={32} />, color: 'text-blue-500' },
        { name: 'FastAPI', icon: <SiFastapi size={32} />, color: 'text-green-500' },
        { name: 'Google Cloud', icon: <SiGooglecloud size={32} />, color: 'text-red-500' },
        { name: 'Tailwind CSS', icon: <SiTailwindcss size={32} />, color: 'text-cyan-400' },
        { name: 'Framer Motion', icon: <SiFramer size={30} />, color: 'text-purple-500' },
        { name: 'Python', icon: <SiPython size={32} />, color: 'text-yellow-500' },
    ];
    
    const heroVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };
    
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const FAQItem = ({ item }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <motion.div
                layout
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 rounded-2xl cursor-pointer transition-colors duration-300 bg-white"
            >
                <motion.div layout className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-[#19154E]">{item.question}</h3>
                    <motion.div
                        className="text-[#193A83]"
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FiChevronDown size={24} />
                    </motion.div>
                </motion.div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <p className="text-gray-600 leading-relaxed pr-8">{item.answer}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
       <div className="bg-white font-sans text-[#19154E] overflow-x-hidden w-screen">
            <main>
                <section className="container min-h-screen mx-auto px-6 pt-24 pb-16 text-center flex flex-col justify-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={heroVariants}
                        className="flex flex-col items-center"
                    >
                        <motion.h1 variants={heroVariants} className="text-5xl md:text-8xl font-extrabold text-[#19154E] mb-6 leading-tight">
                            The AI Assistant <br /> For Your Documents
                        </motion.h1>
                        <motion.p variants={heroVariants} className="max-w-3xl mx-auto text-lg text-gray-600 mb-8">
                            Use AI to summarize, query, and transcribe your files and meetings in seconds. Generate mind maps, presentations, and content from your files. Get a citation with every response.
                        </motion.p>
                        
                        <motion.div variants={heroVariants} className="w-full max-w-2xl my-8">
                             <div className="relative w-full overflow-hidden">
                                <motion.div
                                    className="flex gap-12"
                                    animate={{ x: ['0%', '-100%'] }}
                                    transition={{ ease: 'linear', duration: 20, repeat: Infinity }}
                                >
                                    {[...techStack, ...techStack].map((tech, index) => (
                                        <div key={index} className={`flex items-center gap-3 flex-shrink-0 ${tech.color}`}>
                                            {tech.icon}
                                            <span className="font-semibold text-lg text-gray-700">{tech.name}</span>
                                        </div>
                                    ))}
                                </motion.div>
                                <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-white to-transparent" />
                                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-white to-transparent" />
                            </div>
                        </motion.div>
                        
                        <motion.div variants={heroVariants} className="flex flex-col items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                                className="bg-[#193A83] text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-90 transition-all"
                            >
                                Try for Free
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </section>
                
                <div className="bg-[#F7F9FC]">
                    <Element name="features">
                        <section className="container mx-auto px-6 py-20 text-center">
                            <h2 className="text-5xl md:text-6xl font-extrabold text-[#19154E] mb-12">Features</h2>
                            <motion.div
                                className="grid md:grid-cols-2 gap-8"
                                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                                variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                            >
                                {features.map((feature, index) => (
                                    <motion.div key={index} variants={sectionVariants} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                                        <img src={feature.image} alt={feature.title} className="w-full max-w-md rounded-lg border border-gray-200 mb-6 mx-auto" />
                                        <h3 className="text-2xl font-bold mb-3 text-[#19154E]">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </section>
                    </Element>

                    <Element name="how-to-use">
                         <motion.section
                            className="container mx-auto px-6 py-20"
                            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}
                        >
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#19154E]">How To Use</h2>
                            </div>
                            {/* Your 3-step "How to Use" cards would go here */}
                        </motion.section>
                    </Element>

                    <motion.section
                        className="container mx-auto px-6 py-20"
                        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
                    >
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-[#19154E]">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, index) => <FAQItem key={index} item={faq}/>)}
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default HomePage;