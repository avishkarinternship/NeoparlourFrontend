import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';

const Support = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.message.trim()) {
            toast.error("Please fill in your name and message.");
            return;
        }

        if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return;
        }

        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            toast.success("Support ticket created successfully! We will contact you soon.");
            setFormData({ name: '', email: '', mobile: '', message: '' });
            setSubmitting(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
            {/* Main Support Body */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 lg:py-24">
                {/* Hero Section */}
                <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                    <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Customer Care
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none mb-4">
                        We're Here To <span className="text-[#FF2A14]">Help</span>
                    </h1>
                    <p className="text-gray-400 font-semibold text-sm leading-relaxed">
                        Have a question about your booking, need help finding a salon, or want to share feedback? Get in touch with our team.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Contact Info Column */}
                    <div className="lg:col-span-5 space-y-6" data-aos="fade-right" data-aos-delay="100">
                        <h2 className="text-xl font-black uppercase text-gray-900 tracking-tight border-b pb-3 mb-6">
                            Contact Channels
                        </h2>

                        {/* Email Card */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs hover:border-[#FF2A14]/20 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF2A14] flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-1">Email Support</h4>
                                <p className="text-sm font-semibold text-gray-600">support@neoparlour.com</p>
                                <p className="text-xs text-gray-400 mt-1">We typically reply within 24 hours.</p>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs hover:border-[#FF2A14]/20 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF2A14] flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-1">Call Helpline</h4>
                                <p className="text-sm font-semibold text-gray-600">+91 7062 888 812</p>
                                <p className="text-xs text-gray-400 mt-1">Available 9:00 AM to 9:00 PM IST.</p>
                            </div>
                        </div>

                        {/* Business Hours Card */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF2A14] flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-1">Operational Hours</h4>
                                <p className="text-sm font-semibold text-gray-600">Monday - Sunday</p>
                                <p className="text-xs text-gray-400 mt-1">Our support staff is active 7 days a week.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Message Form Column */}
                    <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl shadow-gray-100" data-aos="fade-left" data-aos-delay="200">
                        <div className="mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#FF2A14]" />
                            <h2 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                                Send us a Message
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Name Input */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Full Name"
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Mobile Input */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Mobile Number (Optional)</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    placeholder="10-digit number"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Describe your query</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Write your message here..."
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] disabled:bg-red-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer uppercase tracking-widest text-xs"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <SEOFooter />
        </div>
    );
};

export default Support;
