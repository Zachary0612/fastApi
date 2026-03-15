import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ElderlyHome from './pages/ElderlyHome';
import FamilyHome from './pages/FamilyHome';
import DrugRecognize from './pages/DrugRecognize';
import DrugDetail from './pages/DrugDetail';
import DrugList from './pages/DrugList';
import ReminderList from './pages/ReminderList';
import MedicationLog from './pages/MedicationLog';
import FamilyManage from './pages/FamilyManage';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-2xl">加载中...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-elder-bg">
        <div className="text-elder-2xl text-elder-accent font-bold">加载中...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            {user?.role === 'family' ? <FamilyHome /> : <ElderlyHome />}
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/recognize" element={
        <PrivateRoute><Layout><DrugRecognize /></Layout></PrivateRoute>
      } />
      <Route path="/drugs" element={
        <PrivateRoute><Layout><DrugList /></Layout></PrivateRoute>
      } />
      <Route path="/drugs/:id" element={
        <PrivateRoute><Layout><DrugDetail /></Layout></PrivateRoute>
      } />
      <Route path="/reminders" element={
        <PrivateRoute><Layout><ReminderList /></Layout></PrivateRoute>
      } />
      <Route path="/logs" element={
        <PrivateRoute><Layout><MedicationLog /></Layout></PrivateRoute>
      } />
      <Route path="/family" element={
        <PrivateRoute><Layout><FamilyManage /></Layout></PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
