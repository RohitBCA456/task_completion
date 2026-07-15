import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = location.state?.user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">NagaEd Portal</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition cursor-pointer"
        >
          Log Out
        </button>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center px-4">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-md max-w-md w-full border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-semibold">
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.username || "Guest"}!
          </h2>
          <p className="text-gray-500 text-sm">
            You have successfully authenticated into your developer hurdle workspace.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;