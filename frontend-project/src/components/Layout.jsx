import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = ({ logout, user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="navbar bg-base-100 lg:hidden">
            <div className="flex-none">
              <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div>
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-xl">SMIS DB</a>
            </div>
          </div>
          
          {/* Page content */}
          <div className="p-4">
            <Outlet />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 h-full bg-base-200 text-base-content">
            <div className="mb-4">
              <h1 className="text-xl font-bold">SMIS DB</h1>
              <p className="text-sm">Welcome, {user}</p>
            </div>
            
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/spare-parts">Spare Parts</Link></li>
              <li><Link to="/stock-in">Stock In</Link></li>
              <li><Link to="/stock-out">Stock Out</Link></li>
              <li><Link to="/reports">Reports</Link></li>
              <li><button onClick={handleLogout} className=' text-error'>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;