import ServerMaintenance from '../components/common/ServerMaintenance'
import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import RouteErrorElement from '../components/common/RouteErrorElement'
const CustomerLanding = React.lazy(() => import('../components/CustomerLanding'));
const CustomerLogin = React.lazy(() => import('../components/Customer/CustomerLogin'));
const OwnerLogin = React.lazy(() => import('../components/Owner/OwnerLogin'));
const OwnerForgotPassword = React.lazy(() => import('../components/Owner/OwnerForgotPassword'));
const OwnerRegister = React.lazy(() => import('../components/Owner/OwnerRegister'));
const SalonSelection = React.lazy(() => import('../components/Customer/SalonSelection'));
const Appointments = React.lazy(() => import('../components/Customer/Appointments'));
const SubscriptionPlans = React.lazy(() => import('../components/Owner/SubscriptionPlans'));
const PublicSubscriptionPlans = React.lazy(() => import('../components/PublicSubscriptionPlans'));
const OwnerDashboard = React.lazy(() => import('../components/Owner/OwnerDashboard'));
const Analytics = React.lazy(() => import('../components/Owner/Analytics'));
const Orders = React.lazy(() => import('../components/Owner/Orders'));
const Billing = React.lazy(() => import('../components/Owner/Billing'));
const Settings = React.lazy(() => import('../components/Owner/Settings'));
const ServerHealth = React.lazy(() => import('../components/Owner/ServerHealth'));
const AdminSalons = React.lazy(() => import('../components/Owner/AdminSalons'));
const AdminSubscriptions = React.lazy(() => import('../components/Owner/AdminSubscriptions'));
const Schedule = React.lazy(() => import('../components/Owner/Manage/Schedule'));
const Services = React.lazy(() => import('../components/Owner/Manage/Services'));
const Inventory = React.lazy(() => import('../components/Owner/Manage/Inventory'));
const Staff = React.lazy(() => import('../components/Owner/Manage/Staff'));
const Feedback = React.lazy(() => import('../components/Owner/Manage/Feedback'));
const HomeServices = React.lazy(() => import('../components/Owner/Manage/HomeServices'));
const Subscription = React.lazy(() => import('../components/Owner/Manage/Subscription'));
const AddOffers = React.lazy(() => import('../components/Owner/Manage/AddOffers'));
const AddProducts = React.lazy(() => import('../components/Owner/Manage/AddProducts'));
const AddPackages = React.lazy(() => import('../components/Owner/Manage/AddPackages'));
const WalkInBooking = React.lazy(() => import('../components/Owner/Manage/WalkInBooking'));
const Features = React.lazy(() => import('../components/Customer/Features'));
const HomeScreen = React.lazy(() => import('../components/Customer/HomeScreen'));
const AboutUs = React.lazy(() => import('../components/Customer/AboutUs'));
const SalonPage = React.lazy(() => import('../components/Customer/SalonPage'));
const SelectService = React.lazy(() => import('../components/Customer/SelectService'));
const ProductSearch = React.lazy(() => import('../components/Customer/ProductSearch'));
const ProductDetails = React.lazy(() => import('../components/Customer/ProductDetails'));
const AppointmentSuccess = React.lazy(() => import('../components/Customer/AppointmentSuccess'));
const OrderSuccess = React.lazy(() => import('../components/Customer/OrderSuccess'));
const MyOrders = React.lazy(() => import('../components/Customer/MyOrders'));
const OwnerTermsAndConditions = React.lazy(() => import('../components/Owner/OwnerTermsAndConditions'));
const CustomerTermsAndConditions = React.lazy(() => import('../components/Customer/CustomerTermsAndConditions'));
const PrivacyPolicy = React.lazy(() => import('../components/Customer/CustomerLegalPrivacy'));
const PrivacyPolicyScreen = React.lazy(() => import('../components/Owner/OwnerLegalPrivacy'));
const Support = React.lazy(() => import('../components/Customer/Support'));
const DeleteAccount = React.lazy(() => import('../components/Customer/DeleteAccount'));
const PartnerWithUs = React.lazy(() => import('../components/Customer/PartnerWithUs'));
const SalonsListing = React.lazy(() => import('../components/Customer/SalonsListing'));
const Customers = React.lazy(() => import('../components/Owner/Customers'));
const Favourites = React.lazy(() => import('../components/Customer/Favourites'));
const MySalons = React.lazy(() => import('../components/Customer/MySalons'));
const NotificationsScreen = React.lazy(() => import('../components/Owner/NotificationsScreen'));
const AdminSupportRequests = React.lazy(() => import('../components/Owner/AdminSupportRequests'));
const AdminSupportDashboard = React.lazy(() => import('../components/Admin/AdminSupportDashboard'));
const MaintenanceAdminPage = React.lazy(() => import('../components/Owner/MaintenanceAdminPage'));

