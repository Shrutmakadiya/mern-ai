import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registration from '@/components/Users/Register';
import { useAuth } from './AuthContext/AuthContext';
import Login from '@/components/Users/Login';
import Dashboard from '@/components/Users/Dashboard';
import AuthRoute from '@/components/AuthRoute/AuthRoute';
import PublicNavbar from './components/Navbar/PublicNavbar';
import PrivateNavbar from './components/Navbar/PrivateNavbar';
import Home from './components/Home/Home';
import BlogPostAIAssistant from './components/ContentGeneration/ContentGeneration';
import Plans from './components/Plan/Plan';
import FreePlanSignup from './components/StripePayment/FreePlanSignup';
import CheckoutForm from './components/StripePayment/CheckoutForm';
import PaymentSuccess from './components/StripePayment/PaymentSuccess';
import AppFeatures from './components/Features/Features';
import AboutUs from './components/About/About';

const App = () => {
    const { isAuthenticated } = useAuth();
    return (
        <BrowserRouter>
            {/* Navbar */}
            {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
            <Routes>
                <Route path="/register" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <AuthRoute>
                            <Dashboard />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/generate-content"
                    element={
                        <AuthRoute>
                            <BlogPostAIAssistant />
                        </AuthRoute>
                    }
                />
                <Route path="/" element={<Home />} />
                <Route path="/plans" element={<Plans />} />
                <Route
                    path="/free-plan"
                    element={
                        <AuthRoute>
                            <FreePlanSignup />
                        </AuthRoute>
                    }
                />
                <Route
                    path="/checkout/:plan"
                    element={
                        <AuthRoute>
                            <CheckoutForm />
                        </AuthRoute>
                    }
                />
                <Route path="/success" element={<PaymentSuccess />} />
                <Route path="/features" element={<AppFeatures />} />
                <Route path="/about" element={<AboutUs />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;