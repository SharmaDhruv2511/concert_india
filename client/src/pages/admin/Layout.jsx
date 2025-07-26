import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Loading from '../../components/Loading';

const Layout = () => {
  const { isAdmin, fetchIsAdmin } = useAppContext();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      await fetchIsAdmin();
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) return <Loading />;
  if (!isAdmin) {
    // Optionally redirect or show error
    // navigate('/'); // Uncomment to redirect to home
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">
          Access Denied: Not an Admin
        </h1>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