// Import New Footer Pages
const InfluencerProgram = React.lazy(() => import('../components/Customer/InfluencerProgram'));
const Blogs = React.lazy(() => import('../components/Customer/Blogs'));
const BlogListingPage = React.lazy(() => import('../components/Customer/BlogListingPage'));
const BlogPostDetailPage = React.lazy(() => import('../components/Customer/BlogPostDetailPage'));
const TestimonialsComponent = React.lazy(() => import('../components/Customer/TestimonialsComponent'));
const AdminBlogManager = React.lazy(() => import('../components/Owner/AdminBlogManager'));
const AdminTestimonialManager = React.lazy(() => import('../components/Owner/AdminTestimonialManager'));
const AdminSeoDirectory = React.lazy(() => import('../components/Owner/AdminSeoDirectory'));
const StaffAttendance = React.lazy(() => import('../components/Owner/StaffAttendance'));
const Cart = React.lazy(() => import('../components/Customer/Cart'));
const Offers = React.lazy(() => import('../components/Customer/Offers'));

// Import Staff Components
const StaffDashboard = React.lazy(() => import('../components/StaffDashboard'));
const StaffRegister = React.lazy(() => import('../staff/StaffRegister'));
const StaffInvitations = React.lazy(() => import('../components/StaffInvitations'));
const OwnerStaffInvitations = React.lazy(() => import('../components/Owner/OwnerStaffInvitations'));
const OwnerKyc = React.lazy(() => import('../components/Owner/KYC/OwnerKyc'));
const AdminKycDashboard = React.lazy(() => import('../components/Owner/AdminKycDashboard'));
const StaffPayoutDashboard = React.lazy(() => import('../pages/staff/StaffPayoutDashboard'));
const AdminPayoutQueueDashboard = React.lazy(() => import('../pages/admin/AdminPayoutQueueDashboard'));
const ServerLogs = React.lazy(() => import('../components/Owner/ServerLogs'));
const SupportTicketsBoard = React.lazy(() => import('../components/Admin/SupportTicketsBoard'));
const SupportEngineerAnalytics = React.lazy(() => import('../components/Admin/SupportEngineerAnalytics'));
const DeveloperBugsPage = React.lazy(() => import('../components/Admin/DeveloperBugsPage'));
const NewTicketPage = React.lazy(() => import('../components/Customer/NewTicketPage'));
import { SupportEngineerRouteGuard } from '../components/Admin/AdminRouteGuard'

