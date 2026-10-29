import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    Sparkles, 
    MapPin, 
    Clock, 
    Send, 
    CheckCircle2, 
    Heart, 
    Zap, 
    Users, 
    Coffee, 
    ChevronRight,
    Mail,
    Phone
} from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import SEOFooter from '../common/SEOFooter';

export default function Careers() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isDark = false } = useDarkMode() || {};
    const [selectedRole, setSelectedRole] = useState(null);

    const openPositions = [
        {
            id: 'fe-dev',
            title: 'Frontend React Developer',
            department: 'Engineering',
            location: 'Pune / Hybrid',
            type: 'Full-time',
            description: 'Lead the frontend architecture of our customer and salon partner web apps using React 18, Vite, and Tailwind CSS.',
            requirements: ['2+ years of React.js & modern JavaScript', 'Strong experience with responsive layouts and Tailwind CSS', 'Experience with REST APIs and state management']
        },
        {
            id: 'partner-success',
            title: 'Salon Partner Success Executive',
            department: 'Operations',
            location: 'Pune (Field + Office)',
            type: 'Full-time',
            description: 'Onboard premium salons, guide owners through CRM features, and drive daily engagement with our salon SaaS ecosystem.',
            requirements: ['Strong verbal communication in Hindi, Marathi, and English', 'Demonstrated sales or client onboarding experience', 'Passion for the salon and beauty industry']
        },
        {
            id: 'backend-eng',
            title: 'Backend API Engineer',
            department: 'Engineering',
            location: 'Pune / Hybrid',
            type: 'Full-time',
            description: 'Build robust microservices, booking engine queues, payout settlement pipelines, and real-time appointment sync.',
            requirements: ['Experience with Java Spring Boot or Node.js', 'PostgreSQL or MySQL relational database design', 'Familiarity with cloud hosting and payment gateways']
        },
        {
            id: 'product-designer',
            title: 'UI/UX Product Designer',
            department: 'Product',
            location: 'Remote / Pune',
            type: 'Full-time',
            description: 'Design intuitive, frictionless booking experiences for end-customers and high-efficiency workflow interfaces for salon managers.',
            requirements: ['Proficiency with Figma and design systems', 'Proven portfolio in consumer mobile/web applications', 'Strong empathy for user workflows']
        }
    ];

    const perks = [
        {
            icon: <Zap className="w-6 h-6 text-red-500" />,
            title: 'High-Impact Work',
            desc: 'Directly empower thousands of salon owners, stylists, and clients every single day.'
        },
        {
            icon: <Heart className="w-6 h-6 text-red-500" />,
            title: 'Wellness & Salon Perks',
            desc: 'Complimentary salon credits, health benefits, and wellness package discounts.'
        },
        {
            icon: <Users className="w-6 h-6 text-red-500" />,
            title: 'Collaborative Culture',
            desc: 'A flat hierarchy where great ideas win, backed by fast-paced ownership.'
        },
        {
            icon: <Coffee className="w-6 h-6 text-red-500" />,
            title: 'Flexible & Modern',
            desc: 'Hybrid work model with flexible hours and top-notch equipment.'
        }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col justify-between overflow-x-hidden ${
            isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'
        }`}>
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-12 lg:py-20">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Join Our Team
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight mb-4">
                        Build the Future of <span className="text-red-600">Salon Tech</span>
                    </h1>
                    <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                        At NeoParlour, we are reinventing how salons operate and how customers discover beauty experiences. Come build products that empower thousands of salon entrepreneurs across India.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="mailto:careers@neopaceinfotech.com?subject=Job%20Application%20-%20NeoParlour"
                            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" /> Send Your Resume
                        </a>
                        <a
                            href="https://wa.me/917062888812?text=Hello%20NeoParlour%20HR,%20I%20am%20interested%20in%20career%20opportunities."
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-6 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 ${
                                isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Phone className="w-4 h-4 text-green-500" /> WhatsApp HR
                        </a>
                    </div>
                </div>

                {/* Culture & Perks Grid */}
                <div className="mb-20">
                    <h2 className="text-center text-xs font-extrabold uppercase tracking-widest text-red-600 mb-2">
                        Why Join NeoParlour
                    </h2>
                    <h3 className="text-center text-2xl sm:text-3xl font-black uppercase tracking-tight mb-10">
                        Perks & Culture
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {perks.map((perk, index) => (
                            <div 
                                key={index}
                                className={`p-6 rounded-2xl border transition-all duration-300 ${
                                    isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-gray-200 shadow-xs'
                                }`}
                            >
                                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 w-fit mb-4">
                                    {perk.icon}
                                </div>
                                <h4 className="font-extrabold text-base mb-1 tracking-tight">
                                    {perk.title}
                                </h4>
                                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                                    {perk.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open Positions */}
                <div className="mb-16">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 mb-8">
                        <div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
                                Immediate Openings
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                                Available Roles
                            </h2>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                            {openPositions.length} Positions Active
                        </span>
                    </div>

                    <div className="space-y-4">
                        {openPositions.map((role) => {
                            const isExpanded = selectedRole === role.id;
                            return (
                                <div 
                                    key={role.id}
                                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                        isDark 
                                            ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700' 
                                            : 'bg-white border-gray-200 hover:border-gray-300 shadow-xs'
                                    }`}
                                >
                                    <div 
                                        onClick={() => setSelectedRole(isExpanded ? null : role.id)}
                                        className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-black text-lg tracking-tight">
                                                    {role.title}
                                                </h3>
                                                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                                    {role.department}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-4 text-xs font-semibold ${
                                                isDark ? 'text-zinc-400' : 'text-gray-500'
                                            }`}>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {role.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> {role.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <a
                                                href={`mailto:careers@neopaceinfotech.com?subject=Application%20for%20${encodeURIComponent(role.title)}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                                            >
                                                Apply Now
                                            </a>
                                            <button
                                                type="button"
                                                className={`p-1.5 rounded-lg border text-xs font-bold transition-transform ${
                                                    isExpanded ? 'rotate-90' : ''
                                                } ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-gray-200 text-gray-600'}`}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className={`px-5 sm:px-6 pb-6 pt-2 border-t space-y-4 ${
                                            isDark ? 'border-zinc-800/80 bg-zinc-900/30' : 'border-gray-100 bg-gray-50/50'
                                        }`}>
                                            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                                                {role.description}
                                            </p>
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                                                    What We Are Looking For
                                                </h4>
                                                <ul className={`space-y-1.5 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                                                    {role.requirements.map((req, rIdx) => (
                                                        <li key={rIdx} className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="pt-2">
                                                <a
                                                    href={`mailto:careers@neopaceinfotech.com?subject=Application%20for%20${encodeURIComponent(role.title)}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide"
                                                >
                                                    Send application for this role <ChevronRight className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* General Inquiry Footer Card */}
                <div className={`p-8 rounded-3xl border text-center max-w-2xl mx-auto ${
                    isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                        Don't see your role?
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                        We are always on the lookout for talented engineers, designers, sales leaders, and customer champions. Send us a message telling us how you can make a difference.
                    </p>
                    <a
                        href="mailto:careers@neopaceinfotech.com?subject=General%20Application%20-%20NeoParlour"
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" /> Get in Touch with Us
                    </a>
                </div>
            </main>

            <div className={`w-full border-t ${isDark ? 'border-zinc-900 bg-black' : 'border-gray-200 bg-white'}`}>
                <SEOFooter />
            </div>
        </div>
    );
}
