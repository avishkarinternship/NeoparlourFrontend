import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import LandingPage from '../components/LandingPage'
import CustomerDashboard from '../components/Customer/CustomerDashboard'
import CustomerLanding from '../components/CustomerLanding'
import OwnerDashboard from '../components/Owner/OwnerDashboard'
import CustomerLogin from '../components/Customer/CustomerLogin'
import CustomerRegister from '../components/Customer/CustomerRegister'
import SalonSelection from '../components/Customer/SalonSelection'
import Appointments from '../components/Customer/Appointments'
import SubscriptionPlans from '../components/Owner/SubscriptionPlans'
import Dashboard from '../components/Owner/Dashboard'

export let routes = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children : [
            {
                path: '/',
                element: <LandingPage />
            },
            {
                path: '/login',
                element: <CustomerLogin />
            },
            {
                path: '/register',
                element: <CustomerRegister />
            },
            {
                path: '/subscription-plans',
                element: <SubscriptionPlans />
            },
            {
                path: '/customer',
                element: <CustomerLanding />
            },
            {
                path: '/customer/dashboard',
                element: <CustomerDashboard />,
            },
            {
                path: '/customer/select-salon',
                element: <SalonSelection />
            },
            {
                path: '/owner/dashboard',
                element: <Dashboard />
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
                element: <CustomerLanding/>
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