// Import layouts
import CustomerLayout from '../components/Customer/Layouts/CustomerLayout'
import OwnerLayout from '../components/Owner/Layouts/OwnerLayout'
import OwnerManageLayout from '../components/Owner/Layouts/OwnerManageLayout'
const ProductPaymentMethod = React.lazy(() => import('../components/Customer/ProductPaymentMethod'));
const Leadership = React.lazy(() => import('../components/Customer/Leadership'));
const Videos = React.lazy(() => import('../components/Customer/Videos'));
const SecurityPage = React.lazy(() => import('../components/Customer/Security'));
const ServicesGrid = React.lazy(() => import('../components/Customer/Services'));
const ClientTestimonial = React.lazy(() => import('../components/Customer/ClientTestimonial'));
const Sitemap = React.lazy(() => import('../components/Customer/SiteMap'));
const Updates = React.lazy(() => import('../components/Customer/updates'));
const CaseStudies = React.lazy(() => import('../components/Customer/CaseStudies'));
const SalonsSEO = React.lazy(() => import('../components/Customer/SalonsSEO'));
const SitemapXML = React.lazy(() => import('../components/Customer/SitemapXML'));
const RobotsTxtViewer = React.lazy(() => import('../components/Customer/RobotsTxtViewer'));
const SEOSalons = React.lazy(() => import('../components/Customer/SEOSalons'));

// Helper to read and extract stored role reliably
const getStoredUserRole = () => {
    const savedUserStr = localStorage.getItem('ownerStaffUser');
    if (!savedUserStr) return '';
    try {
        const u = JSON.parse(savedUserStr);
        return String(u?.role || u?.user?.role || (Array.isArray(u?.roles) ? u.roles[0] : u?.roles) || u?.userRole || u?.type || '').toUpperCase();
    } catch (e) {
        console.warn('Failed to parse ownerStaffUser:', e);
        return '';
    }
};

// --- Route Guards ---
const OwnerRouteGuard = ({ children }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken');
    const customerToken = localStorage.getItem('customerToken');

    if (!ownerToken) {
        return customerToken ? <Navigate to="/" replace /> : <Navigate to="/owner/login" replace />;
    }

    const role = getStoredUserRole();
    if ((role === 'SUPPORT_ENGINEER' || role.includes('SUPPORT')) && window.location.pathname === '/owner/dashboard') {
        return <Navigate to="/admin/support-requests" replace />;
    }
    if ((role === 'SEO_ADMIN' || role.includes('SEO')) && (
        window.location.pathname === '/owner/dashboard' || 
        window.location.pathname.startsWith('/owner/manage') ||
        window.location.pathname.startsWith('/owner/analytics') ||
        window.location.pathname.startsWith('/owner/orders') ||
        window.location.pathname.startsWith('/owner/billing')
    )) {
        return <Navigate to="/admin/blogs" replace />;
    }

    return children;
};

const StaffRouteGuard = ({ children }) => {
    const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
    const customerToken = localStorage.getItem('customerToken');

    if (!token) {
        return customerToken ? <Navigate to="/" replace /> : <Navigate to="/owner/login" replace />;
    }
    return children;
};

const RootRouteGuard = ({ children }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');

    if (ownerToken) {
        const role = getStoredUserRole();
        if (role === 'CUSTOMER' || role === 'ROLE_CUSTOMER') {
            return children;
        }
        if (role === 'SUPPORT_ENGINEER' || role.includes('SUPPORT')) {
            return <Navigate to="/admin/support-requests" replace />;
        }
        if (role === 'SEO_ADMIN' || role.includes('SEO')) {
            return <Navigate to="/admin/blogs" replace />;
        }
        if (role.includes('STAFF')) {
            return <Navigate to="/staff/dashboard" replace />;
        }
        return <Navigate to="/owner/dashboard" replace />;
    }

    return children;
};

const CustomerRouteGuard = ({ children, isPublic = false }) => {
    if (isPublic) {
        return children;
    }

    const ownerToken = localStorage.getItem('ownerStaffToken');
    const customerToken = localStorage.getItem('customerToken');

    if (ownerToken) {
        const role = getStoredUserRole();
        if (role === 'SUPPORT_ENGINEER' || role.includes('SUPPORT')) {
            return <Navigate to="/admin/support-requests" replace />;
        }
        if (role === 'SEO_ADMIN' || role.includes('SEO')) {
            return <Navigate to="/admin/blogs" replace />;
        }
        if (role.includes('STAFF')) {
            return <Navigate to="/staff/dashboard" replace />;
        }
        return <Navigate to="/owner/dashboard" replace />;
    }

    if (!customerToken) {
        return <Navigate to="/customer/login" replace />;
    }

    return children;
};

