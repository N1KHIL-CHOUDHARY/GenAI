import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    // 1. Define the missing 'footerLinks' object here
    const footerLinks = {
        Legal: [
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Terms and Conditions", path: "/terms" },
            { name: "Disclaimer", path: "/disclaimer" }
        ],
        LearnMore: [
            { name: "About Us", path: "/about" },
            { name: "FAQ", path: "/faq" },
        ]
    };

    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        
                    </div>

                    <div className="md:col-span-1">
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.Legal.map(link => (
                                <li key={link.name}>
                                    <Link to={link.path} className="hover:text-white transition-colors">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-white mb-4">Learn More</h4>
                        <ul className="space-y-2">
                            {footerLinks.LearnMore.map(link => (
                                <li key={link.name}>
                                    <Link to={link.path} className="hover:text-white transition-colors">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Pearl Labs</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white"><FaLinkedinIn /></a>
                        <a href="#" className="hover:text-white"><FaFacebookF /></a>
                        <a href="#" className="hover:text-white"><FaInstagram /></a>
                        <a href="#" className="hover:text-white"><FaTwitter /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// 2. Export with the correct capitalized name
export default Footer;