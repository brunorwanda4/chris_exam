import { useState, useEffect } from 'react';
import axios from 'axios';

const SpareParts = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit_price: ''
  });

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/spare-parts');
        setParts(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spare parts:', error);
        setLoading(false);
      }
    };
    
    fetchParts();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/spare-parts', formData);
      setParts([...parts, { ...formData, id: res.data.id }]);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        unit_price: ''
      });
    } catch (error) {
      console.error('Error adding spare part:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Spare Parts</h1>
      
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <h2 className="card-title">Add New Spare Part</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Quantity</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Unit Price</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-4">
              <button type="submit" className="btn btn-primary">Add Part</button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Spare Parts List</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.id}>
                    <td>{part.name}</td>
                    <td>{part.category}</td>
                    <td>{part.quantity}</td>
                    <td>${part.unit_price}</td>
                    <td>${part.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpareParts;