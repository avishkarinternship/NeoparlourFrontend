import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Clock, Heart, Share2, Search, ArrowRight, User, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService } from '../../services/blogService';
import SEOFooter from '../common/SEOFooter';

const SAMPLE_BLOGS = [
  {
    id: 1,
    title: "5 Summer Haircare Routines Recommended by Top Stylists",
    slug: "5-summer-haircare-routines-recommended-by-top-stylists",
    category: "Styling Tips",
    author: "Elena Rostova",
    createdAt: "2026-06-10T10:00:00Z",
    readTime: "4 min read",
    content: "Keep your locks glowing and protected under the sun. Our partner stylists share their secret hydration formulas, UV protection sprays, and deep conditioning masks to preserve your hair vibrancy all summer long.",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    id: 2,
    title: "SaaS & Beauty: How Tech is Transforming Local Salon Operations",
    slug: "saas-beauty-how-tech-is-transforming-local-salon-operations",
    category: "Industry Insights",
    author: "Avishkar Sharma",
    createdAt: "2026-05-28T14:30:00Z",
    readTime: "6 min read",
    content: "From AI-powered slot scheduling to automated inventory notifications and staff walk-in tracking. Explore how modern salons utilize NeoParlour SaaS platforms to scale revenue and eliminate booking friction.",
    imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfea48342?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    id: 3,
    title: "Bridal Makeup Trends for 2026: Elegant, Minimalist & Dewy",
    slug: "bridal-makeup-trends-for-2026-elegant-minimalist-dewy",
    category: "Trends",
    author: "Priya Kapoor",
    createdAt: "2026-05-15T09:15:00Z",
    readTime: "5 min read",
    content: "Ditch the heavy layers. This wedding season is all about skin-first dewy finishes, soft blush accents, and customizable bridal packages that keep brides glowing effortlessly through day & night celebrations.",
    imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  }
];

const BlogListingPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [likes, setLikes] = useState({});

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getAllBlogs();
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        setBlogs(fetched);
      } else {
        setBlogs(SAMPLE_BLOGS);
      }
    } catch (err) {
      console.warn("Using fallback blogs:", err.message);
      setBlogs(SAMPLE_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikes(prev => {
      const current = prev[id] || 0;
      const updated = current === 0 ? 1 : 0;
      if (updated === 1) toast.success("Added to favorites!");
      return { ...prev, [id]: updated };
    });
  };

  const handleShare = (post, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/blogs/${post.slug || post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Blog link copied to clipboard!");
    }
  };

  const categories = ['ALL', ...new Set(blogs.map(b => b.category).filter(Boolean))];

  const filteredPosts = blogs.filter(post => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up">
          <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
            <Sparkles className="w-3.5 h-3.5" /> Stories & Salon Insights
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-tight mb-4">
            NeoParlour <span className="text-[#FF2A14]">Journal</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 font-semibold text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Explore expert haircare guides, beauty operational trends, tech insights, and salon growth strategies.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="max-w-3xl mx-auto mb-12 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blogs, tips, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold focus:outline-none focus:border-[#FF2A14] shadow-xs dark:text-white"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF2A14] text-white shadow-md shadow-red-500/20'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-100 dark:border-zinc-800 space-y-4 animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {filteredPosts.map((post) => {
              const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently Published';
              const slugTarget = post.slug || post.id;

              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/blogs/${slugTarget}`)}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer border-t-4 border-t-[#FF2A14]"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {post.category && (
                        <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-white/10">
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#FF2A14]" /> {post.author || 'NeoParlour'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formattedDate}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-snug group-hover:text-[#FF2A14] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed line-clamp-3">
                        {post.content ? post.content.replace(/<[^>]*>?/gm, '') : 'Click to read full article...'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-black text-[#FF2A14] uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Full Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleLike(post.id, e)}
                        className={`p-2 rounded-xl transition ${likes[post.id] ? 'bg-red-50 text-red-600 dark:bg-red-950/40' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                      >
                        <Heart className={`w-4 h-4 ${likes[post.id] ? 'fill-red-600' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShare(post, e)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 max-w-lg mx-auto">
            <Search className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No Blogs Found</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Try adjusting your search filters or check back soon.</p>
          </div>
        )}

      </main>
      <SEOFooter />
    </div>
  );
};

export default BlogListingPage;
