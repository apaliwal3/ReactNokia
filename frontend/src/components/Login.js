import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // Default role
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const response = await axios.post(`http://localhost:3001/auth/${endpoint}`, { username, email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', role); // Save the role in local storage
      setMessage(`${isLogin ? 'Login' : 'Signup'} successful!`);
      navigate('/type1'); // Adjust this navigation based on role if needed
      window.location.reload();
    } catch (error) {
      setMessage(`Error ${isLogin ? 'logging in' : 'signing up'}`);
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  return (
    <div className='login'>
      <div className="main">
        <div className={`container ${isLogin ? 'b-container' : 'a-container'}`} id={isLogin ? 'b-container' : 'a-container'}>
          <form className="form" onSubmit={handleSubmit}>
            <h2 className="form_title title">{isLogin ? 'Step Into the Network' : 'Create Account'}</h2>
            <div className="form__icons">
              <img className="form__icon" alt="" />
              <img className="form__icon" />
              <img className="form__icon" />
            </div>
            
            <input
              type="text"
              className="form__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
              required
            />
            {!isLogin && (
            <input
              type="email"
              className="form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              required={!isLogin}
            />
          )}
            <input
              type="password"
              className="form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />
            <select
              className="form__input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="client">Client</option>
            </select>
            <button type="submit" className="form__button button">
              {isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </form>
          {message && <p>{message}</p>}
        </div>
        <div className={`switch ${isLogin ? 'switch-signin' : 'switch-signup'}`} id={isLogin ? 'switch-signin' : 'switch-signup'}>
          <div className="switch__circle"></div>
          <div className="switch__circle switch__circle--t"></div>
          <div className="switch__container" id="switch-c1">
            <h2 className="switch__title title">{isLogin ? 'Welcome !' : 'Welcome Back !'}</h2>
            <p className="switch__description description">
              {isLogin
                ? 'Please enter your personal details to begin your journey with us.'
                : 'To keep connected with us please login with your personal info'}
            </p>
            <button onClick={switchForm} className="switch__button button switch-btn">
              {isLogin ? 'SIGN UP' : 'SIGN IN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
