import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './LogIn.module.css';

function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate(); // ✅ Hook for navigation

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    try {
      const response = await axios.post('https://pharmacy-erp.onrender.com/login/login', {
        email,
        password,
      });

      console.log('Login success:', response);
      const { token } = response.data;
      localStorage.setItem('token', token);

      navigate('/dashboard'); // ✅ React router navigation
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
      className={styles.loginContainer}
    >
      <h2 className="mb-4 text-center">Ayu Pharmacy Login</h2>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <input
        id="email"
        name="email"
        type="email"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <input
        id="password"
        name="password"
        type="password"
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />

      <button type="submit" className={styles.btn}>
        Login
      </button>
    </form>
  );
}

export default LogIn;
