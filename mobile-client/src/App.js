import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';

function App() {
  return (
    <div className="app-root">
      <div className="app-shell">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<HotelList />} />
            <Route path="/detail/:id" element={<HotelDetail />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
