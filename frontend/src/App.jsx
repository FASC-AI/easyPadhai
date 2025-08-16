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
function App() {
  const { isAuthenticated, setIsAuthenticated, setUser, setUserProfile } =
    useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, refetch } = useQuery({
    queryKey: ["verifyToken"],
    queryFn: async () => {
      try {
        const res = await apiService.get("/auth/verifyToken");

        if (res.code === 200) {
          setIsAuthenticated(true);
          setUser(res?.data?.user);
          setUserProfile(res?.data?.userProfile);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  useEffect(() => {
    if (isAuthenticated && location.pathname.includes("verify-email")) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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
