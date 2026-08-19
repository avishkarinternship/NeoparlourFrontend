import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, UserCheck } from 'lucide-react';
import { testimonialService } from '../../services/testimonialService';
import SEOFooter from '../common/SEOFooter';

const SAMPLE_TESTIMONIALS = [
  {
    id: 1,
    clientName: "Rahul Sharma",
    clientRole: "Regular Customer, Pune",
    rating: 5,
    content: "Booking appointments via NeoParlour has completely eliminated weekend queue wait times. The live slot availability and instant confirmation make salon visits effortless!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    isFeatured: true
  },
  {
    id: 2,
    clientName: "Priya Patel",
    clientRole: "Salon Owner, Biguine",
    rating: 5,
    content: "The staff walk-in tracking and automated inventory features saved our salon over 15 hours a week in manual bookkeeping. Incredible platform!",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    isFeatured: true
  },
  {
    id: 3,
    clientName: "Amit Verma",
    clientRole: "Verified Customer",
    rating: 5,
    content: "Clean UI, transparent pricing, and instant discount vouchers. Finding top rated stylists near me has never been easier.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    isFeatured: true
  }
];

const TestimonialsComponent = ({ showHeader = true, isStandalone = true }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialService.getFeaturedTestimonials();
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        setTestimonials(fetched);
      } else {
        setTestimonials(SAMPLE_TESTIMONIALS);
      }
    } catch (err) {
      console.warn("Using sample testimonials:", err.message);
      setTestimonials(SAMPLE_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const contentUI = (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {showHeader && (
        <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up">
          <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
            <Sparkles className="w-3.5 h-3.5" /> Customer & Owner Reviews
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-tight mb-4">
            Loved By <span className="text-[#FF2A14]">Thousands</span>
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 font-semibold text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Discover how NeoParlour transforms salon booking experiences for customers and streamlines business operations for owners.
          </p>
        </div>
      )}

      {/* Interactive Carousel Card */}
      {loading ? (
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-800 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 mx-auto"></div>
          <div className="h-20 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
        </div>
      ) : testimonials.length > 0 ? (
        <div className="max-w-4xl mx-auto relative">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-slate-100 dark:border-zinc-800/80 shadow-xl relative overflow-hidden transition-all duration-500 border-t-4 border-t-[#FF2A14]">
            <Quote className="w-16 h-16 text-red-500/10 dark:text-red-500/10 absolute top-4 right-6 pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < (testimonials[activeIndex]?.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-zinc-700'}`}
                  />
                ))}
              </div>

              {/* Quote Content */}
              <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-zinc-200 italic leading-relaxed max-w-2xl">
                "{testimonials[activeIndex]?.content || 'Outstanding service!'}"
              </p>

              {/* Client Info & Avatar */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 w-full justify-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shadow-md shrink-0 bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={testimonials[activeIndex]?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                    alt={testimonials[activeIndex]?.clientName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                    {testimonials[activeIndex]?.clientName} <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">{testimonials[activeIndex]?.clientRole || 'Customer'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Slider Arrow Controls */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs font-black text-slate-400 dark:text-zinc-500">
                {activeIndex + 1} / {testimonials.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      ) : null}

    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans flex flex-col justify-between">
        {contentUI}
        <SEOFooter />
      </div>
    );
  }

  return contentUI;
};

export default TestimonialsComponent;
