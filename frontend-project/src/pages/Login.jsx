import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      setAuth(res.data.token, res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Login</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="flex flex-col space-y-2">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                required
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col space-y-2  mt-2">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col space-y-2  mt-2mt-">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
          </form>
          <div className="text-center mt-4">
            <p>Don't have an account? <a href="/register" className="link">Register</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;