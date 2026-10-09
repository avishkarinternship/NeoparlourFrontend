import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Edit2, Trash2, Search, CheckCircle, XCircle, FileText, Sparkles, X, Eye, 
  ExternalLink, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Link2, Image, Code, Palette, Globe, Wand2, EyeOff,
  Clock, BookOpen, AlertCircle, Check, Copy, Sliders, Layers, ChevronRight, ChevronDown,
  TrendingUp, BarChart3, Bookmark, AlertTriangle, Lightbulb,
  Upload, UploadCloud, Loader2, ImagePlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService } from '../../services/blogService';
import CreateSeoAdminModal from '../Admin/CreateSeoAdminModal';


const CATEGORIES = [
  'Styling Tips',
  'Hair Care',
  'Skin & Spa',
  'Industry Insights',
  'Trends & Fashion',
  'Salon Business'
];

const slugify = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const sanitizeArticleHtml = (rawHtml) => {
  if (!rawHtml) return '';
  let html = rawHtml;
  // 1. Unescape escaped backslash quotes from JSON/cURL pastes (e.g. class=\"lead\" -> class="lead")
  html = html.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // 2. Fix invalid nesting like <p><h2> -> <h2>
  html = html.replace(/<p([^>]*)>\s*<h([1-6])([^>]*)>/gi, '<h$2$3>');
  html = html.replace(/<\/h([1-6])>\s*<\/p>/gi, '</h$1>');

  // 3. Remove metadata comments from display
  html = html.replace(/<!--related_blog_ids:\[(.*?)\]-->/g, '');
  html = html.replace(/<!--seo_meta:(\{.*?\})-->/g, '');

  return html;
};

