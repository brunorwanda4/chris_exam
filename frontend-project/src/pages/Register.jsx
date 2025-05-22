import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { username, password, confirmPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      const res = await axios.post('http://localhost:5000/api/register', { username, password });
      setAuth(res.data.token, res.data.username);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Register</h2>
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
            <div className="flex flex-col space-y-2">
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
            <div className="flex flex-col space-y-2">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col space-y-2  mt-2mt-6">
              <button type="submit" className="btn btn-primary">Register</button>
            </div>
          </form>
          <div className="text-center mt-4">
            <p>Already have an account? <a href="/login" className="link">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;