import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, FileText, Sparkles, X, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService } from '../../services/blogService';

const SAMPLE_BLOGS = [
  {
    id: 1,
    title: "5 Summer Haircare Routines Recommended by Top Stylists",
    slug: "5-summer-haircare-routines-recommended-by-top-stylists",
    category: "Styling Tips",
    author: "Elena Rostova",
    createdAt: "2026-06-10T10:00:00Z",
    readTime: "4 min read",
    content: "Keep your locks glowing and protected under the sun. Our partner stylists share their secret hydration formulas...",
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
    content: "From AI-powered slot scheduling to automated inventory notifications...",
    imageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfea48342?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  }
];

const slugify = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const AdminBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Styling Tips',
    author: '',
    imageUrl: '',
    content: '',
    isPublished: true
  });

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
      console.warn("Using sample admin blogs:", err.message);
      setBlogs(SAMPLE_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Styling Tips',
      author: 'Admin',
      imageUrl: '',
      content: '',
      isPublished: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || slugify(blog.title),
      category: blog.category || 'Styling Tips',
      author: blog.author || 'Admin',
      imageUrl: blog.imageUrl || '',
      content: blog.content || '',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true
    });
    setShowModal(true);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: editingBlog ? prev.slug : slugify(val)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Blog content is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        slug: formData.slug || slugify(formData.title)
      };

      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, payload);
        toast.success("Blog post updated successfully!");
      } else {
        await blogService.createBlog(payload);
        toast.success("Blog post published successfully!");
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await blogService.deleteBlog(deletingId);
      toast.success("Blog post deleted successfully");
      setShowDeleteModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete blog post");
    }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#FF2A14]" /> Admin Blog Manager
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-1">
            Create, edit, publish, and manage public articles & journal entries.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#FF2A14] hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Blog
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by title, author, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading blogs...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">No blog posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Title & Category</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs font-semibold">
                {filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-4 px-6 font-bold text-slate-400">#{post.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{post.title}</div>
                      <span className="text-[9px] font-black text-[#FF2A14] uppercase tracking-wider">{post.category || 'General'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-zinc-300 font-bold">{post.author || 'Admin'}</td>
                    <td className="py-4 px-6">
                      {post.isPublished !== false ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full uppercase border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase border border-amber-200 dark:border-amber-800">
                          <XCircle className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400 dark:text-zinc-500 text-[11px]">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blogs/${post.slug || post.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                          title="Preview Blog"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(post.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete"
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog post title..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-slug"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  >
                    <option value="Styling Tips">Styling Tips</option>
                    <option value="Industry Insights">Industry Insights</option>
                    <option value="Trends">Trends</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Content (Rich Text / HTML) *</label>
                <textarea
                  required
                  rows="6"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write article content here..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublishedToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-[#FF2A14]"
                />
                <label htmlFor="isPublishedToggle" className="text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer">
                  Publish Article Immediately (Visible to Public)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#FF2A14] hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Blog Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBlogManager;
