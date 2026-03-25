import { Routes, Route, Navigate } from 'react-router-dom';
import Community from './pages/community/Community';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/community" />} />
      <Route path="/community" element={<Community />} />
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  );
}

export default App;
