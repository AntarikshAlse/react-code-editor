import { Navigate, Outlet } from "react-router-dom";
export const ProtectedRoute = () => {
  const isAuth = JSON.parse(localStorage.getItem("user"));
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
