import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Error Boundary for catching rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, info: any) {
        console.error('ErrorBoundary caught an error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return <div>Something went wrong: {this.state.error?.message || 'Unknown error'}</div>;
        }
        return this.props.children;
    }
}

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    { <Route path="/dashboard" element={<Dashboard />} /> }
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
};

export default App;