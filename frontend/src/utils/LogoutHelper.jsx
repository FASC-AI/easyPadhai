export default function LogoutHelper({ setIsAuthenticated, setUser }) {
  setUser(null);
  setIsAuthenticated(false);
  // Clear token from localStorage
  localStorage.removeItem('token');
}
