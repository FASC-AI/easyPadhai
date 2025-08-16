import { jwtDecode } from 'jwt-decode';

export default function getUserIdFromToken() {
  const token =
    localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);

      return decodedToken.id;
    } catch (error) {
    
      return null;
    }
  }
  return null;
}

// const userId = getUserIdFromToken();
