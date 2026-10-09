import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Clock, Share2, Heart, Sparkles, BookOpen, 
  ChevronRight, ArrowUpRight, Compass, Scissors, Layers, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService } from '../../services/blogService';
import SEOFooter from '../common/SEOFooter';
import { updateSEOMetadata, injectJSONLD, generateBlogPostingSchema } from '../../utils/seoHelper';

const sanitizeArticleHtml = (rawHtml) => {
  if (!rawHtml) return '';
  let html = rawHtml;
  // 1. Unescape escaped backslash quotes from JSON/cURL pastes (e.g. class=\"lead\" -> class="lead")
  html = html.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // 2. Fix invalid nesting like <p class="lead"><h2>...</h2></p> -> <h2>...</h2>
  html = html.replace(/<p([^>]*)>\s*<h([1-6])([^>]*)>/gi, '<h$2$3>');
  html = html.replace(/<\/h([1-6])>\s*<\/p>/gi, '</h$1>');

  // 3. Remove metadata comments from display
  html = html.replace(/<!--related_blog_ids:\[(.*?)\]-->/g, '');
  html = html.replace(/<!--seo_meta:(\{.*?\})-->/g, '');

  return html;
};

const parseSeoMetadata = (blog) => {
  if (!blog) return { metaTitle: '', metaDescription: '', metaKeywords: '' };
  let metaTitle = blog.metaTitle || '';
  let metaDescription = blog.metaDescription || '';
  let metaKeywords = blog.metaKeywords || '';

  // Fallback: parse from embedded HTML comment
  if ((!metaTitle || !metaDescription || !metaKeywords) && blog.content) {
    const match = blog.content.match(/<!--seo_meta:(\{.*?\})-->/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (!metaTitle && parsed.metaTitle) metaTitle = parsed.metaTitle;
        if (!metaDescription && parsed.metaDescription) metaDescription = parsed.metaDescription;
        if (!metaKeywords && parsed.metaKeywords) metaKeywords = parsed.metaKeywords;
      } catch (e) {
        console.warn("Failed to parse fallback seo_meta comment:", e);
      }
    }
  }

  if (!metaTitle && blog.title) {
    metaTitle = `${blog.title} | NeoParlour`;
  }
  if (!metaDescription && blog.content) {
    const stripped = blog.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    metaDescription = stripped.length > 155 ? `${stripped.slice(0, 155)}...` : stripped;
  }
  if (!metaKeywords) {
    metaKeywords = `${blog.category || 'Salon'}, salon tips, hair and beauty, NeoParlour`;
  }

  return { metaTitle, metaDescription, metaKeywords };
};

