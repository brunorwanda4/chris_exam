import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    spareParts: 0,
    stockIn: 0,
    stockOut: 0
  });
  const [recentStockIn, setRecentStockIn] = useState([]);
  const [recentStockOut, setRecentStockOut] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sparePartsRes, stockInRes, stockOutRes] = await Promise.all([
          axios.get('http://localhost:5000/api/spare-parts'),
          axios.get('http://localhost:5000/api/stock-in?limit=5'),
          axios.get('http://localhost:5000/api/stock-out?limit=5')
        ]);
        
        setStats({
          spareParts: sparePartsRes.data.length,
          stockIn: stockInRes.data.length,
          stockOut: stockOutRes.data.length
        });
        
        setRecentStockIn(stockInRes.data);
        setRecentStockOut(stockOutRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-primary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Spare Parts</h2>
            <p className="text-3xl">{stats.spareParts}</p>
          </div>
        </div>
        <div className="card bg-secondary text-secondary-content">
          <div className="card-body">
            <h2 className="card-title">Stock In</h2>
            <p className="text-3xl">{stats.stockIn}</p>
          </div>
        </div>
        <div className="card bg-accent text-accent-content">
          <div className="card-body">
            <h2 className="card-title">Stock Out</h2>
            <p className="text-3xl">{stats.stockOut}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Recent Stock In</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockIn.map(item => (
                    <tr key={item.id}>
                      <td>{item.spare_part_name}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Recent Stock Out</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Quantity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockOut.map(item => (
                    <tr key={item.id}>
                      <td>{item.spare_part_name}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;