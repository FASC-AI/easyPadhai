import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  permissions: [],
  metaData: null, // Initial state for metaData
  setMetaData: (data) => set({ metaData: data }), // Setter for metaData
  setPermissions: (permissions) => set({ permissions }),

  token: null,
  setToken: (token) => set({ token }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));

export default useStore;
