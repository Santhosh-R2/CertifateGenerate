import React, { useState } from 'react';
import { Award, Lock, User, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
            onLogin();
        } else {
            setError('ACCESS DENIED. Invalid security clearance.');
            setIsAuthenticating(false);
        }
    }, 1000);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
         <div className="login-header">
            <div className="login-icon-wrapper">
               <div className="login-icon-glow"></div>
               <div className="login-icon">
                  <Award size={32} />
               </div>
            </div>
            <h1 className="login-title">PRECISION STUDIO</h1>
            <p className="login-subtitle">SECURE TERMINAL ACCESS</p>
         </div>
         
         <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="login-error">
                <ShieldAlert size={16} /> 
                {error}
              </div>
            )}
            
            <div className="login-input-group">
               <label>ADMINISTRATOR ID</label>
               <div className="login-input-wrapper">
                  <User size={18} className="login-input-icon" />
                  <input 
                    type="text" 
                    placeholder="Enter Admin ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isAuthenticating}
                  />
               </div>
            </div>
            
            <div className="login-input-group">
               <label>SECURITY KEY</label>
               <div className="login-input-wrapper">
                  <Lock size={18} className="login-input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter strict access key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isAuthenticating}
                  />
                  <button 
                    type="button" 
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
               </div>
            </div>

            <button type="submit" className="btn-execute-lux login-submit" disabled={isAuthenticating}>
               <KeyRound size={18} /> {isAuthenticating ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
               <div className="btn-execute-shine"></div>
            </button>
            
            <div className="login-footer">
               <p>Authorized personnel only. (Hint: admin / admin123)</p>
            </div>
         </form>
      </div>
    </div>
  );
};

export default Login;
