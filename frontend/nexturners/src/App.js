import './App.css';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import { Layout } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register/Register';
import Home from './components/Home/Home';
import DriverFatigueManagement from './components/DriverFatigueManagement/DriverFatigueManagement';
import Blog from './components/Blog/Blog';
import TrafficTraining from './components/Course/Course';
import FatigueSimulation from './components/FatigueSimulation/FatigueSimulation';
import { useEffect, useState } from 'react';
import TrainingSimulation from './components/TrainingSimulation/TrainingSimulation';

function App() {
  const [user, setUser] = useState([])
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '67a0303ea6608571e4b6c036' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production'
      });
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/" />;
  };

  return (
    <Router>
      <Layout style={{ minHeight: "100vh", background: "#B2E0EB" }}>
        <Header user={user} setUser={setUser} />
        <Routes>
          <Route path="/login" element={<Login user={user} setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home user={user} />} />
          <Route path="/fatigue-management" element={<ProtectedRoute element={<DriverFatigueManagement />} />} />
          <Route path="/simulation" element={<ProtectedRoute element={<FatigueSimulation />} />} />
          <Route path="/training-simulation" element={<ProtectedRoute element={<TrainingSimulation />} />} />
          <Route path="/blog" element={<ProtectedRoute element={<Blog />} />} />
          <Route path="/courses" element={<ProtectedRoute element={<TrafficTraining user={user} />} />} />
        </Routes>
        <Footer />
      </Layout>
    </Router>
  );
}

export default App;
