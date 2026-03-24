

import './App.css';


import AddSummary from './components/AddSummary';
import Quits from './components/quits';


import { BrowserRouter as Router,Route,Routes } from "react-router-dom"




function App() {
  return (
<Router>
     <div>
      <Routes>
        <Route path="/add-summary" element={<AddSummary />} />
        <Route path="/quiz/:id/quits" element={<Quits />} />
        <Route path="/" element={<AddSummary />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
