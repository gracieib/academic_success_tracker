import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/student?email=${email}`);
      const data = await res.json();

      if (res.ok) {
        setStatus('Login successful');
        // You can redirect or store data in localStorage
        localStorage.setItem('studentEmail', email);
        // window.location.href = '/dashboard'; // if routing is added
      } else {
        setStatus(data.error);
      }
    } catch (error) {
      setStatus('Error connecting to server');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default Login;
