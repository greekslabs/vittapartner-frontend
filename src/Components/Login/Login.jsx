import React, { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../Auth';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const loginUrl = import.meta.env.VITE_API_LOGIN_URL;
    const { isAuthenticated, login } = useAuth();

    const [formData, setFormData] = useState({
        loginEmail: '',
        loginPassword: '',
    });
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate('/dashboard');
        }
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginData = {
            email: formData.loginEmail,
            password: formData.loginPassword,
        };

        try {
            const response = await axios.post(`${loginUrl}login/`, loginData);

            if (response.status === 200) {
                window.location.href = "/dashboard";
                const user = response.data.data.user;
                const role = user.role;

                localStorage.setItem("user_id", user.id);
                localStorage.setItem("role", role);
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("username", user.username);
                localStorage.setItem("phone", user.phone);
                localStorage.setItem("email", user.email);

                if (user.employee_id) {
                    localStorage.setItem("employee_id", user.employee_id);
                } else if (user.partner_id) {
                    localStorage.setItem("employee_id", user.partner_id);
                } else if (user.accountant_id) {
                    localStorage.setItem("employee_id", user.accountant_id);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: `Welcome ${user.username}!`,
                    showConfirmButton: false,
                    timer: 1500
                });



                setFormData({
                    loginEmail: '',
                    loginPassword: ''
                });
            }
        } catch (error) {
            console.error('Login Error:', error.response?.data || error.message);

            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error.response?.data?.message || 'Invalid email or password',
            });
        }

    };

    return (
        <div className="login-main">
            <div className="login-container">
                <h1>Welcome back</h1>
                <p>Sign in to your account</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="login-inputs"
                            name="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleChange}
                            required
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="login-inputs"
                                name="loginPassword"
                                value={formData.loginPassword}
                                onChange={handleChange}
                                required
                            />
                            <span className="eye-icon" onClick={togglePassword}>
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="sign-in">
                        Sign In
                    </button>
                </form>


            </div>
        </div>
    );
};

export default Login;