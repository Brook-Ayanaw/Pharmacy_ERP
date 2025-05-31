import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" />; // Redirect to login
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now(); // check expiration

    if (isExpired) {
      localStorage.removeItem('token');
      return <Navigate to="/" />;
    }

    return children;
  } catch (err) {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
