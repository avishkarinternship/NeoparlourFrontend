import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, Heart, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService } from '../../services/blogService';
import SEOFooter from '../common/SEOFooter';

const SAMPLE_BLOG_DETAILS = {
  1: {
    id: 1,
    title: "5 Summer Haircare Routines Recommended by Top Stylists",
    slug: "5-summer-haircare-routines-recommended-by-top-stylists",
    category: "Styling Tips",
    author: "Elena Rostova",
    createdAt: "2026-06-10T10:00:00Z",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200",
    content: `
      <p>Summer brings warmth, ocean breezes, and golden sunshine — but for your hair, it can also bring UV damage, chlorine dryness, and persistent frizz. We spoke to top partner stylists on the NeoParlour network to compile 5 non-negotiable summer haircare rules for keeping your locks glowing, hydrated, and silky smooth all season long.</p>

      <h3>1. Hydrate Before Hitting the Pool</h3>
      <p>Chlorine in swimming pools and salt in ocean water strip natural oils from your hair cuticle. Pro tip: Rinse your hair with clean freshwater before diving in. Porous hair absorbs clean water first, minimizing chlorine absorption!</p>

      <h3>2. Switch to Lightweight UV Protection Sprays</h3>
      <p>Just like your skin needs SPF 50, your scalp and hair shaft need protection from harmful ultraviolet radiation. Look for leave-in conditioners containing built-in broad-spectrum UV filters.</p>

      <h3>3. Embrace Weekly Deep Conditioning & Hair Spa Treatments</h3>
      <p>Sun exposure dries out keratin bonds. Booking a bi-weekly professional Hair Spa or applying a high-grade argan oil mask at home restores moisture balances and repairs sun-damaged cuticles.</p>

      <h3>4. Reduce High-Heat Heat Styling</h3>
      <p>Give your hair dryers and flat irons a break! Let your hair air-dry whenever possible or use heat protectant serums when blow-drying on cool air settings.</p>

      <h3>5. Trim Ends Regularly Every 6 Weeks</h3>
      <p>Summer heat accelerates split ends. Scheduling regular micro-trims at your local NeoParlour-partnered salon keeps your style fresh and prevents split ends from traveling up the hair shaft.</p>
    `
  }
};

const BlogPostDetailPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchBlogDetail();
  }, [slug, id]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      let res;
      if (slug) {
        res = await blogService.getBlogBySlug(slug);
      } else if (id) {
        res = await blogService.getBlogById(id);
      }
      if (res?.data) {
        setBlog(res.data);
      } else {
        setBlog(SAMPLE_BLOG_DETAILS[1]);
      }
    } catch (err) {
      console.warn("Using sample blog detail:", err.message);
      setBlog(SAMPLE_BLOG_DETAILS[1]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Article link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between">
        <div className="max-w-4xl mx-auto w-full px-6 py-16 space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl w-1/4"></div>
          <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl w-full"></div>
          <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl w-3/4"></div>
        </div>
      </div>
    );
  }

  const formattedDate = blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'June 10, 2026';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                toast.success(liked ? "Removed from favorites" : "Added to favorites!");
              }}
              className={`p-2.5 rounded-2xl border transition cursor-pointer ${liked ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-600' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Header Article Banner */}
        <article className="space-y-6">
          {blog?.category && (
            <span className="inline-block bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-[#FF2A14] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
              {blog.category}
            </span>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            {blog?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-zinc-500 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
              <User className="w-3.5 h-3.5 text-[#FF2A14]" /> {blog?.author || 'NeoParlour Editorial'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formattedDate}
            </span>
            {blog?.readTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {blog.readTime}
                </span>
              </>
            )}
          </div>

          {/* Hero Featured Image */}
          <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
            <img
              src={blog?.imageUrl || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200"}
              alt={blog?.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <div
            className="py-6 text-sm sm:text-base text-slate-700 dark:text-zinc-300 font-medium leading-relaxed space-y-4 prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: blog?.content || '<p>Content unavailable.</p>' }}
          />
        </article>

        {/* Footer Navigation CTA */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Enjoyed this article?</h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Explore more stories and operational guides on NeoParlour.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="px-6 py-3 bg-[#FF2A14] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md shadow-red-500/20 flex items-center gap-2 cursor-pointer"
          >
            Explore All Blogs <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </main>
      <SEOFooter />
    </div>
  );
};

export default BlogPostDetailPage;
