import React from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

const App = () => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/admin");

  return (
    <>
      <Toaster position="top-right" />
      {!hideNavbar ? <Navbar /> : null}
      <div className={hideNavbar ? "" : "pt-24 md:pt-28"}>
        <AppRoutes />
      </div>
    </>
  );
};

export default App;
