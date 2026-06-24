import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ProjectList from './components/Project/ProjectList';
import ProjectDetail from './components/Project/ProjectDetail';
import BoardCanvas from './components/Board/BoardCanvas';

const ProtectedRoute = ({ element }) => {
  const { token } = useContext(AuthContext);
  return token ? element : <Navigate to="/login" />;
};

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<ProjectList />} />} />
        <Route path="/project/:projectId" element={<ProtectedRoute element={<ProjectDetail />} />} />
        <Route path="/board/:boardId" element={<ProtectedRoute element={<BoardCanvas />} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;