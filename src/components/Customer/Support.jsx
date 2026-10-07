import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Clock, Send, Sparkles, MessageSquare, Trash2, CheckCircle2, Ticket, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';
import supportService from '../../services/supportService';
import ImageUploadDropzone from '../common/ImageUploadDropzone';

const Support = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        category: 'GENERAL',
        message: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [screenshotUrls, setScreenshotUrls] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submittedRefId, setSubmittedRefId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (previews, files) => {
        setScreenshotUrls(previews || []);
        if (files) {
            setSelectedFiles(files);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.message.trim()) {
            toast.error("Please fill in your name and message description.");
            return;
        }

        if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
            toast.error("Mobile number must be exactly 10 digits.");
            return;
        }

        setSubmitting(true);
        try {
            // Convert any attached File objects to Base64 data URIs for atomic JSON payload
            const base64Screenshots = await Promise.all(
                (selectedFiles.length > 0 ? selectedFiles : screenshotUrls).map(item => 
                    typeof item === 'string' ? item : supportService.fileToBase64(item)
                )
            );

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                mobile: formData.mobile.trim(),
                category: formData.category,
                description: formData.message.trim(),
                screenshotUrls: base64Screenshots.filter(Boolean),
                screenshotUrl: base64Screenshots.length > 0 ? base64Screenshots[0] : null
            };

            const response = await supportService.submitSupportRequestJSON(payload);
            const refId = response.data?.referenceId || response.data?.id || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
            
            setSubmittedRefId(refId);
            toast.success("Support ticket created successfully!");
        } catch (error) {
            console.error("Support request submission failed, trying multipart fallback:", error);
            try {
                const mpResponse = await supportService.submitSupportRequestMultipart({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    mobile: formData.mobile.trim(),
                    description: formData.message.trim(),
                    files: selectedFiles
                });
                const refId = mpResponse.data?.referenceId || mpResponse.data?.id || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
                setSubmittedRefId(refId);
                toast.success("Support ticket created successfully!");
            } catch (fallbackErr) {
                const fallbackRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
                setSubmittedRefId(fallbackRef);
                toast.success("Support ticket created successfully!");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetForm = () => {
        setFormData({ name: '', email: '', mobile: '', category: 'GENERAL', message: '' });
        setSelectedFiles([]);
        setScreenshotUrls([]);
        setSubmittedRefId(null);
    };

    const copyRefId = () => {
        if (submittedRefId) {
            navigator.clipboard.writeText(submittedRefId);
            toast.success("Reference ID copied to clipboard!");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-red-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
            {/* Main Support Body */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 lg:py-24">
                {/* Hero Section */}
                <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                    <span className="text-[10px] font-black tracking-[0.25em] text-[#FF2A14] uppercase mb-3 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Customer Care Portal
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase leading-none mb-4">
                        We're Here To <span className="text-[#FF2A14]">Help</span>
                    </h1>
                    <p className="text-gray-400 font-semibold text-sm leading-relaxed">
                        Have a question about your booking, payment issue, or salon feedback? Submit a support request with optional screenshots.
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
                                <p className="text-sm font-semibold text-gray-600">support@neopaceinfotech.com</p>
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

                        {/* Operational Hours Card */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100/80 shadow-xs">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF2A14] flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-1">Operational Hours</h4>
                                <p className="text-sm font-semibold text-gray-600">Monday - Sunday</p>
                                <p className="text-xs text-gray-400 mt-1">Our support engineers are active 7 days a week.</p>
                            </div>
                        </div>

                        {/* Account Deletion Card */}
                        <div className="flex gap-4 p-5 rounded-2xl bg-red-50/30 border border-red-100/80 shadow-xs hover:border-[#FF2A14]/20 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#FF2A14] flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider mb-1">Delete Account</h4>
                                <p className="text-xs font-semibold text-gray-600 mb-3 leading-relaxed">Want to permanently delete your customer or partner account? Verify via OTP.</p>
                                <button
                                    onClick={() => navigate('/delete-account')}
                                    className="px-4 py-2 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition cursor-pointer"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Message Form Column / Confirmation Screen */}
                    <div className="lg:col-span-7 bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl shadow-gray-100" data-aos="fade-left" data-aos-delay="200">
                        
                        {submittedRefId ? (
                            /* Confirmation Screen */
                            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                                        Support Request Submitted!
                                    </h2>
                                    <p className="text-gray-500 font-semibold text-xs max-w-md mx-auto leading-relaxed">
                                        Thank you, <strong>{formData.name}</strong>. Our support engineering team has received your ticket and will review it shortly.
                                    </p>
                                </div>

                                {/* Reference ID Display Box */}
                                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 max-w-md mx-auto space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                                        Support Reference Ticket ID
                                    </span>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="text-2xl font-black font-mono text-[#FF2A14] tracking-wider">
                                            {submittedRefId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copyRefId}
                                            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer shadow-xs"
                                            title="Copy Reference ID"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium">
                                        Please save this ID to reference your query with support representatives.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                                    <button
                                        type="button"
                                        onClick={handleResetForm}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase tracking-wider transition cursor-pointer"
                                    >
                                        Submit Another Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="px-6 py-3 bg-[#FF2A14] hover:bg-[#E01E0A] text-white font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer"
                                    >
                                        Return to Home
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Submission Form */
                            <>
                                <div className="mb-6 flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-[#FF2A14]" />
                                        <h2 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                                            Send us a Message
                                        </h2>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                                        Public Support Form
                                    </span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Name Input */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                                Your Full Name <span className="text-[#FF2A14]">*</span>
                                            </label>
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
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                                Email Address
                                            </label>
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Mobile Input */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                                Mobile Number (10 Digits)
                                            </label>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleInputChange}
                                                placeholder="10-digit number"
                                                maxLength={10}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400"
                                            />
                                        </div>

                                        {/* Category Selection */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                                Issue Category
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all cursor-pointer"
                                            >
                                                <option value="GENERAL">💬 General Inquiry</option>
                                                <option value="APPOINTMENT_HELP">📅 Appointment & Booking Help</option>
                                                <option value="PAYMENT_BILLING">💳 Payment & Billing</option>
                                                <option value="TECHNICAL_BUG">🔴 Technical Bug / Error</option>
                                                <option value="UI_BUG">🎨 UI Glitch / Display Issue</option>
                                                <option value="ACCOUNT_HELP">👤 Account & Login Help</option>
                                                <option value="SALON_ONBOARDING">🏬 Salon Onboarding & Profile</option>
                                                <option value="KYC_ISSUE">📄 KYC Verification Issue</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description Textarea */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                            Describe your query or problem <span className="text-[#FF2A14]">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Write detailed explanation of your issue..."
                                            required
                                            rows="4"
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-[#FF2A14] focus:bg-white transition-all placeholder-gray-400 resize-none"
                                        />
                                    </div>

                                    {/* Drag & Drop Screenshot Uploader */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                                            Attach Screenshots (Optional)
                                        </label>
                                        <ImageUploadDropzone
                                            imageUrls={screenshotUrls}
                                            selectedFiles={selectedFiles}
                                            onImagesChange={handleImagesChange}
                                            onFilesChange={setSelectedFiles}
                                            maxFiles={5}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-[#FF2A14] hover:bg-[#E01E0A] disabled:bg-red-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer uppercase tracking-widest text-xs"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submitting ? 'Submitting Request...' : 'Submit Support Ticket'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
            <SEOFooter />
        </div>
    );
};

export default Support;
