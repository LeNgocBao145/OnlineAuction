import useAuthStore from "@/stores/authStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const init = async () => {
    try {
      if (!accessToken) {
        await refresh();
      }

      if (accessToken && !user) {
        await fetchMe();
      }

      setStarting(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen animate-ping items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/signIn" replace />;
  }
  return (
    <div>
      <Outlet></Outlet>
    </div>
  );
};

export default ProtectedRoute;
