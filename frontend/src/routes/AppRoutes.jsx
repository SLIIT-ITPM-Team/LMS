import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Materials from "../pages/materials/Materials";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/materials" element={<Materials />} />
        <Route path="*" element={<Navigate to="/materials" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
