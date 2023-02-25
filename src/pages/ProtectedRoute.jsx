import { Navigate, Outlet } from "react-router-dom";
import { useContext, Suspense } from "react";
import UserContext from "../lib/UserContext";
export const ProtectedRoute = () => {
  const { user, access_token } = useContext(UserContext);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
