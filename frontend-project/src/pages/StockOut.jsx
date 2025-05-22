import { useState, useEffect } from 'react';
import axios from 'axios';

const StockOut = () => {
  const [stockOut, setStockOut] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    spare_part_id: '',
    quantity: '',
    unit_price: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockOutRes, partsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/stock-out'),
          axios.get('http://localhost:5000/api/spare-parts')
        ]);
        
        setStockOut(stockOutRes.data);
        setParts(partsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/stock-out', formData);
      const part = parts.find(p => p.id == formData.spare_part_id);
      setStockOut([...stockOut, {
        ...formData,
        id: res.data.id,
        spare_part_name: part?.name || '',
        total_price: formData.quantity * formData.unit_price
      }]);
      setFormData({
        spare_part_id: '',
        quantity: '',
        unit_price: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding stock out:', error.response?.data?.error || error.message);
      alert(error.response?.data?.error || 'Failed to process stock out');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stock Out</h1>
      
      <div className="card bg-base-200 mb-6">
        <div className="card-body">
          <h2 className="card-title">Add Stock Out</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Spare Part</span>
                </label>
                <select
                  name="spare_part_id"
                  value={formData.spare_part_id}
                  onChange={handleChange}
                  required
                  className="select select-bordered"
                >
                  <option value="">Select Part</option>
                  {parts.map(part => (
                    <option key={part.id} value={part.id}>{part.name}</option>
                  ))}
                </select>
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
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-2 mt-4">
              <button type="submit" className="btn btn-primary">Add Stock Out</button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Stock Out History</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stockOut.map(item => (
                  <tr key={item.id}>
                    <td>{item.spare_part_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unit_price}</td>
                    <td>${item.total_price}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
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

export default StockOut;