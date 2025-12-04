import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
	const navigate = useNavigate();
	const [error, setError] = useState(null);

	return(
	 	<div className="auth-container">
      <div className="auth-card">
        <img
          src="/Hot_Mug.png"
          alt="App Logo"
          className="auth-logo"
        />

        <h1 className="auth-title">Register an Account</h1>
        <p className="auth-subtitle">Use your Google account to get started.</p>

        <div className="google-login-wrapper">
          Test
        </div>
        <nav className="register_link">
          <Link to="/register">Don't have an account? Sign up!</Link> {" "}
        </nav>
        <p className="error_msg">{error}</p>
      </div>
    </div>
	)
}


