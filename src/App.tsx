import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <main className='min-h-screen w-full bg-neutral-50 bg-[linear-gradient(to_right,#ECF0F1_1px,transparent_1px),linear-gradient(to_bottom,#ECF0F1_1px,transparent_1px)] bg-size-[80px_80px] bg-fixed'>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
  );
}

export default App;