export const parseSeoMetadata = (blog) => {
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

  return { metaTitle, metaDescription, metaKeywords };
};

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);

  // Check if current user is Super Admin / Platform Admin
  const currentUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
  const userRole = (currentUser?.role || currentUser?.userRole || '').toUpperCase();
  const canProvisionSeo = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ROLE_ADMIN';

  // Editor Tabs: 'editor' | 'preview'
  const [editorTab, setEditorTab] = useState('editor');
  const textareaRef = useRef(null);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Upload & Disk Storage States
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [showManualCoverUrl, setShowManualCoverUrl] = useState(false);
  const coverFileInputRef = useRef(null);
  const inlineFileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Styling Tips',
    author: 'SEO Editorial Team',
    imageUrl: '',
    content: '',
    isPublished: true,
    relatedBlogIds: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  const [relatedSearchTerm, setRelatedSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPage, setDropdownPage] = useState(1);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownPage(1);
  }, [relatedSearchTerm]);

  // Candidate blogs: excluding current blog, ordered by createdAt latest on top, filtered if searching
  const candidateRelatedBlogs = useMemo(() => {
    const currentId = editingBlog?.id || -1;
    let list = blogs.filter(b => b.id !== currentId);

    // Latest on top by creation date
    list = [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (Number(a.id) || 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (Number(b.id) || 0);
      return timeB - timeA;
    });

    if (relatedSearchTerm.trim()) {
      const q = relatedSearchTerm.toLowerCase();
      list = list.filter(b => 
        (b.title || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.slug || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [blogs, editingBlog, relatedSearchTerm]);

  // Paginated slice for infinite scroll
  const paginatedCandidateBlogs = useMemo(() => {
    return candidateRelatedBlogs.slice(0, dropdownPage * PAGE_SIZE);
  }, [candidateRelatedBlogs, dropdownPage]);

  const hasMoreCandidates = paginatedCandidateBlogs.length < candidateRelatedBlogs.length;

  const handleDropdownScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      if (hasMoreCandidates) {
        setDropdownPage(prev => prev + 1);
      }
    }
  };

  const toggleRelatedBlog = (idOrSlug) => {
    const idStr = String(idOrSlug);
    setFormData(prev => {
      const exists = prev.relatedBlogIds.some(id => String(id) === idStr);
      if (exists) {
        return {
          ...prev,
          relatedBlogIds: prev.relatedBlogIds.filter(id => String(id) !== idStr)
        };
      } else {
        return {
          ...prev,
          relatedBlogIds: [...prev.relatedBlogIds, idStr]
        };
      }
    });
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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getAllBlogs();
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched)) {
        setBlogs(fetched);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.warn("Failed to fetch admin blogs:", err?.message || err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setEditorTab('editor');
    setRelatedSearchTerm('');
    setIsDropdownOpen(false);
    setDropdownPage(1);
    setFormData({
      title: '',
      slug: '',
      category: 'Styling Tips',
      author: 'SEO Editorial Team',
      imageUrl: '',
      content: '',
      isPublished: true,
      relatedBlogIds: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setEditorTab('editor');
    setRelatedSearchTerm('');
    setIsDropdownOpen(false);
    setDropdownPage(1);
    const seoMeta = parseSeoMetadata(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || slugify(blog.title),
      category: blog.category || 'Styling Tips',
      author: blog.author || 'SEO Editorial Team',
      imageUrl: blog.imageUrl || '',
      content: sanitizeArticleHtml(blog.content || ''),
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
      relatedBlogIds: parseRelatedBlogIds(blog),
      metaTitle: seoMeta.metaTitle || '',
      metaDescription: seoMeta.metaDescription || '',
      metaKeywords: seoMeta.metaKeywords || ''
    });
    setShowModal(true);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !editingBlog ? slugify(val) : prev.slug
    }));
  };

  // ====================== RICH TEXT FORMATTING TOOLS ======================
  const applyFormat = (tagOpen, tagClose, placeholder = "formatted text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = formData.content || '';

    const selectedText = currentText.substring(start, end) || placeholder;
    const replacement = `${tagOpen}${selectedText}${tagClose}`;
    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 10);
  };

  const insertLink = () => {
    const url = prompt("Enter target hyperlink URL:", "https://");
    if (!url) return;
    applyFormat(`<a href="${url}" class="text-[#FF2A14] underline font-bold" target="_blank" rel="noopener noreferrer">`, '</a>', 'explore details');
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.');
      return;
    }

    try {
      setIsUploadingCover(true);
      const res = await blogService.uploadImage(file, 'blogs');
      const uploadedUrl = res.data?.url || res.data?.relativeUrl;
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
        toast.success('Cover image saved to server disk successfully!');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be under 10MB.');
      return;
    }

    try {
      setIsUploadingInline(true);
      const res = await blogService.uploadImage(file, 'blogs');
      const uploadedUrl = res.data?.url || res.data?.relativeUrl;
      if (uploadedUrl) {
        const alt = prompt("Enter caption/alt text for this image:", file.name.replace(/\.[^/.]+$/, "")) || "Salon Service";
        const imgHtml = `\n<figure class="my-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-zinc-800">\n  <img src="${uploadedUrl}" alt="${alt}" class="w-full h-auto object-cover rounded-2xl" />\n  <figcaption class="text-xs text-center text-slate-400 mt-2 italic">${alt}</figcaption>\n</figure>\n`;

        const textarea = textareaRef.current;
        if (!textarea) {
          setFormData(prev => ({ ...prev, content: (prev.content || '') + imgHtml }));
        } else {
          const start = textarea.selectionStart;
          const text = formData.content || '';
          const newContent = text.substring(0, start) + imgHtml + text.substring(start);
          setFormData(prev => ({ ...prev, content: newContent }));
        }
        toast.success('Image saved to disk and inserted into article!');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploadingInline(false);
      if (inlineFileInputRef.current) inlineFileInputRef.current.value = '';
    }
  };

  const insertImage = () => {
    // Triggers file selector to save image directly to server disk
    if (inlineFileInputRef.current) {
      inlineFileInputRef.current.click();
    }
  };

  const insertImageViaUrl = () => {
    const url = prompt("Enter image source URL:", "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800");
    if (!url) return;
    const alt = prompt("Enter caption/alt text:", "Verified Salon Styling") || "Salon Service";
    const imgHtml = `\n<figure class="my-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-zinc-800">\n  <img src="${url}" alt="${alt}" class="w-full h-auto object-cover rounded-2xl" />\n  <figcaption class="text-xs text-center text-slate-400 mt-2 italic">${alt}</figcaption>\n</figure>\n`;
    
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: (prev.content || '') + imgHtml }));
      return;
    }
    const start = textarea.selectionStart;
    const text = formData.content || '';
    const newContent = text.substring(0, start) + imgHtml + text.substring(start);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const insertColor = (colorHex, colorName) => {
    applyFormat(`<span style="color: ${colorHex};" class="font-bold">`, '</span>', `${colorName} text`);
  };

  const insertCalloutBox = (type = 'tip') => {
    let boxHtml = '';
    if (type === 'tip') {
      boxHtml = `\n<div class="p-4 my-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-slate-800 dark:text-zinc-200">
  <p class="font-bold text-[#FF2A14] mb-1 flex items-center gap-1.5">💡 Master Stylist Secret</p>
  <p class="text-xs leading-relaxed">Book a clarifying wash followed by a deep hydration spa every 3 weeks for maximum gloss.</p>
</div>\n`;
    } else {
      boxHtml = `\n<div class="p-4 my-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-zinc-200">
  <p class="font-bold text-amber-600 mb-1 flex items-center gap-1.5">⚠️ Important Recommendation</p>
  <p class="text-xs leading-relaxed">Always confirm with your stylist regarding heat protection after intensive chemical treatments.</p>
</div>\n`;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: (prev.content || '') + boxHtml }));
      return;
    }
    const start = textarea.selectionStart;
    const text = formData.content || '';
    const newContent = text.substring(0, start) + boxHtml + text.substring(start);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const insertSeoOutlineTemplate = () => {
    const template = `<h2>Introduction & Trend Overview</h2>
<p>Modern salon treatments have evolved dramatically this season. From specialized keratin infusions to scalp detox therapy, finding the right routine can completely transform your hair vitality and confidence.</p>

<h2>3 Key Benefits for Your Hair & Skin</h2>
<ul>
  <li><strong>Deep Hydration:</strong> Locks in moisture against humidity and harsh weather exposure.</li>
  <li><strong>Frizz Control:</strong> Smooths cuticles for up to 6 weeks of effortless everyday styling.</li>
  <li><strong>Scalp Balance:</strong> Regulates pH levels to promote stronger, healthier hair growth.</li>
</ul>

<div class="p-4 my-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-slate-800 dark:text-zinc-200">
  <p class="font-bold text-[#FF2A14] mb-1">💡 Master Stylist Tip</p>
  <p class="text-xs leading-relaxed">Always consult with your verified NeoParlour stylist before opting for high-strength chemical treatments.</p>
</div>

<h2>What Top Stylists Recommend</h2>
<blockquote class="border-l-4 border-[#FF2A14] pl-4 italic my-4 text-slate-600 dark:text-zinc-300">
  "Investing in preventative hair care saves dozens of hours of repair work later." — Salon Master Stylist
</blockquote>

<h2>Ready for a Transformation?</h2>
<p>Browse top-rated partner salons on NeoParlour to reserve your exclusive slot today with instant booking confirmation!</p>`;

    setFormData(prev => ({ ...prev, content: template }));
    toast.success("SEO Blog outline template inserted! 🚀");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter an article title");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Article content cannot be empty");
      return;
    }

    setSaving(true);
    const sanitizedBody = sanitizeArticleHtml(formData.content);
    const wordCount = sanitizedBody.split(/\s+/).filter(Boolean).length;
    
    // Clean any existing metadata tags first
    let cleanContent = sanitizedBody
      .replace(/<!--related_blog_ids:\[(.*?)\]-->/g, '')
      .replace(/<!--seo_meta:(\{.*?\})-->/g, '')
      .trim();

    // Fallback embed metadata comment for resilient backward compatibility
    const metaPayload = {
      metaTitle: (formData.metaTitle || '').trim(),
      metaDescription: (formData.metaDescription || '').trim(),
      metaKeywords: (formData.metaKeywords || '').trim()
    };
    cleanContent += `\n<!--seo_meta:${JSON.stringify(metaPayload)}-->`;

    if (formData.relatedBlogIds && formData.relatedBlogIds.length > 0) {
      cleanContent += `\n<!--related_blog_ids:[${formData.relatedBlogIds.join(',')}]-->`;
    }

    const payload = {
      ...formData,
      metaTitle: (formData.metaTitle || '').trim(),
      metaDescription: (formData.metaDescription || '').trim(),
      metaKeywords: (formData.metaKeywords || '').trim(),
      content: cleanContent,
      relatedBlogIds: (formData.relatedBlogIds || []).join(','),
      slug: formData.slug || slugify(formData.title),
      readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`
    };

    try {
      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, payload);
        toast.success("Blog article updated successfully! 🎉");
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? { ...b, ...payload } : b));
      } else {
        const res = await blogService.createBlog(payload);
        const newEntry = res.data || { ...payload, id: Date.now(), createdAt: new Date().toISOString() };
        toast.success("New blog article published! 🎉");
        setBlogs(prev => [newEntry, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.warn("Saving to local state fallback:", err.message);
      if (editingBlog) {
        setBlogs(prev => prev.map(b => b.id === editingBlog.id ? { ...b, ...payload } : b));
        toast.success("Blog updated in local view!");
      } else {
        const fallbackNew = { ...payload, id: Date.now(), createdAt: new Date().toISOString() };
        setBlogs(prev => [fallbackNew, ...prev]);
        toast.success("Blog created in local view!");
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await blogService.deleteBlog(deletingId);
      toast.success("Blog post removed successfully");
      setBlogs(prev => prev.filter(b => b.id !== deletingId));
    } catch (err) {
      console.warn("Delete local fallback:", err.message);
      setBlogs(prev => prev.filter(b => b.id !== deletingId));
      toast.success("Blog post removed from view");
    } finally {
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  // Real-time SEO metrics
  const wordCount = useMemo(() => {
    return (formData.content || '').split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const estReadTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const titleLength = (formData.title || '').length;
  const isTitleOptimal = titleLength >= 30 && titleLength <= 70;
  const isSlugReady = Boolean(formData.slug && formData.slug.length >= 4);
  const isContentLongEnough = wordCount >= 100;

  const metaTitleLength = (formData.metaTitle || '').length;
  const isMetaTitleOptimal = metaTitleLength >= 40 && metaTitleLength <= 65;
  const metaDescLength = (formData.metaDescription || '').length;
  const isMetaDescOptimal = metaDescLength >= 110 && metaDescLength <= 165;

  const autoFillMetaTitle = () => {
    if (!formData.title) {
      toast.error("Please enter an article title first");
      return;
    }
    const generated = `${formData.title.trim()} | NeoParlour`;
    setFormData(prev => ({ ...prev, metaTitle: generated.slice(0, 65) }));
    toast.success("Meta title auto-filled! ✨");
  };

  const autoGenerateMetaDescription = () => {
    if (!formData.content) {
      toast.error("Please enter article content first");
      return;
    }
    const cleanText = formData.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/<!--.*?-->/g, '')
      .replace(/\\"/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) {
      toast.error("No text found in content");
      return;
    }
    const snippet = cleanText.length > 155 ? `${cleanText.slice(0, 152)}...` : cleanText;
    setFormData(prev => ({ ...prev, metaDescription: snippet }));
    toast.success("Meta description generated from content! ✨");
  };

  const autoSuggestMetaKeywords = () => {
    const keywords = [
      formData.category,
      formData.title ? formData.title.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 3).join(' ') : '',
      'salon tips',
      'hair and beauty',
      'NeoParlour'
    ].filter(Boolean).join(', ');
    setFormData(prev => ({ ...prev, metaKeywords: keywords }));
    toast.success("SEO keywords auto-suggested! ✨");
  };

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchCat = selectedCategory === 'ALL' || (b.category || '') === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const publishedCount = blogs.filter(b => b.isPublished).length;
  const draftCount = blogs.filter(b => !b.isPublished).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-[#FF2A14] border border-red-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF2A14] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-500/20">
                SEO & Content Engine
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Editorial Blog Manager
              </h1>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 pl-1">
            Author SEO-optimized articles, format with rich styling tools, and manage public sitemap visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canProvisionSeo && (
            <button
              type="button"
              onClick={() => setShowSeoModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="Provision a new platform SEO Admin user"
            >
              <Globe className="w-4 h-4" /> Provision SEO Admin
            </button>
          )}
          
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-[#FF2A14] hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create New Blog
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Articles</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>{blogs.length}</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">All Time</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live on Website</div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> {publishedCount} Published
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Drafts in Progress</div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {draftCount} Drafts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Topics</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> {CATEGORIES.length} Categories
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-2.5 flex-1">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search articles by title, author, slug or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none placeholder-slate-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FF2A14] text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#FF2A14] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading editorial articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">No blog posts found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="py-3.5 sm:py-4 px-3 sm:px-6 hidden sm:table-cell">ID</th>
                  <th className="py-3.5 sm:py-4 px-4 sm:px-6">Title & Category</th>
                  <th className="py-3.5 sm:py-4 px-3 sm:px-6 hidden md:table-cell">Author</th>
                  <th className="py-3.5 sm:py-4 px-3 sm:px-6">Status</th>
                  <th className="py-3.5 sm:py-4 px-3 sm:px-6 hidden lg:table-cell">Date</th>
                  <th className="py-3.5 sm:py-4 px-3 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs font-semibold">
                {filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 sm:py-4 px-3 sm:px-6 font-bold text-slate-400 font-mono hidden sm:table-cell">#{post.id}</td>
                    <td className="py-3.5 sm:py-4 px-4 sm:px-6 max-w-md">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-[#FF2A14] uppercase tracking-wider">{post.category || 'General'}</span>
                        {post.slug && (
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                            /{post.slug}
                          </span>
                        )}
                        {(Boolean(post.metaTitle) || (post.content && post.content.includes('<!--seo_meta:'))) && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="SEO Meta tags configured">
                            SEO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 sm:py-4 px-3 sm:px-6 text-slate-600 dark:text-zinc-300 hidden md:table-cell">{post.author || 'Editorial'}</td>
                    <td className="py-3.5 sm:py-4 px-3 sm:px-6">
                      {post.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 sm:py-4 px-3 sm:px-6 text-slate-400 dark:text-zinc-500 font-mono text-[11px] hidden lg:table-cell">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 sm:py-4 px-3 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.slug && (
                          <a
                            href={`/blogs/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                            title="View Public Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(post.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT ARTICLE MODAL (Portal to document.body fixes blur bug)       */}
      {/* ========================================================================= */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
            
            {/* 1. STICKY MODAL HEADER */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-red-500/10 text-[#FF2A14] border border-red-500/20">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingBlog ? `Edit Article #${editingBlog.id}` : 'Create SEO Blog Article'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium line-clamp-1 sm:line-clamp-none">
                    Compose with rich typography tools, verify SEO score, and preview live customer rendering
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE FORM BODY */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-6">
              
              {/* Title & SEO Slug */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      Article Title <span className="text-[#FF2A14]">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${
                      isTitleOptimal ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {titleLength}/70 chars {isTitleOptimal ? '(Optimal for Google)' : '(Aim for 30-70)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. 10 Best Hair Spa & Keratin Treatments in 2026..."
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14] transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Slug */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      SEO URL Slug
                    </label>
                    <div className="flex items-center rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden">
                      <span className="pl-3.5 pr-1 text-[11px] font-mono text-slate-400 select-none">
                        /blogs/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                        placeholder="auto-generated-slug"
                        className="w-full py-2.5 pr-3 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Author */}
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="e.g. SEO Editorial Team"
                      className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                    />
                  </div>

                  {/* Cover Image Upload & Disk Storage */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                        Cover Image
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowManualCoverUrl(!showManualCoverUrl)}
                        className="text-[10px] font-bold text-slate-400 hover:text-[#FF2A14] transition-colors"
                      >
                        {showManualCoverUrl ? "Hide Direct URL" : "Enter External URL"}
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={coverFileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />

                    {formData.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 h-28 flex items-center justify-center">
                        <img
                          src={formData.imageUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            disabled={isUploadingCover}
                            className="px-2.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                          >
                            {isUploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF2A14]" /> : <Upload className="w-3.5 h-3.5" />}
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                            className="p-1.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700 cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white flex items-center gap-1 backdrop-blur-sm">
                          <Check className="w-3 h-3 text-emerald-400" /> Disk Stored
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isUploadingCover && coverFileInputRef.current?.click()}
                        className={`border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#FF2A14] dark:hover:border-[#FF2A14] rounded-xl p-3.5 text-center cursor-pointer transition-all bg-white dark:bg-zinc-800 hover:bg-red-50/20 ${
                          isUploadingCover ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploadingCover ? (
                          <div className="flex flex-col items-center justify-center py-1">
                            <Loader2 className="w-5 h-5 animate-spin text-[#FF2A14] mb-1" />
                            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Saving to server disk...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-1">
                            <UploadCloud className="w-6 h-6 text-[#FF2A14] mb-1 stroke-[1.75]" />
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              Upload Cover Image from Computer
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB (saved to disk)</span>
                          </div>
                        )}
                      </div>
                    )}

                    {showManualCoverUrl && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="Or paste external URL (e.g. https://...)"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Real-time SEO Readiness Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-200">
                  <BarChart3 className="w-4 h-4 text-[#FF2A14]" />
                  <span>SEO Score Factors:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                  <span className={`flex items-center gap-1 ${isTitleOptimal ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isTitleOptimal ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Title (30-70 chars)
                  </span>
                  <span className={`flex items-center gap-1 ${isMetaTitleOptimal ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isMetaTitleOptimal ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Meta Title (40-65 chars)
                  </span>
                  <span className={`flex items-center gap-1 ${isMetaDescOptimal ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isMetaDescOptimal ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Meta Desc (110-165 chars)
                  </span>
                  <span className={`flex items-center gap-1 ${isSlugReady ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isSlugReady ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Valid Slug
                  </span>
                  <span className={`flex items-center gap-1 ${isContentLongEnough ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isContentLongEnough ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Length ({wordCount} words)
                  </span>
                  <span className={`flex items-center gap-1 ${Boolean(formData.imageUrl) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {Boolean(formData.imageUrl) ? <Check className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                    Cover Image
                  </span>
                </div>
              </div>

              {/* Related Articles Configuration with Paginated Dropdown & Infinite Scroll */}
              <div ref={dropdownRef} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 space-y-3 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Related Articles (Left Sidebar Links)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Choose existing published articles to recommend on the left side of this blog.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                      {formData.relatedBlogIds.length} Linked
                    </span>
                    {formData.relatedBlogIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, relatedBlogIds: [] }))}
                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Related Articles Pills */}
                {formData.relatedBlogIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    {formData.relatedBlogIds.map(relId => {
                      const relBlog = blogs.find(b => String(b.id) === String(relId) || b.slug === String(relId));
                      const label = relBlog ? relBlog.title : `Article #${relId}`;
                      return (
                        <div
                          key={relId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs group"
                        >
                          <span className="max-w-[200px] truncate">{label}</span>
                          {relBlog?.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 font-semibold">
                              {relBlog.category}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleRelatedBlog(relId)}
                            className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                            title="Remove link"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown Toggle Trigger Button */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(prev => !prev)}
                      className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer bg-white dark:bg-zinc-800 shadow-2xs ${
                        isDropdownOpen 
                          ? 'border-[#FF2A14] ring-2 ring-red-500/10 text-slate-900 dark:text-white' 
                          : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Link2 className="w-4 h-4 text-[#FF2A14] shrink-0" />
                        <span className="truncate">
                          {formData.relatedBlogIds.length === 0
                            ? 'Select articles to link from catalog...'
                            : `${formData.relatedBlogIds.length} article${formData.relatedBlogIds.length === 1 ? '' : 's'} selected (Click to view/add more)`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-slate-500 font-semibold">
                          {candidateRelatedBlogs.length} Available
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Quick Button: Link Category Peers */}
                    <button
                      type="button"
                      onClick={() => {
                        const peers = blogs
                          .filter(b => b.id !== (editingBlog?.id || -1) && b.category === formData.category)
                          .map(b => String(b.id));
                        const merged = Array.from(new Set([...formData.relatedBlogIds, ...peers]));
                        setFormData(prev => ({ ...prev, relatedBlogIds: merged }));
                        toast.success(`Linked ${peers.length} articles from "${formData.category}"!`);
                      }}
                      className="px-3.5 py-2.5 rounded-xl text-[11px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition cursor-pointer whitespace-nowrap shadow-2xs"
                      title={`Quick link all articles in ${formData.category}`}
                    >
                      + Link all "{formData.category}"
                    </button>
                  </div>

                  {/* Dropdown Menu Container */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* Search Bar inside Dropdown */}
                      <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            value={relatedSearchTerm}
                            onChange={(e) => setRelatedSearchTerm(e.target.value)}
                            placeholder="Search by title, topic, or category..."
                            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                          />
                          {relatedSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setRelatedSearchTerm('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                          {relatedSearchTerm ? `${candidateRelatedBlogs.length} Found` : 'Latest on top'}
                        </span>
                      </div>

                      {/* Paginated Scrollable List with Infinite Scroll */}
                      <div
                        onScroll={handleDropdownScroll}
                        className="max-h-64 sm:max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1 divide-y divide-slate-100/60 dark:divide-zinc-800/60"
                      >
                        {paginatedCandidateBlogs.length > 0 ? (
                          paginatedCandidateBlogs.map((item) => {
                            const isSelected = formData.relatedBlogIds.some(id => String(id) === String(item.id) || String(id) === item.slug);
                            const itemDate = item.createdAt 
                              ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Recent';

                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleRelatedBlog(item.id)}
                                className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-red-50/80 dark:bg-red-950/40 text-red-600 font-bold border border-red-200/60 dark:border-red-900/40'
                                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Custom Checkbox */}
                                  <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                                    isSelected 
                                      ? 'bg-[#FF2A14] border-[#FF2A14] text-white shadow-xs' 
                                      : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>

                                  {/* Thumbnail preview */}
                                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                                    <img
                                      src={item.imageUrl || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=200"}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Title & Metadata */}
                                  <div className="min-w-0">
                                    <p className={`truncate text-xs ${isSelected ? 'text-red-700 dark:text-red-300 font-bold' : 'text-slate-900 dark:text-white'}`}>
                                      {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      {item.category && (
                                        <span className="font-semibold text-slate-500 dark:text-zinc-400">
                                          {item.category}
                                        </span>
                                      )}
                                      <span>•</span>
                                      <span className="font-mono">{itemDate}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 pl-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isSelected
                                      ? 'bg-red-100 dark:bg-red-900/60 text-[#FF2A14]'
                                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                                  }`}>
                                    {isSelected ? 'Linked' : '+ Link'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400">
                            <BookOpen className="w-7 h-7 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                            <p className="font-bold">No articles match your search.</p>
                            <p className="text-[11px] mt-0.5">Try searching with different keywords.</p>
                          </div>
                        )}

                        {/* Infinite Scroll Indicator */}
                        {hasMoreCandidates && (
                          <div className="py-2.5 text-center text-[11px] font-bold text-slate-400 bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl flex items-center justify-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF2A14]" />
                            <span>Scroll down to load more ({paginatedCandidateBlogs.length} of {candidateRelatedBlogs.length})</span>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Footer Status */}
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Showing {paginatedCandidateBlogs.length} of {candidateRelatedBlogs.length} articles</span>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-[#FF2A14] hover:underline font-bold cursor-pointer"
                        >
                          Done selecting
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {formData.relatedBlogIds.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Smart Fallback: When no specific articles are selected, the reader's left sidebar automatically recommends the latest articles from the <strong className="text-slate-600 dark:text-zinc-300">"{formData.category}"</strong> category.
                  </p>
                )}
              </div>

              {/* Google Search SERP Snippet & Meta Tags */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Google Search Meta Tags & SERP Preview
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Customize your article's title tag, description, and keywords for search engines and social links.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Meta Inputs */}
                  <div className="space-y-3.5">
                    {/* Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          Meta Title (SEO Title)
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isMetaTitleOptimal 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-700'
                          }`}>
                            {metaTitleLength}/60
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={autoFillMetaTitle}
                          className="text-[10px] font-bold text-[#FF2A14] hover:underline cursor-pointer"
                        >
                          Auto-fill from Title
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                        maxLength={75}
                        placeholder="e.g. 5 Best Pre-Bridal Skincare Treatments | NeoParlour"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Recommended: 40-65 characters. Appears as the clickable blue headline in Google.
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          Meta Description
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isMetaDescOptimal 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                              : 'bg-slate-100 text-slate-500 dark:bg-zinc-700'
                          }`}>
                            {metaDescLength}/160
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={autoGenerateMetaDescription}
                          className="text-[10px] font-bold text-[#FF2A14] hover:underline cursor-pointer"
                        >
                          Generate from Content
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        maxLength={200}
                        placeholder="Concise, enticing summary to boost organic click-through rate from Google searchers..."
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14] resize-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Recommended: 110-165 characters. Concise summaries earn more clicks on Google.
                      </p>
                    </div>

                    {/* Meta Keywords */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                          Meta Keywords
                        </label>
                        <button
                          type="button"
                          onClick={autoSuggestMetaKeywords}
                          className="text-[10px] font-bold text-[#FF2A14] hover:underline cursor-pointer"
                        >
                          Auto-suggest
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.metaKeywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="bridal skincare, hydrafacial, salon tips, parlour near me"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Google SERP Snippet Preview Card */}
                  <div className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#FF2A14]" /> Live Google Search SERP Snippet
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
                          SERP Preview
                        </span>
                      </div>

                      {/* Google Result Preview */}
                      <div className="space-y-1.5 font-sans">
                        {/* URL / Breadcrumb */}
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#FF2A14] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                            N
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 leading-tight">NeoParlour</span>
                            <span className="text-[10px] text-slate-500 font-mono leading-tight truncate max-w-[280px]">
                              https://neoparlour.com &gt; blogs &gt; {formData.slug || 'article-slug'}
                            </span>
                          </div>
                        </div>

                        {/* Blue Title Link */}
                        <h5 className="text-[15px] font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1 pt-1 leading-snug">
                          {formData.metaTitle || formData.title || 'Pre-Bridal Skincare Guide & Expert Salon Advice'}
                        </h5>

                        {/* Snippet Description */}
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                          {formData.metaDescription || 
                            (formData.content 
                              ? formData.content.replace(/<[^>]+>/g, ' ').replace(/<!--.*?-->/g, '').replace(/\s+/g, ' ').trim().slice(0, 155) + '...'
                              : 'Discover top dermatologist-approved pre-bridal skin treatments, pricing details, and salon secrets on NeoParlour.')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> JSON-LD Schema: BlogPosting Active
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> SERP Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editor Tabs & Quick Action Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorTab('editor')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                        editorTab === 'editor'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" /> ✍️ Content Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                        editorTab === 'preview'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> 👁️ Live Customer Preview
                    </button>
                  </div>

                  {editorTab === 'editor' && (
                    <button
                      type="button"
                      onClick={insertSeoOutlineTemplate}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> ⚡ 1-Click SEO Outline
                    </button>
                  )}
                </div>

                {editorTab === 'editor' ? (
                  <div className="space-y-2">
                    
                    {/* Rich Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700 rounded-2xl">
                      
                      {/* Bold */}
                      <button
                        type="button"
                        onClick={() => applyFormat('<strong>', '</strong>', 'bold text')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      {/* Italic */}
                      <button
                        type="button"
                        onClick={() => applyFormat('<em>', '</em>', 'italic text')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>

                      {/* Underline */}
                      <button
                        type="button"
                        onClick={() => applyFormat('<u>', '</u>', 'underlined text')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>

                      {/* Strike */}
                      <button
                        type="button"
                        onClick={() => applyFormat('<s>', '</s>', 'strikethrough text')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-6 bg-slate-300 dark:bg-zinc-600 mx-1" />

                      {/* Heading 2 */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<h2>', '</h2>\n', 'Major Section Heading')}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 text-xs font-black shadow-2xs transition cursor-pointer"
                        title="Heading 2 (H2)"
                      >
                        H2
                      </button>

                      {/* Heading 3 */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<h3>', '</h3>\n', 'Sub-heading')}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 text-xs font-black shadow-2xs transition cursor-pointer"
                        title="Heading 3 (H3)"
                      >
                        H3
                      </button>

                      {/* Paragraph */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<p>', '</p>\n', 'Article paragraph text')}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 text-xs font-black shadow-2xs transition cursor-pointer"
                        title="Paragraph"
                      >
                        ¶
                      </button>

                      <div className="w-[1px] h-6 bg-slate-300 dark:bg-zinc-600 mx-1" />

                      {/* Bullet List */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<ul>\n  <li>', '</li>\n  <li>Second key takeaway</li>\n</ul>\n', 'First key takeaway')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>

                      {/* Numbered List */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<ol>\n  <li>', '</li>\n  <li>Step 2 instructions</li>\n</ol>\n', 'Step 1 instructions')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      {/* Blockquote */}
                      <button
                        type="button"
                        onClick={() => applyFormat('\n<blockquote class="border-l-4 border-[#FF2A14] pl-4 italic my-4 text-slate-600 dark:text-zinc-300">"', '" — Stylist Quote</blockquote>\n', 'Client experience is our top priority.')}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Blockquote"
                      >
                        <Quote className="w-4 h-4" />
                      </button>

                      {/* Pro Tip Callout Box */}
                      <button
                        type="button"
                        onClick={() => insertCalloutBox('tip')}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#FF2A14] hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Pro Stylist Callout Box"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Tip Box</span>
                      </button>

                      {/* Warning Callout Box */}
                      <button
                        type="button"
                        onClick={() => insertCalloutBox('warning')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Important Note Box"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Note Box</span>
                      </button>

                      <div className="w-[1px] h-6 bg-slate-300 dark:bg-zinc-600 mx-1" />

                      {/* Hyperlink */}
                      <button
                        type="button"
                        onClick={insertLink}
                        className="p-2 rounded-xl bg-white dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 shadow-2xs transition cursor-pointer"
                        title="Insert Hyperlink"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>

                      {/* Hidden Inline Image File Picker */}
                      <input
                        type="file"
                        ref={inlineFileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        onChange={handleInlineImageUpload}
                      />

                      {/* Image figure (Upload from disk or URL) */}
                      <div className="flex items-center rounded-xl overflow-hidden shadow-2xs border border-slate-200 dark:border-zinc-650 bg-white dark:bg-zinc-700">
                        <button
                          type="button"
                          onClick={insertImage}
                          disabled={isUploadingInline}
                          className="px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 transition cursor-pointer flex items-center gap-1.5"
                          title="Upload image from computer to article (Saved to disk)"
                        >
                          {isUploadingInline ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#FF2A14]" />
                          ) : (
                            <Image className="w-4 h-4 text-[#FF2A14]" />
                          )}
                          <span className="text-[11px] font-bold hidden sm:inline">Upload</span>
                        </button>
                        <button
                          type="button"
                          onClick={insertImageViaUrl}
                          className="px-2 py-2 border-l border-slate-200 dark:border-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-600 text-slate-500 dark:text-zinc-300 transition cursor-pointer text-[10px] font-bold"
                          title="Or insert image via external URL"
                        >
                          URL
                        </button>
                      </div>

                      <div className="w-[1px] h-6 bg-slate-300 dark:bg-zinc-600 mx-1" />

                      {/* Color Accents */}
                      <div className="flex items-center gap-1.5 pl-1">
                        <button
                          type="button"
                          onClick={() => insertColor('#FF2A14', 'Neo Red')}
                          className="w-5 h-5 rounded-full bg-[#FF2A14] hover:scale-110 transition shadow-2xs cursor-pointer border border-white"
                          title="Neo Red Text"
                        />
                        <button
                          type="button"
                          onClick={() => insertColor('#4F46E5', 'Indigo')}
                          className="w-5 h-5 rounded-full bg-indigo-600 hover:scale-110 transition shadow-2xs cursor-pointer border border-white"
                          title="Indigo Text"
                        />
                        <button
                          type="button"
                          onClick={() => insertColor('#D97706', 'Amber')}
                          className="w-5 h-5 rounded-full bg-amber-600 hover:scale-110 transition shadow-2xs cursor-pointer border border-white"
                          title="Amber Text"
                        />
                        <button
                          type="button"
                          onClick={() => insertColor('#059669', 'Emerald')}
                          className="w-5 h-5 rounded-full bg-emerald-600 hover:scale-110 transition shadow-2xs cursor-pointer border border-white"
                          title="Emerald Green Text"
                        />
                      </div>

                    </div>

                    {/* Textarea Editor Canvas */}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        required
                        rows="14"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write or style article content using the toolbar above..."
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14] custom-scrollbar"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-2 pt-1.5">
                        <span>Rich HTML & Markdown markup enabled</span>
                        <span>{wordCount} Words • {estReadTime} min read</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Live Customer Preview Canvas */
                  <div className="p-6 sm:p-8 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 rounded-3xl min-h-[380px] max-h-[500px] overflow-y-auto custom-scrollbar">
                    <div className="mb-4 pb-3 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF2A14] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                        {formData.category || 'Styling Tips'}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {formData.author || 'Editorial'} • {estReadTime} min read
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">
                      {formData.title || 'Untitled Blog Post'}
                    </h1>

                    {formData.imageUrl && (
                      <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-100 dark:border-zinc-700">
                        <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div 
                      className="blog-content text-sm text-slate-700 dark:text-zinc-300 space-y-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(formData.content) || '<p class="text-slate-400 italic">No content written yet. Switch to Content Editor to start writing.</p>' }}
                    />
                  </div>
                )}

              </div>

            </div>

            {/* 3. STICKY MODAL FOOTER (Always visible, never pushed off-screen) */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 bg-slate-50/90 dark:bg-zinc-900/95 backdrop-blur-sm">
              
              {/* Left: Publish Status Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="isPublishedToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-[#FF2A14] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {formData.isPublished 
                    ? 'Publish Live (Visible on public blog & sitemap.xml)' 
                    : 'Save as Private Draft (Hidden from crawlers)'}
                </span>
              </label>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, isPublished: false }));
                    setTimeout(() => handleSave(), 10);
                  }}
                  disabled={saving}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#FF2A14] hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-md shadow-red-500/25 flex items-center gap-2 active:scale-95"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{formData.isPublished ? 'Publish Article' : 'Save Article'}</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* DELETE MODAL (Portaled to document.body)                                  */}
      {/* ========================================================================= */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-zinc-800 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed mt-1">
                Are you sure you want to delete this blog post? It will be permanently removed from the public website and sitemap index.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-red-500/20 transition"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Provision SEO Admin Modal */}
      <CreateSeoAdminModal
        isOpen={showSeoModal}
        onClose={() => setShowSeoModal(false)}
        onSuccess={() => fetchBlogs()}
      />

    </div>
  );
};

export default AdminBlogManager;
