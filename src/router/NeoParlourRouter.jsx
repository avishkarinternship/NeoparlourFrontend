import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import RouteErrorElement from '../components/common/RouteErrorElement'
import CustomerLanding from '../components/CustomerLanding'
import CustomerLogin from '../components/Customer/CustomerLogin'
import OwnerLogin from '../components/Owner/OwnerLogin'
import OwnerForgotPassword from '../components/Owner/OwnerForgotPassword'
import CustomerRegister from '../components/Customer/CustomerRegister'
import OwnerRegister from '../components/Owner/OwnerRegister'
import SalonSelection from '../components/Customer/SalonSelection'
import Appointments from '../components/Customer/Appointments'
import SubscriptionPlans from '../components/Owner/SubscriptionPlans'
import PublicSubscriptionPlans from '../components/PublicSubscriptionPlans'
import OwnerDashboard from '../components/Owner/OwnerDashboard'
import ManageSideBar from '../components/Owner/Layouts/ManageSideBar'
import Analytics from '../components/Owner/Analytics'
import Orders from '../components/Owner/Orders'
import Billing from '../components/Owner/Billing'
import Settings from '../components/Owner/Settings'
import ServerHealth from '../components/Owner/ServerHealth'
import AdminSalons from '../components/Owner/AdminSalons'
import AdminSubscriptions from '../components/Owner/AdminSubscriptions'
import Schedule from '../components/Owner/Manage/Schedule'
import Services from '../components/Owner/Manage/Services'
import Inventory from '../components/Owner/Manage/Inventory'
import Staff from '../components/Owner/Manage/Staff'
import Feedback from '../components/Owner/Manage/Feedback'
import HomeServices from '../components/Owner/Manage/HomeServices'
import Subscription from '../components/Owner/Manage/Subscription'
import AddOffers from '../components/Owner/Manage/AddOffers'
import AddProducts from '../components/Owner/Manage/AddProducts'
import AddPackages from '../components/Owner/Manage/AddPackages'
import WalkInBooking from '../components/Owner/Manage/WalkInBooking'
import Features from '../components/Customer/Features'
import HomeScreen from '../components/Customer/HomeScreen'
import AboutUs from '../components/Customer/AboutUs'
import SalonPage from '../components/Customer/SalonPage'
import SelectService from '../components/Customer/SelectService'
import ProductSearch from '../components/Customer/ProductSearch'
import ProductDetails from '../components/Customer/ProductDetails'
import AppointmentSuccess from '../components/Customer/AppointmentSuccess'
import OrderSuccess from '../components/Customer/OrderSuccess'
import MyOrders from '../components/Customer/MyOrders'
import OwnerTermsAndConditions from '../components/Owner/OwnerTermsAndConditions'
import CustomerTermsAndConditions from '../components/Customer/CustomerTermsAndConditions'
import PrivacyPolicy from '../components/Customer/PrivacyPolicy'
import PrivacyPolicyScreen from '../components/Owner/PrivacyPolicy'
import Support from '../components/Customer/Support'
import DeleteAccount from '../components/Customer/DeleteAccount'
import PartnerWithUs from '../components/Customer/PartnerWithUs'
import SalonsListing from '../components/Customer/SalonsListing'
import Customers from '../components/Owner/Customers'
import Favourites from '../components/Customer/Favourites'
import MySalons from '../components/Customer/MySalons'
import NotificationsScreen from '../components/Owner/NotificationsScreen'
import AdminSupportRequests from '../components/Owner/AdminSupportRequests'
import MaintenanceAdminPage from '../components/Owner/MaintenanceAdminPage'

// Import New Footer Pages
import InfluencerProgram from '../components/Customer/InfluencerProgram'
import Blogs from '../components/Customer/Blogs'
import BlogListingPage from '../components/Customer/BlogListingPage'
import BlogPostDetailPage from '../components/Customer/BlogPostDetailPage'
import TestimonialsComponent from '../components/Customer/TestimonialsComponent'
import AdminBlogManager from '../components/Owner/AdminBlogManager'
import AdminTestimonialManager from '../components/Owner/AdminTestimonialManager'
import StaffAttendance from '../components/Owner/StaffAttendance'
import Cart from '../components/Customer/Cart'
import Offers from '../components/Customer/Offers'

// Import Staff Components
import StaffDashboard from '../components/StaffDashboard'
import StaffRegister from '../staff/StaffRegister'
import StaffInvitations from '../components/StaffInvitations'
import OwnerStaffInvitations from '../components/Owner/OwnerStaffInvitations'
import OwnerKyc from '../components/Owner/KYC/OwnerKyc'
import AdminKycDashboard from '../components/Owner/AdminKycDashboard'

