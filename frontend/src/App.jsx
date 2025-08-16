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
import { useEffect } from "react";
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
  const { isLoading, refetch } = useQuery({
    queryKey: ["verifyToken"],
    queryFn: async () => {
      try {
        // Check if we have a token before making the API call
        const token = localStorage.getItem('token') || getCookie('token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const res = await apiService.get("/auth/verifyToken");

        if (res.code === 200) {
          setIsAuthenticated(true);
          setUser(res?.data?.user);
          setUserProfile(res?.data?.userProfile);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: false, // Don't run automatically
  });
  useEffect(() => {
    if (isAuthenticated && location.pathname.includes("verify-email")) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token') || getCookie('token');
    if (token && !isAuthenticated) {
      // We have a token but not authenticated, verify it
      refetch();
    }
  }, []);

  if (isLoading) {
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </LoaderProvider>
    </>
  );
}
export default App;
