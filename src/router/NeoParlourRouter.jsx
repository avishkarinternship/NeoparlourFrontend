import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import CustomerLanding from '../components/CustomerLanding'
import CustomerLogin from '../components/Customer/CustomerLogin'
import OwnerLogin from '../components/Owner/OwnerLogin'
import CustomerRegister from '../components/Customer/CustomerRegister'
import OwnerRegister from '../components/Owner/OwnerRegister'
import SalonSelection from '../components/Customer/SalonSelection'
import Appointments from '../components/Customer/Appointments'
import SubscriptionPlans from '../components/Owner/SubscriptionPlans'
import OwnerDashboard from '../components/Owner/OwnerDashboard'
import ManageSideBar from '../components/Owner/Layouts/ManageSideBar'
import Analytics from '../components/Owner/Analytics'
import TeamMembers from '../components/Owner/TeamMembers'
import Billing from '../components/Owner/Billing'
import Settings from '../components/Owner/Settings'
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
import Features from '../components/Customer/Features'
import HomeScreen from '../components/Customer/HomeScreen'
import AboutUs from '../components/Customer/AboutUs'
import SalonPage from '../components/Customer/SalonPage'
import SelectService from '../components/Customer/SelectService'
import ProductSearch from '../components/Customer/ProductSearch'
import ProductDetails from '../components/Customer/ProductDetails'
import ProductPaymentMethod from '../components/Customer/ProductPaymentMethod'
import ProductBillDetails from '../components/Customer/ProductBillDetails'
import AppointmentSuccess from '../components/Customer/AppointmentSuccess'
import OwnerTermsAndConditions from '../components/Owner/OwnerTermsAndConditions'
import CustomerTermsAndConditions from '../components/Customer/CustomerTermsAndConditions'
import PrivacyPolicy from '../components/Customer/PrivacyPolicy'
import PrivacyPolicyScreen from '../components/Owner/PrivacyPolicy'
import Support from '../components/Customer/Support'
import PartnerWithUs from '../components/Customer/PartnerWithUs'
import SalonsListing from '../components/Customer/SalonsListing'

export let routes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <HomeScreen />
            },
            {
                path: '/customer/login',
                element: <CustomerLogin />
            },
            {
                path: '/login',
                element: <CustomerLogin />
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
                path: '/register',
                element: <CustomerRegister />
            },
            {
                path: '/signup',
                element: <CustomerRegister />
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
                path: '/subscription-plans',
                element: <SubscriptionPlans />
            },
          
            {
                path: '/customer/select-salon',
                element: <SalonSelection />
            },
            {
                path: '/owner/dashboard',
                element: <OwnerDashboard />
            },
            {
                path : '/customer/terms-and-conditions',
                element : <CustomerTermsAndConditions/>
            },
            // {
            //     path: '/owner/manage',
            //     element: <ManageSideBar />
            // },
            {
                path: '/owner/analytics',
                element: <Analytics />
            },
            {
                path: '/owner/team',
                element: <TeamMembers />
            },
            {
                path: '/owner/billing',
                element: <Billing />
            },
            {
                path: '/owner/settings',
                element: <Settings />
            },
            {
                path: '/owner/manage/schedule',
                element: <Schedule />
            },
            {
                path: '/owner/manage/services',
                element: <Services />
            },
            {
                path: '/owner/manage/inventory',
                element: <Inventory />
            },
            {
                path: '/owner/manage/staff',
                element: <Staff />
            },
            {
                path: '/owner/manage/feedback',
                element: <Feedback />
            },
            {
                path: '/owner/manage/home-services',
                element: <HomeServices />
            },
            {
                path: '/owner/manage/subscription',
                element: <Subscription />
            },
            {
                path: '/owner/manage/add-offers',
                element: <AddOffers />
            },
            {
                path: '/owner/manage/add-products',
                element: <AddProducts />
            },
            {
                path: '/owner/manage/add-package',
                element: <AddPackages />
            },
            {
                path: '/owner/appointments',
                element: <Appointments />
            },
            {
                path: '/customer/appointments',
                element: <Appointments />
            },
            {
                path: '/customer-login',
                element: <CustomerLogin />
            },
            {
                path: '/customer/home',
                element: <HomeScreen />
            },
            {
                path: '/customer/features',
                element: <Features />
            },
            {
                path: 'customer/salon',
                element: <SalonPage />
            },
            {
                path: 'customer/book-service',
                element: <SelectService />
            },
            {
                path: 'customer/product-search',
                element: <ProductSearch />
            },
            {
                path: 'customer/product-details',
                element: <ProductDetails />
            },
            {
                path: 'customer/product-payment',
                element: <ProductPaymentMethod />
            },
            {
                path: 'customer/product-bill',
                element: <ProductBillDetails />
            },
            {
                path: 'customer/appointment-success',
                element: <AppointmentSuccess />
            },   
            {
                path: '/customer/about',
                element: <AboutUs />
            },
            {
                path: '/customer/support',
                element: <Support />
            },
            {
                path: '/customer/partner-with-us',
                element: <PartnerWithUs />
            },
            {
                path: '/customer/salons',
                element: <SalonsListing />
            },
            {
                path: '/customer/privacy-policy',
                element: <PrivacyPolicy />
            },
            {
                path: '/owner/privacy-policy',
                element: <PrivacyPolicyScreen />
            },
            {
                path: '/settings',
                element: <Settings />
            },
            {
                path: '/signup',
                element: <CustomerRegister />
            },
            {
                path: '/owner/terms-and-conditions',
                element: <OwnerTermsAndConditions />
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