const GuestRouteGuard = ({ children }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
    const customerToken = localStorage.getItem('customerToken');

    if (ownerToken) {
        const role = getStoredUserRole();
        if (role === 'SUPPORT_ENGINEER' || role.includes('SUPPORT')) {
            return <Navigate to="/admin/support-requests" replace />;
        }
        if (role === 'SEO_ADMIN' || role.includes('SEO')) {
            return <Navigate to="/admin/blogs" replace />;
        }
        if (role.includes('STAFF')) {
            return <Navigate to="/staff/dashboard" replace />;
        }
        return <Navigate to="/owner/dashboard" replace />;
    }

    if (customerToken) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export let routes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <RouteErrorElement />,
        children: [
            {
                path: '/sitemap.xml',
                element: <SitemapXML />
            },
            {
                path: '/robots.txt',
                element: <RobotsTxtViewer />
            },
            {
                path: '/maintenance',
                element: <ServerMaintenance />
            },
            // Standalone customer auth / select salon routes (no layouts)
            {
                path: '/register',
                element: <Navigate to="/customer/login" replace />
            },
            {
                path: '/customer/register',
                element: <Navigate to="/customer/login" replace />
            },
            {
                path: '/signup',
                element: <Navigate to="/customer/login" replace />
            },
            {
                path: '/customer/login',
                element: <GuestRouteGuard><CustomerLogin /></GuestRouteGuard>
            },
            {
                path: '/login',
                element: <GuestRouteGuard><CustomerLogin /></GuestRouteGuard>
            },
            {
                path: '/customer-login',
                element: <GuestRouteGuard><CustomerLogin /></GuestRouteGuard>
            },
            {
                path: '/owner/login',
                element: <GuestRouteGuard><OwnerLogin /></GuestRouteGuard>
            },
            {
                path: '/owner-login',
                element: <GuestRouteGuard><OwnerLogin /></GuestRouteGuard>
            },
            {
                path: '/owner/forgot-password',
                element: <GuestRouteGuard><OwnerForgotPassword /></GuestRouteGuard>
            },
            {
                path: '/owner-forgot-password',
                element: <GuestRouteGuard><OwnerForgotPassword /></GuestRouteGuard>
            },
            {
                path: '/owner/register',
                element: <GuestRouteGuard><OwnerRegister /></GuestRouteGuard>
            },
            {
                path: '/owner-signup',
                element: <GuestRouteGuard><OwnerRegister /></GuestRouteGuard>
            },
            {
                path: '/staff/dashboard',
                element: <StaffRouteGuard><StaffDashboard /></StaffRouteGuard>
            },
            {
                path: '/staff/invitations',
                element: <StaffRouteGuard><StaffInvitations isStandalone={true} /></StaffRouteGuard>
            },
            {
                path: '/staff/login',
                element: <GuestRouteGuard><StaffRegister /></GuestRouteGuard>
            },
            {
                path: '/staff/register',
                element: <GuestRouteGuard><StaffRegister /></GuestRouteGuard>
            },
            {
                path: '/customer/select-salon',
                element: <CustomerRouteGuard><SalonSelection /></CustomerRouteGuard>
            },
            {
                path: '/buy-subscription',
                element: <PublicSubscriptionPlans />
            },

            {
                path: '/owner/terms-and-conditions',
                element: <OwnerTermsAndConditions />
            },
            {
                path: '/owner/:lang/terms-and-conditions',
                element: <OwnerTermsAndConditions />
            },
            {
                path: '/owner/privacy-policy',
                element: <PrivacyPolicyScreen />
            },
            {
                path: '/owner/:lang/privacy-policy',
                element: <PrivacyPolicyScreen />
            },

            {
                path: '/customer/cart',
                element: <Navigate to="/cart" replace />
            },
            {
                path: '/customer/appointments',
                element: <Navigate to="/appointments" replace />
            },
            {
                path: '/customer/my-orders',
                element: <Navigate to="/my-orders" replace />
            },
            {
                path: '/customer/my-salons',
                element: <Navigate to="/my-salons" replace />
            },
            {
                path: '/customer/favourites',
                element: <Navigate to="/favourites" replace />
            },
            {
                path: '/customer/salon',
                element: <Navigate to="/salon" replace />
            },
            {
                path: '/customer/book-service',
                element: <Navigate to="/book-service" replace />
            },

            // Customer Layout wrapper routes
            {
                element: <CustomerLayout />,
                children: [
                    {
                        path: 'customer/terms-and-conditions',
                        element: <CustomerRouteGuard isPublic={true}><CustomerTermsAndConditions /></CustomerRouteGuard>
                    },
                    {
                        path: 'terms-and-conditions',
                        element: <CustomerRouteGuard isPublic={true}><CustomerTermsAndConditions /></CustomerRouteGuard>
                    },
                    {
                        path: ':lang/terms-and-conditions',
                        element: <CustomerRouteGuard isPublic={true}><CustomerTermsAndConditions /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/:lang/terms-and-conditions',
                        element: <CustomerRouteGuard isPublic={true}><CustomerTermsAndConditions /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/privacy-policy',
                        element: <CustomerRouteGuard isPublic={true}><PrivacyPolicy /></CustomerRouteGuard>
                    },
                    {
                        path: 'privacy-policy',
                        element: <CustomerRouteGuard isPublic={true}><PrivacyPolicy /></CustomerRouteGuard>
                    },
                    {
                        path: ':lang/privacy-policy',
                        element: <CustomerRouteGuard isPublic={true}><PrivacyPolicy /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/:lang/privacy-policy',
                        element: <CustomerRouteGuard isPublic={true}><PrivacyPolicy /></CustomerRouteGuard>
                    },
                    {
                        path: '/',
                        element: <RootRouteGuard><HomeScreen /></RootRouteGuard>
                    },
                    {
                        path: 'customer/home',
                        element: <RootRouteGuard><HomeScreen /></RootRouteGuard>
                    },
                    {
                        path: 'customer/dashboard',
                        element: <RootRouteGuard><HomeScreen /></RootRouteGuard>
                    },

                    {
                        path: 'features',
                        element: <CustomerRouteGuard isPublic={true}><Features /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/features',
                        element: <CustomerRouteGuard isPublic={true}><Features /></CustomerRouteGuard>
                    },

                    {
                        path: 'about',
                        element: <CustomerRouteGuard isPublic={true}><AboutUs /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/about',
                        element: <CustomerRouteGuard isPublic={true}><AboutUs /></CustomerRouteGuard>
                    },

                    {
                        path: 'support',
                        element: <CustomerRouteGuard isPublic={true}><Support /></CustomerRouteGuard>
                    },
                    {
                        path: 'support/new',
                        element: <CustomerRouteGuard isPublic={true}><NewTicketPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/support',
                        element: <CustomerRouteGuard isPublic={true}><Support /></CustomerRouteGuard>
                    },

                    {
                        path: 'delete-account',
                        element: <CustomerRouteGuard isPublic={true}><DeleteAccount /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/delete-account',
                        element: <CustomerRouteGuard isPublic={true}><DeleteAccount /></CustomerRouteGuard>
                    },

                    {
                        path: 'partner-with-us',
                        element: <CustomerRouteGuard isPublic={true}><PartnerWithUs /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/partner-with-us',
                        element: <CustomerRouteGuard isPublic={true}><PartnerWithUs /></CustomerRouteGuard>
                    },

                    {
                        path: 'salons',
                        element: <CustomerRouteGuard isPublic={true}><SalonsListing /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/salons',
                        element: <CustomerRouteGuard isPublic={true}><SalonsListing /></CustomerRouteGuard>
                    },

                    {
                        path: 'influencer-program',
                        element: <CustomerRouteGuard isPublic={true}><InfluencerProgram /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/influencer-program',
                        element: <CustomerRouteGuard isPublic={true}><InfluencerProgram /></CustomerRouteGuard>
                    },

                    {
                        path: 'blogs',
                        element: <CustomerRouteGuard isPublic={true}><Blogs /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/blogs',
                        element: <CustomerRouteGuard isPublic={true}><Blogs /></CustomerRouteGuard>
                    },
                    {
                        path: 'blogs/:slug',
                        element: <CustomerRouteGuard isPublic={true}><BlogPostDetailPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'blog/:slug',
                        element: <CustomerRouteGuard isPublic={true}><BlogPostDetailPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'blog/:id',
                        element: <CustomerRouteGuard isPublic={true}><BlogPostDetailPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'testimonials',
                        element: <CustomerRouteGuard isPublic={true}><TestimonialsComponent isStandalone={true} showHeader={true} /></CustomerRouteGuard>
                    },

                    {
                        path: 'leadership',
                        element: <CustomerRouteGuard isPublic={true}><Leadership /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/leadership',
                        element: <CustomerRouteGuard isPublic={true}><Leadership /></CustomerRouteGuard>
                    },

                    {
                        path: 'videos',
                        element: <CustomerRouteGuard isPublic={true}><Videos /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/videos',
                        element: <CustomerRouteGuard isPublic={true}><Videos /></CustomerRouteGuard>
                    },

                    {
                        path: 'security',
                        element: <CustomerRouteGuard isPublic={true}><SecurityPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/security',
                        element: <CustomerRouteGuard isPublic={true}><SecurityPage /></CustomerRouteGuard>
                    },

                    {
                        path: 'services',
                        element: <CustomerRouteGuard isPublic={true}><ServicesGrid /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/services',
                        element: <CustomerRouteGuard isPublic={true}><ServicesGrid /></CustomerRouteGuard>
                    },

                    {
                        path: 'client-testimonials',
                        element: <CustomerRouteGuard isPublic={true}><ClientTestimonial /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/client-testimonials',
                        element: <CustomerRouteGuard isPublic={true}><ClientTestimonial /></CustomerRouteGuard>
                    },

                    {
                        path: 'sitemap',
                        element: <CustomerRouteGuard isPublic={true}><Sitemap /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/sitemap',
                        element: <CustomerRouteGuard isPublic={true}><Sitemap /></CustomerRouteGuard>
                    },

                    {
                        path: 'updates',
                        element: <CustomerRouteGuard isPublic={true}><Updates /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/updates',
                        element: <CustomerRouteGuard isPublic={true}><Updates /></CustomerRouteGuard>
                    },

                    {
                        path: 'offers',
                        element: <CustomerRouteGuard isPublic={true}><Offers /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/offers',
                        element: <CustomerRouteGuard isPublic={true}><Offers /></CustomerRouteGuard>
                    },

                    {
                        path: 'case-studies',
                        element: <CustomerRouteGuard isPublic={true}><CaseStudies /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/case-studies',
                        element: <CustomerRouteGuard isPublic={true}><CaseStudies /></CustomerRouteGuard>
                    },
                    {
                        path: '/my-salons',
                        element: <CustomerRouteGuard><MySalons /></CustomerRouteGuard>
                    },
                    {
                        path: '/favourites',
                        element: <CustomerRouteGuard><Favourites /></CustomerRouteGuard>
                    },
                    {
                        path: '/appointments',
                        element: <CustomerRouteGuard><Appointments /></CustomerRouteGuard>
                    },
                    {
                        path: 'salon',
                        element: <CustomerRouteGuard isPublic={true}><SalonPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'salons/:city',
                        element: <CustomerRouteGuard isPublic={true}><SalonsSEO /></CustomerRouteGuard>
                    },
                     {
                        path: 'salons/:city/:area',
                        element: <CustomerRouteGuard isPublic={true}><SalonsSEO /></CustomerRouteGuard>
                    },
                    {
                        path: 'seo-salons',
                        element: <CustomerRouteGuard isPublic={true}><SEOSalons /></CustomerRouteGuard>
                    },
                    {
                        path: 'seo-salons/:cityName/:areaName/:serviceName',
                        element: <CustomerRouteGuard isPublic={true}><SEOSalons /></CustomerRouteGuard>
                    },
                    {
                        path: ':cityName/:serviceSlug',
                        element: <CustomerRouteGuard isPublic={true}><SEOSalons /></CustomerRouteGuard>
                    },
                    {
                        path: 'salon/:salonSlug',
                        element: <CustomerRouteGuard isPublic={true}><SalonPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'book-service',
                        element: <CustomerRouteGuard isPublic={true}><SelectService /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/product-search',
                        element: <CustomerRouteGuard isPublic={true}><ProductSearch /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/product-details',
                        element: <CustomerRouteGuard isPublic={true}><ProductDetails /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/product-payment',
                        element: <CustomerRouteGuard><ProductPaymentMethod /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/appointment-success',
                        element: <CustomerRouteGuard><AppointmentSuccess /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/order-success',
                        element: <CustomerRouteGuard><OrderSuccess /></CustomerRouteGuard>
                    },
                    {
                        path: 'my-orders',
                        element: <CustomerRouteGuard><MyOrders /></CustomerRouteGuard>
                    },
                    {
                        path: 'cart',
                        element: <CustomerRouteGuard><Cart /></CustomerRouteGuard>
                    }
                ]
            },

            // Owner Layout wrapper routes
            {
                element: <OwnerLayout />,
                children: [
                    {
                        path: '/owner/dashboard',
                        element: <OwnerRouteGuard><OwnerDashboard /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/analytics',
                        element: <SupportEngineerRouteGuard isFinancialRoute={true}><Analytics /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/owner/monitoring',
                        element: <OwnerRouteGuard><ServerHealth /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/salons',
                        element: <SupportEngineerRouteGuard><AdminSalons /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/owner/salons',
                        element: <SupportEngineerRouteGuard><AdminSalons /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/owner/subscriptions',
                        element: <SupportEngineerRouteGuard isFinancialRoute={true}><AdminSubscriptions /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/owner/orders',
                        element: <OwnerRouteGuard><Orders /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/billing',
                        element: <Navigate to="/owner/dashboard" replace />
                    },
                    {
                        path: '/owner/settings',
                        element: <OwnerRouteGuard><Settings /></OwnerRouteGuard>
                    },
                    {
                        path: '/settings',
                        element: <OwnerRouteGuard><Settings /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/customers',
                        element: <OwnerRouteGuard><Customers /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/appointments',
                        element: <OwnerRouteGuard><Appointments /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/notifications',
                        element: <OwnerRouteGuard><NotificationsScreen /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/attendance',
                        element: <OwnerRouteGuard><StaffAttendance /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/support-requests',
                        element: <SupportEngineerRouteGuard><AdminSupportRequests /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/admin/support-requests',
                        element: <SupportEngineerRouteGuard><AdminSupportRequests /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/admin/support-dashboard',
                        element: <Navigate to="/admin/support-requests" replace />
                    },
                    {
                        path: '/owner/support-dashboard',
                        element: <Navigate to="/admin/support-requests" replace />
                    },
                    {
                        path: '/admin/tickets',
                        element: <Navigate to="/admin/support-requests" replace />
                    },
                    {
                        path: '/admin/support-analytics',
                        element: <SupportEngineerRouteGuard><SupportEngineerAnalytics /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/admin/developer-bugs',
                        element: <SupportEngineerRouteGuard><DeveloperBugsPage /></SupportEngineerRouteGuard>
                    },
                    {
                        path: '/owner/maintenance',
                        element: <OwnerRouteGuard><MaintenanceAdminPage /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/maintenance',
                        element: <OwnerRouteGuard><MaintenanceAdminPage /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/blogs',
                        element: <OwnerRouteGuard><AdminBlogManager /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/blogs',
                        element: <OwnerRouteGuard><AdminBlogManager /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/testimonials',
                        element: <OwnerRouteGuard><AdminTestimonialManager /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/testimonials',
                        element: <OwnerRouteGuard><AdminTestimonialManager /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/seo-salons',
                        element: <OwnerRouteGuard><AdminSeoDirectory /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/seo-salons',
                        element: <OwnerRouteGuard><AdminSeoDirectory /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/sitemap',
                        element: <OwnerRouteGuard><SitemapXML /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/sitemap',
                        element: <OwnerRouteGuard><SitemapXML /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/sitemap.xml',
                        element: <OwnerRouteGuard><SitemapXML /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/sitemap.xml',
                        element: <OwnerRouteGuard><SitemapXML /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/robots',
                        element: <OwnerRouteGuard><RobotsTxtViewer /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/robots',
                        element: <OwnerRouteGuard><RobotsTxtViewer /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/robots.txt',
                        element: <OwnerRouteGuard><RobotsTxtViewer /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/robots.txt',
                        element: <OwnerRouteGuard><RobotsTxtViewer /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/kyc',
                        element: <OwnerRouteGuard><OwnerKyc /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/manage/kyc',
                        element: <OwnerRouteGuard><OwnerKyc /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/kyc-requests',
                        element: <OwnerRouteGuard><AdminKycDashboard /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/kyc',
                        element: <OwnerRouteGuard><AdminKycDashboard /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/payout-requests',
                        element: <OwnerRouteGuard><AdminPayoutQueueDashboard /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/payouts',
                        element: <OwnerRouteGuard><AdminPayoutQueueDashboard /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/logs',
                        element: <OwnerRouteGuard><ServerLogs /></OwnerRouteGuard>
                    },
                    {
                        path: '/admin/system/logs',
                        element: <OwnerRouteGuard><ServerLogs /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/logs',
                        element: <OwnerRouteGuard><ServerLogs /></OwnerRouteGuard>
                    },
                    {
                        path: '/staff/payouts',
                        element: <StaffRouteGuard><StaffPayoutDashboard /></StaffRouteGuard>
                    },
                    {
                        path: '/staff/rewards',
                        element: <StaffRouteGuard><StaffPayoutDashboard /></StaffRouteGuard>
                    },
                    {
                        path: '/subscription-plans',
                        element: <OwnerRouteGuard><SubscriptionPlans /></OwnerRouteGuard>
                    },

                    // Nested Owner Manage Layout wrapper routes
                    {
                        element: <OwnerManageLayout />,
                        children: [
                            {
                                path: '/owner/manage/schedule',
                                element: <OwnerRouteGuard><Schedule /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/walk-in',
                                element: <OwnerRouteGuard><WalkInBooking /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/services',
                                element: <OwnerRouteGuard><Services /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/inventory',
                                element: <OwnerRouteGuard><Inventory /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/staff',
                                element: <OwnerRouteGuard><Staff /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/invitations',
                                element: <OwnerRouteGuard><OwnerStaffInvitations /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/staff-invitations',
                                element: <OwnerRouteGuard><OwnerStaffInvitations /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/feedback',
                                element: <OwnerRouteGuard><Feedback /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/home-services',
                                element: <OwnerRouteGuard><HomeServices /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/subscription',
                                element: <OwnerRouteGuard><Subscription /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/add-offers',
                                element: <OwnerRouteGuard><AddOffers /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/add-products',
                                element: <OwnerRouteGuard><AddProducts /></OwnerRouteGuard>
                            },
                            {
                                path: '/owner/manage/add-package',
                                element: <OwnerRouteGuard><AddPackages /></OwnerRouteGuard>
                            }
                        ]
                    }
                ]
            },

            {
                path: '*',
                element: <div className='min-h-screen flex items-center justify-center text-2xl font-poppins'>404 - Page Not Found</div>
            }
        ]
    }
])

export default routes;
