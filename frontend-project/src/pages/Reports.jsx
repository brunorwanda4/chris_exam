import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Reports = () => {
  const [stockStatus, setStockStatus] = useState([]);
  const [dailyStockOut, setDailyStockOut] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, stockOutRes] = await Promise.all([
          axios.get('http://localhost:5000/api/reports/stock-status'),
          axios.get('http://localhost:5000/api/reports/daily-stock-out', {
            params: { date: date.toISOString().split('T')[0] }
          })
        ]);
        
        setStockStatus(statusRes.data);
        setDailyStockOut(stockOutRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [date]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Stock Status</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Category</th>
                    <th>Stored</th>
                    <th>Total In</th>
                    <th>Total Out</th>
                    <th>Remaining</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockStatus.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.stored_quantity}</td>
                      <td>{item.total_in}</td>
                      <td>{item.total_out}</td>
                      <td>{item.remaining_quantity}</td>
                      <td>${item.unit_price}</td>
                      <td>${item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Daily Stock Out</h2>
              <div className="flex flex-col space-y-2">
                <label className="label">
                  <span className="label-text">Select Date</span>
                </label>
                <DatePicker
                  selected={date}
                  onChange={date => setDate(date)}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
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
                  {dailyStockOut.map(item => (
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
              {dailyStockOut.length === 0 && (
                <div className="text-center py-4">No stock out records for selected date</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;