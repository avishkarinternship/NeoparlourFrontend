import React, { useState } from 'react';
import Navbar from './Layouts/NavBar';
import CustomerFooter from './Layouts/Footer';
import { Sparkles, Users, Award, Play, Camera, Heart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InfluencerProgram = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        instagram: '',
        followers: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.instagram.trim() || !formData.followers.trim()) {
            toast.error("Please fill in the required fields (Name, Instagram, Followers).");
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            toast.success("Application submitted successfully! Our PR team will review it.");
            setFormData({ name: '', email: '', instagram: '', followers: '', message: '' });
            setSubmitting(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col justify-between overflow-x-hidden">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 lg:py-24">
                
                {/* Hero section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Creator Club
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight uppercase leading-none mb-6">
                        Partner with <span className="text-[#FF2A14]">NeoParlour</span>
                    </h1>
                    <p className="text-gray-500 font-semibold text-base leading-relaxed max-w-xl mx-auto">
                        Are you a beauty blogger, stylist influencer, or local content creator? Collaborate with us to experience premium salon transformations.
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-[#FF2A14]/25 transition duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF2A14] flex items-center justify-center mb-6">
                            <Award className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Free Salon Visits</h3>
                        <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                            Receive fully sponsored styling sessions, hair treatments, and beauty makeovers at partner salons.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-[#FF2A14]/25 transition duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF2A14] flex items-center justify-center mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Audience Growth</h3>
                        <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                            Get featured on our official platform, socials, and newsletter campaigns, putting your brand in front of thousands.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-[#FF2A14]/25 transition duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF2A14] flex items-center justify-center mb-6">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold uppercase mb-2 tracking-tight">Earn Commission</h3>
                        <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                            Share personalized referral discount codes with your followers and earn flat commissions on every booking.
                        </p>
                    </div>
                </div>

                {/* Application Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gray-50 rounded-[40px] p-8 sm:p-12 lg:p-16">
                    <div className="lg:col-span-5 space-y-6">
                        <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">
                            Join the <span className="text-[#FF2A14]">NeoClub</span>
                        </h2>
                        <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                            Ready to amplify your content? Submit your channels. We collaborate with micro-influencers (1k+) as well as mega creators.
                        </p>
                        
                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700">Dedicated Creator Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700">Monthly payout settlements</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-gray-700">Priority VIP salon booking passes</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-10 border border-gray-150 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your Name"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Instagram @Handle *</label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        placeholder="@instagram_handle"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Followers Count *</label>
                                    <input
                                        type="text"
                                        name="followers"
                                        value={formData.followers}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 5K, 25K"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Collaboration Notes</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Tell us what you hope to achieve through this partnership..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#FF2A14] hover:bg-red-700 text-white py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider shadow-md active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>

            </main>
            <CustomerFooter />
        </div>
    );
};

export default InfluencerProgram;
