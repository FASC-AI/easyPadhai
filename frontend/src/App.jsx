import {
  Navigate,
  useNavigate,
  useLocation,
  Route,
  Routes,
} from "react-router-dom";
import useStore from "./store";
import { protectedRoutes, publicRoutes } from "./routes";
import PublicLayout from "./layouts/public.layout";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/ui/loading-screen";
import {
  LoaderDisplay,
  LoaderProvider,
} from "./components/ui/loader/screen-loader";
import PrivatePageLayout from "./layouts/private-layout.jsx/private.layout";
import apiService from "./lib/apiService";
import "./App.css";

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

function App() {
  const { isAuthenticated, setIsAuthenticated, setUser, setUserProfile } =
    useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const { isLoading, refetch } = useQuery({
    queryKey: ["verifyToken"],
    queryFn: async () => {
      try {
        // Check if we have a token before making the API call
        const token = localStorage.getItem('token') || getCookie('token');
        if (!token) {
          setIsAuthenticated(false);
          return { success: false, authenticated: false };
        }

        const res = await apiService.get("/auth/verifyToken");

        if (res.code === 200) {
          setIsAuthenticated(true);
          setUser(res?.data?.user);
          setUserProfile(res?.data?.userProfile);
          setAuthLoading(false);
          return { success: true, authenticated: true, data: res.data };
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          setAuthLoading(false);
          return { success: false, authenticated: false, error: res.message };
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        setAuthLoading(false);
        return { success: false, authenticated: false, error: error.message };
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: false, // Don't run automatically
  });
  useEffect(() => {
    if (isAuthenticated && location.pathname === "/verify-email") {
      navigate("/dashboard");
    }
    
    // Debug route matching for WhatsApp
    if (location.pathname === "/whatsapp") {
      console.log("WhatsApp route accessed:", location.pathname);
      console.log("isAuthenticated:", isAuthenticated);
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token') || getCookie('token');
    if (token && !isAuthenticated) {
      // We have a token but not authenticated, verify it
      refetch();
    } else {
      // No token found, set loading to false
      setAuthLoading(false);
    }
  }, []);

  if (isLoading || authLoading) {
    return <LoadingScreen className="h-screen w-screen" />;
  }
  const renderRoutes = (routes, Layout) =>
    routes.map((route, index) => (
      <Route
        path={route.path}
        key={index}
        element={
          <Layout>
            <route.component />
          </Layout>
        }
      />
    ));
  return (
    <>
      <LoaderProvider>
        <LoaderDisplay />
        <Routes>
          {isAuthenticated
            ? renderRoutes(protectedRoutes, PrivatePageLayout)
            : renderRoutes(publicRoutes, PublicLayout)}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />
        </Routes>
      </LoaderProvider>
    </>
  );
}
export default App;