// Import layouts
import CustomerLayout from '../components/Customer/Layouts/CustomerLayout'
import OwnerLayout from '../components/Owner/Layouts/OwnerLayout'
import OwnerManageLayout from '../components/Owner/Layouts/OwnerManageLayout'
import ProductPaymentMethod from '../components/Customer/ProductPaymentMethod'
import Leadership from '../components/Customer/Leadership'
import Videos from '../components/Customer/Videos'
import SecurityPage from '../components/Customer/Security'
import ServicesGrid from '../components/Customer/Services'
import ClientTestimonial from '../components/Customer/ClientTestimonial'
import Sitemap from '../components/Customer/SiteMap'
import Updates from '../components/Customer/updates'
import CaseStudies from '../components/Customer/CaseStudies'
import SalonsSEO from '../components/Customer/SalonsSEO'
import SitemapXML from '../components/Customer/SitemapXML'
import SEOSalons from '../components/Customer/SEOSalons'

// --- Route Guards ---
const OwnerRouteGuard = ({ children }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken');
    const customerToken = localStorage.getItem('customerToken');

    if (!ownerToken) {
        if (customerToken) {
            // Customer trying to access owner page -> send to customer home
            return <Navigate to="/" replace />;
        }
        // Guest trying to access owner page -> send to owner login
        return <Navigate to="/owner/login" replace />;
    }
    return children;
};

const StaffRouteGuard = ({ children }) => {
    const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
    const customerToken = localStorage.getItem('customerToken');

    if (!token) {
        if (customerToken) {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/owner/login" replace />;
    }
    return children;
};

const CustomerRouteGuard = ({ children, isPublic = false }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken');
    const customerToken = localStorage.getItem('customerToken');

    if (ownerToken) {
        const savedUserStr = localStorage.getItem('ownerStaffUser');
        let role = '';
        if (savedUserStr) {
            try {
                const u = JSON.parse(savedUserStr);
                role = String(u?.role || u?.user?.role || (Array.isArray(u?.roles) ? u.roles[0] : u?.roles) || u?.userRole || u?.type || '').toUpperCase();
            } catch (e) {}
        }
        if (role.includes('STAFF')) {
            return <Navigate to="/staff/dashboard" replace />;
        }
        return <Navigate to="/owner/dashboard" replace />;
    }

    if (!isPublic && !customerToken) {
        // Guest trying to access private customer page -> send to customer login
        return <Navigate to="/customer/login" replace />;
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
            // Standalone customer auth / select salon routes (no layouts)
            {
                path: '/customer/login',
                element: <CustomerRouteGuard isPublic={true}><CustomerLogin /></CustomerRouteGuard>
            },
            {
                path: '/login',
                element: <CustomerRouteGuard isPublic={true}><CustomerLogin /></CustomerRouteGuard>
            },
            {
                path: '/customer-login',
                element: <CustomerRouteGuard isPublic={true}><CustomerLogin /></CustomerRouteGuard>
            },
            {
                path: '/owner/login',
                element: <OwnerLogin />
            },
            {
                path: '/owner-login',
                element: <OwnerLogin />
            },
            {
                path: '/owner/forgot-password',
                element: <OwnerForgotPassword />
            },
            {
                path: '/owner-forgot-password',
                element: <OwnerForgotPassword />
            },
            {
                path: '/register',
                element: <CustomerRouteGuard isPublic={true}><CustomerRegister /></CustomerRouteGuard>
            },
            {
                path: '/signup',
                element: <CustomerRouteGuard isPublic={true}><CustomerRegister /></CustomerRouteGuard>
            },
            {
                path: '/owner/register',
                element: <OwnerRegister />
            },
            {
                path: '/owner-signup',
                element: <OwnerRegister />
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
                element: <StaffRegister />
            },
            {
                path: '/staff/register',
                element: <StaffRegister />
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
                        element: <CustomerRouteGuard isPublic={true}><HomeScreen /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/home',
                        element: <CustomerRouteGuard isPublic={true}><HomeScreen /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/dashboard',
                        element: <CustomerRouteGuard isPublic={true}><HomeScreen /></CustomerRouteGuard>
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
                        element: <OwnerRouteGuard><Analytics /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/monitoring',
                        element: <OwnerRouteGuard><ServerHealth /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/salons',
                        element: <OwnerRouteGuard><AdminSalons /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/subscriptions',
                        element: <OwnerRouteGuard><AdminSubscriptions /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/orders',
                        element: <OwnerRouteGuard><Orders /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/billing',
                        element: <OwnerRouteGuard><Billing /></OwnerRouteGuard>
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
                        element: <OwnerRouteGuard><AdminSupportRequests /></OwnerRouteGuard>
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
                        path: '/owner/staff-invitations',
                        element: <OwnerRouteGuard><OwnerStaffInvitations /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/manage/invitations',
                        element: <OwnerRouteGuard><OwnerStaffInvitations /></OwnerRouteGuard>
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

const NeoParlourRouter = () => {
    return (
        <div>
            {/* This component can be used to wrap the router if needed, but 'routes' is the main export */}
        </div>
    )
}

export default NeoParlourRouter
