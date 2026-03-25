import React from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      <Toaster position="top-right" />
      {!hideNavbar ? <Navbar /> : null}
      <AppRoutes />
    </>
  );
};

export default App;
