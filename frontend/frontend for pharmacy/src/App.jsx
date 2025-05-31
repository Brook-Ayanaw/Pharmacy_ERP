import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogIn from './components/LogIn';
import AdminDashboared from './components/AdminDashboared';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboared />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
