import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_LOGIN_URL;

    const [formData, setFormData] = useState({
        signupName: '',
        signupEmail: '',
        signupPassword: '',
        signupConfirmPassword: '',
        role: '',
        phone: '',
        dividend: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);
    const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);



    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            signupName,
            phone,
            signupEmail,
            signupPassword,
            signupConfirmPassword,
            role,
            dividend
        } = formData;

      
        if (
            !signupName.trim() ||
            !phone.trim() ||
            !signupEmail.trim() ||
            !signupPassword.trim() ||
            !signupConfirmPassword.trim() ||
            !role.trim() ||
            (role === "partner" && !dividend.trim())
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in all fields before submitting.',
                confirmButtonColor: '#f8bb86',
            });
            return;
        }

        const signupData = {
            username: signupName,
            phone: phone,
            email: signupEmail,
            password: signupPassword,
            confirm_password: signupConfirmPassword,
            role: role,
            dividend: role === "partner" ? dividend : "",
        };

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(`${apiUrl}user/`, signupData, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            if (response.status === 200 && response.data.statuscode === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful',
                    text: 'User registered successfully!',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    navigate("/addusers");
                });

                setFormData({
                    signupName: "",
                    phone: "",
                    signupEmail: "",
                    signupPassword: "",
                    signupConfirmPassword: "",
                    role: "",
                    dividend: ""
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Signup Failed',
                    text: response.data.message || "Something went wrong. Please try again.",
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error('Signup Error:', error.response?.data || error.message);

            Swal.fire({
                icon: 'error',
                title: 'Signup Failed',
                text: error.response?.data?.error || "Something went wrong. Please check the form or server.",
                confirmButtonColor: '#d33',
            });
        }
    };


    return (
        <div className="login-main ">
            <div className="login-container">
                <h1>Vittamoney</h1>
                <p>Create your account</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="login-inputs"
                            name="signupName"
                            value={formData.signupName}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="phone"
                            placeholder="Phone number"
                            className="login-inputs"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email address"
                            className="login-inputs"
                            name="signupEmail"
                            value={formData.signupEmail}
                            onChange={handleChange}
                            required
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                className="login-inputs"
                                name="signupPassword"
                                value={formData.signupPassword}
                                onChange={handleChange}
                                required
                            />
                            <span className="eye-icon" onClick={togglePassword}>
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>

                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                className="login-inputs"
                                name="signupConfirmPassword"
                                value={formData.signupConfirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span className="eye-icon" onClick={toggleConfirmPassword}>
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </span>
                        </div>

                        <select
                            className='login-inputs'
                            value={formData.role}
                            name="role"
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select your role</option>
                            <option value="vittamoney_user">Employee</option>
                            <option value="accountant">Accountant</option>
                            <option value="partner">Partner</option>
                        </select>

                        {formData.role == "partner" && (
                            <input
                                type="number"
                                placeholder="Dividend"
                                className="login-inputs"
                                name="dividend"
                                value={formData.dividend}
                                onChange={handleChange}
                                required
                            />

                        )}
                    </div>

                    <button type="submit" className="sign-in" >
                        Add User
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Signup;