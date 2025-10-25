import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client'

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
	const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
      else setMessage("Check your email for a confirmation link...")
  }

  async function handleSignIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
      else {
        setMessage('Sign in Successful!');
        navigate("/welcome");
        }
  }


	return(
	 	<div className="auth-container">
      <div className="auth-card">
        <img
          src="/hot_mug.png"
          alt="App Logo"
          className="auth-logo"
        />

        <h1 className="auth-title">Sign in to Continue</h1>
        <p className="auth-subtitle">Use your Google account to get started.</p>

        <div className="login-wrapper">
          <input type="text" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="sign-in" onClick={handleSignIn}>Sign In</button>
        <nav className="register_link">
          <Link to="/register" onClick={handleSignUp}>Don't have an account? Sign up!</Link> {" "}
        </nav>
       </div>
        <p className="error_msg">{error}</p>
      </div>
    </div>
	)
}

