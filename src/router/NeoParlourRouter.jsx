import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import CustomerLanding from '../components/CustomerLanding'
import CustomerLogin from '../components/Customer/CustomerLogin'
import OwnerLogin from '../components/Owner/OwnerLogin'
import OwnerForgotPassword from '../components/Owner/OwnerForgotPassword'
import CustomerRegister from '../components/Customer/CustomerRegister'
import OwnerRegister from '../components/Owner/OwnerRegister'
import SalonSelection from '../components/Customer/SalonSelection'
import Appointments from '../components/Customer/Appointments'
import SubscriptionPlans from '../components/Owner/SubscriptionPlans'
import OwnerDashboard from '../components/Owner/OwnerDashboard'
import ManageSideBar from '../components/Owner/Layouts/ManageSideBar'
import Analytics from '../components/Owner/Analytics'
import Orders from '../components/Owner/Orders'
import Billing from '../components/Owner/Billing'
import Settings from '../components/Owner/Settings'
import ServerHealth from '../components/Owner/ServerHealth'
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
import PartnerWithUs from '../components/Customer/PartnerWithUs'
import SalonsListing from '../components/Customer/SalonsListing'
import Customers from '../components/Owner/Customers'
import Favourites from '../components/Customer/Favourites'
import MySalons from '../components/Customer/MySalons'
import NotificationsScreen from '../components/Owner/NotificationsScreen'

// Import New Footer Pages
import InfluencerProgram from '../components/Customer/InfluencerProgram'
import Blogs from '../components/Customer/Blogs'
import StaffAttendance from '../components/Owner/StaffAttendance'
import Cart from '../components/Customer/Cart'

// Import layouts
import CustomerLayout from '../components/Customer/Layouts/CustomerLayout'
import OwnerLayout from '../components/Owner/Layouts/OwnerLayout'
import OwnerManageLayout from '../components/Owner/Layouts/OwnerManageLayout'
import ProductPaymentMethod from '../components/Customer/ProductPaymentMethod'

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

const CustomerRouteGuard = ({ children, isPublic = false }) => {
    const ownerToken = localStorage.getItem('ownerStaffToken');
    const customerToken = localStorage.getItem('customerToken');

    if (ownerToken) {
        // Owner trying to access customer page -> send to owner dashboard
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
        children: [
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
                path: '/customer/select-salon',
                element: <CustomerRouteGuard><SalonSelection /></CustomerRouteGuard>
            },

            // Customer Layout wrapper routes
            {
                element: <CustomerLayout />,
                children: [
                    {
                        path: '/',
                        element: <CustomerRouteGuard isPublic={true}><HomeScreen /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/home',
                        element: <CustomerRouteGuard isPublic={true}><HomeScreen /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/features',
                        element: <CustomerRouteGuard isPublic={true}><Features /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/about',
                        element: <CustomerRouteGuard isPublic={true}><AboutUs /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/support',
                        element: <CustomerRouteGuard isPublic={true}><Support /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/partner-with-us',
                        element: <CustomerRouteGuard isPublic={true}><PartnerWithUs /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/salons',
                        element: <CustomerRouteGuard isPublic={true}><SalonsListing /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/privacy-policy',
                        element: <CustomerRouteGuard isPublic={true}><PrivacyPolicy /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/terms-and-conditions',
                        element: <CustomerRouteGuard isPublic={true}><CustomerTermsAndConditions /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/influencer-program',
                        element: <CustomerRouteGuard isPublic={true}><InfluencerProgram /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/blogs',
                        element: <CustomerRouteGuard isPublic={true}><Blogs /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/my-salons',
                        element: <CustomerRouteGuard><MySalons /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/favourites',
                        element: <CustomerRouteGuard><Favourites /></CustomerRouteGuard>
                    },
                    {
                        path: '/customer/appointments',
                        element: <CustomerRouteGuard><Appointments /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/salon',
                        element: <CustomerRouteGuard isPublic={true}><SalonPage /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/book-service',
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
                        path: 'customer/my-orders',
                        element: <CustomerRouteGuard><MyOrders /></CustomerRouteGuard>
                    },
                    {
                        path: 'customer/cart',
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
                        path: '/subscription-plans',
                        element: <OwnerRouteGuard><SubscriptionPlans /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/privacy-policy',
                        element: <OwnerRouteGuard><PrivacyPolicyScreen /></OwnerRouteGuard>
                    },
                    {
                        path: '/owner/terms-and-conditions',
                        element: <OwnerRouteGuard><OwnerTermsAndConditions /></OwnerRouteGuard>
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
