export default function LogoutHelper({ setIsAuthenticated, setUser }) {
  setUser(null);
  setIsAuthenticated(false);
}
