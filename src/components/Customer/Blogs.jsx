import React, { useState } from 'react';
import Navbar from './Layouts/NavBar';
import CustomerFooter from './Layouts/Footer';
import { Sparkles, Calendar, BookOpen, Clock, Heart, Share2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Blogs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [likes, setLikes] = useState({});

    const blogPosts = [
        {
            id: 1,
            title: "5 Summer Haircare Routines Recommended by Top Stylists",
            category: "Styling Tips",
            date: "June 10, 2026",
            readTime: "4 min read",
            summary: "Keep your locks glowing and protected under the sun. Our partner stylists share their secret hydration formulas and protection sprays.",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600"
        },
        {
            id: 2,
            title: "SaaS & Beauty: How Tech is Transforming Local Salon Operations",
            category: "Industry Insights",
            date: "May 28, 2026",
            readTime: "6 min read",
            summary: "From AI-powered slot scheduling to automated inventory notifications. Explore how modern salons utilize SaaS platforms to scale.",
            image: "https://images.unsplash.com/photo-1521590832167-7bcbfea48342?auto=format&fit=crop&q=80&w=600"
        },
        {
            id: 3,
            title: "Bridal Makeup Trends for 2026: Elegant, Minimalist & Dewy",
            category: "Trends",
            date: "May 15, 2026",
            readTime: "5 min read",
            summary: "Ditch the heavy layers. This wedding season is all about skin-first dewy finishes, soft blush accents, and customizable packages.",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600"
        }
    ];

    const handleLike = (id) => {
        setLikes(prev => {
            const current = prev[id] || 0;
            const updated = current === 0 ? 1 : 0; // toggle
            if (updated === 1) {
                toast.success("Added to favorites!");
            }
            return { ...prev, [id]: updated };
        });
    };

    const handleShare = (title) => {
        if (navigator.share) {
            navigator.share({ title, url: window.location.href })
                .catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Blog link copied to clipboard!");
        }
    };

    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col justify-between overflow-x-hidden">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 lg:py-24">
                
                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Stories & Insights
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight uppercase leading-none mb-6">
                        NeoParlour <span className="text-[#FF2A14]">Journal</span>
                    </h1>
                    <p className="text-gray-500 font-semibold text-base leading-relaxed max-w-xl mx-auto">
                        Explore styling secrets, business tips, tech trends, and professional beauty guides curated by top parlor experts.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-md mx-auto mb-16 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search blogs, tips, or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                    />
                </div>

                {/* Blogs Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {filteredPosts.map((post) => (
                            <article 
                                key={post.id}
                                className="group flex flex-col bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-300 shadow-2xs"
                            >
                                <div className="h-52 overflow-hidden bg-gray-100 relative">
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                    />
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-gray-700">
                                        {post.category}
                                    </span>
                                </div>

                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{post.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-[#FF2A14] transition-colors leading-snug mb-3 uppercase tracking-tight">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                            {post.summary}
                                        </p>
                                    </div>

                                    {/* Article Footer Action Panel */}
                                    <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                        <button
                                            type="button"
                                            className="text-xs font-black uppercase tracking-wider text-[#FF2A14] hover:text-red-700 transition flex items-center gap-1"
                                        >
                                            Read Article <BookOpen className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleLike(post.id)}
                                                className={`p-2 rounded-full transition-all ${
                                                    likes[post.id] 
                                                        ? 'bg-red-50 text-red-500' 
                                                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50/20'
                                                }`}
                                            >
                                                <Heart className="w-4 h-4" fill={likes[post.id] ? "currentColor" : "none"} />
                                            </button>
                                            <button 
                                                onClick={() => handleShare(post.title)}
                                                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching articles found</p>
                    </div>
                )}

            </main>
            <CustomerFooter />
        </div>
    );
};

export default Blogs;
