"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/router'; // ใช้ 'next/router'
import { toast } from 'sonner';
import "./login.css";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success('Login successful!');
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify({
              username: data.user.username,
              email: data.user.email
            }));
            localStorage.setItem('token', data.token);
          }
          console.log('Redirecting to home...');
          router.push('/');  // นำผู้ใช้ไปที่หน้า Home
        } else {
          toast.error(data.error || 'Login failed');
        }
      } catch (error) {
        toast.error('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-side-card">
        <img
          src="https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="coffee bg"
          className="login-side-image"
        />
        <img src="https://i.imgur.com/M5HXful.png" alt="logo" className="logo-side" />
      </div>
      
      <div className="login-card">
        <img src="https://i.imgur.com/Z3GJNAi.png" alt="logo-login" className="logo-login" />
        <h2 className="login-title">Login to Your Account ☕</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}  // แก้ไขที่นี่
              onChange={handleChange}  // ใช้ handleChange ที่แก้ไข
              className="form-input"
            />
            {errors.email && <p className="error">{errors.email}</p>} {/* แสดงข้อความ error */}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}  // แก้ไขที่นี่
              onChange={handleChange}  // ใช้ handleChange ที่แก้ไข
              className="form-input"
            />
            {errors.password && <p className="error">{errors.password}</p>} {/* แสดงข้อความ error */}
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="login-footer">
          <p>
            Don't have an account? 
            <a href="/register" className="register-link"> Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