const parseRelatedBlogIds = (blog) => {
  if (!blog) return [];
  if (Array.isArray(blog.relatedBlogIds)) return blog.relatedBlogIds.map(String);
  if (typeof blog.relatedBlogIds === 'string' && blog.relatedBlogIds.trim()) {
    try {
      const parsed = JSON.parse(blog.relatedBlogIds);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (e) {
      return blog.relatedBlogIds.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (blog.content) {
    const match = blog.content.match(/<!--related_blog_ids:\[(.*?)\]-->/);
    if (match && match[1]) {
      return match[1].split(',').map(s => s.replace(/["']/g, '').trim()).filter(Boolean);
    }
  }
  return [];
};

const BlogPostDetailPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      const currentBlog = res?.data || null;
      setBlog(currentBlog);

      // Fetch all published blogs for sidebar recommendations
      try {
        const listRes = await blogService.getAllBlogs();
        const list = listRes.data?.content || listRes.data || [];
        if (Array.isArray(list)) {
          setAllBlogs(list.filter(b => b.isPublished !== false));
        }
      } catch (e) {
        console.warn("Could not fetch blog catalog for related links:", e.message);
      }

    } catch (err) {
      console.warn("Failed to fetch blog post:", err?.message || err);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically update SEO Title, Meta tags and Google Article Schema
  useEffect(() => {
    if (!blog) return;
    const { metaTitle, metaDescription, metaKeywords } = parseSeoMetadata(blog);
    updateSEOMetadata({
      title: metaTitle,
      description: metaDescription,
      keywords: metaKeywords,
      image: blog.imageUrl,
      url: window.location.href,
      type: 'article'
    });
    injectJSONLD(generateBlogPostingSchema({
      ...blog,
      metaTitle,
      metaDescription
    }));
  }, [blog]);

  // Compute Related Blogs for Left Sidebar
  const relatedBlogs = useMemo(() => {
    if (!blog || allBlogs.length === 0) return [];

    const otherBlogs = allBlogs.filter(b => 
      String(b.id) !== String(blog.id) && b.slug !== blog.slug
    );

    const explicitIds = parseRelatedBlogIds(blog);
    const result = [];
    const addedIds = new Set();

    // 1. Prioritize explicit matches chosen in SEO Admin
    if (explicitIds.length > 0) {
      for (const idOrSlug of explicitIds) {
        const match = otherBlogs.find(b => 
          String(b.id) === String(idOrSlug) || b.slug === String(idOrSlug)
        );
        if (match && !addedIds.has(match.id)) {
          result.push(match);
          addedIds.add(match.id);
        }
      }
    }

    // 2. Smart category peer recommendations (same category)
    if (result.length < 4 && blog.category) {
      const sameCategory = otherBlogs.filter(b => 
        (b.category || '').toLowerCase() === blog.category.toLowerCase() &&
        !addedIds.has(b.id)
      );
      for (const b of sameCategory) {
        if (result.length >= 4) break;
        result.push(b);
        addedIds.add(b.id);
      }
    }

    // 3. Fallback: Most recent published articles
    if (result.length < 4) {
      for (const b of otherBlogs) {
        if (result.length >= 4) break;
        if (!addedIds.has(b.id)) {
          result.push(b);
          addedIds.add(b.id);
        }
      }
    }

    return result;
  }, [blog, allBlogs]);

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
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 space-y-4 hidden lg:block">
              <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/2" />
              <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
              <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded-xl w-1/4" />
              <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl w-full" />
              <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between">
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-20 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Article Not Found</h2>
          <p className="text-xs text-slate-400 font-semibold mt-2 mb-6">The requested blog post does not exist or may have been unpublished.</p>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="px-6 py-2.5 bg-[#FF2A14] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            Back to All Blogs
          </button>
        </main>
        <SEOFooter />
      </div>
    );
  }

  const formattedDate = blog?.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : 'October 2026';

  // Clean hidden metadata comments and unescape quotes before rendering
  const cleanHtmlContent = sanitizeArticleHtml(blog?.content || '<p>Content unavailable.</p>');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between antialiased">
      
      {/* Container with Left Sidebar and Main Article */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF2A14]" /> Back to Articles
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                toast.success(liked ? "Removed from favorites" : "Added to favorites! ❤️");
              }}
              className={`p-2.5 rounded-2xl border transition cursor-pointer active:scale-95 ${
                liked 
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-600' 
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Bookmark article"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer active:scale-95"
              title="Share article"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Left Sidebar for Related Blogs + Right Main Body */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: RELATED BLOG LINKS & REVIEWS                                */}
          {/* ========================================================================= */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* Related Articles Widget */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-500/10 text-[#FF2A14] border border-red-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Related Articles
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Recommended reading for you
                      </p>
                    </div>
                  </div>

                  {relatedBlogs.length > 0 && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#FF2A14] border border-red-200/50 dark:border-red-900/50">
                      {relatedBlogs.length} Stories
                    </span>
                  )}
                </div>

                {/* Related Links List */}
                {relatedBlogs.length > 0 ? (
                  <div className="space-y-3.5">
                    {relatedBlogs.map((rel) => {
                      const relSlug = rel.slug || rel.id;
                      return (
                        <Link
                          key={rel.id}
                          to={`/blog/${relSlug}`}
                          className="group block p-2.5 -mx-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition border border-transparent hover:border-slate-100 dark:hover:border-zinc-800"
                        >
                          <div className="flex items-start gap-3">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60">
                              <img
                                src={rel.imageUrl || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300"}
                                alt={rel.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              {rel.category && (
                                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[#FF2A14]">
                                  {rel.category}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#FF2A14] transition line-clamp-2 leading-snug">
                                {rel.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                <span>{rel.readTime || '3 min read'}</span>
                                <span>•</span>
                                <span className="group-hover:translate-x-0.5 transition flex items-center gap-0.5 text-[#FF2A14] font-bold">
                                  Read <ArrowUpRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="font-semibold">No other articles yet.</p>
                  </div>
                )}

                {/* Explore All Category Stories Link */}
                {blog?.category && (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => navigate('/blogs')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-zinc-300 hover:text-[#FF2A14] text-xs font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>More in {blog.category}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>

              {/* Salon Booking Callout Card */}
              <div className="rounded-3xl p-6 bg-gradient-to-br from-red-600 via-[#FF2A14] to-amber-600 text-white shadow-lg shadow-red-500/20 space-y-3 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-md text-white">
                  <Scissors className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">
                    Experience It In Salon
                  </h4>
                  <p className="text-xs text-white/90 leading-relaxed font-medium mt-1">
                    Book certified stylists offering genuine treatments and instant reservations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/seo-salons')}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Explore Salons</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </aside>

          {/* ========================================================================= */}
          {/* MAIN COLUMN: ARTICLE CONTENT                                              */}
          {/* ========================================================================= */}
          <main className="flex-1 min-w-0 order-1 lg:order-2 space-y-6">
            
            <article className="space-y-6 bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
              
              {/* Category Pill */}
              {blog?.category && (
                <div className="flex items-center gap-2">
                  <span className="inline-block bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-[#FF2A14] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                    {blog.category}
                  </span>
                </div>
              )}

              {/* Article Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                {blog?.title}
              </h1>

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-zinc-500 pb-5 border-b border-slate-100 dark:border-zinc-800">
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
              <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
                <img
                  src={blog?.imageUrl || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200"}
                  alt={blog?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article HTML Body Content */}
              <div
                className="blog-content py-4 text-sm sm:text-base text-slate-700 dark:text-zinc-300 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanHtmlContent }}
              />

              {/* Article Footer Card */}
              <div className="pt-8 mt-8 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Published by NeoParlour Editorial
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Curated salon insights, trends, and stylist recommendations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/blogs')}
                  className="px-5 py-2.5 bg-[#FF2A14] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-md shadow-red-500/20 flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  Explore All Articles <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </article>

          </main>

        </div>

      </div>

      {/* Public SEO Footer */}
      <SEOFooter />

    </div>
  );
};

export default BlogPostDetailPage;
