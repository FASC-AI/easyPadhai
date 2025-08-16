import React, { createContext, useContext, useState, useCallback } from "react";

// Create a context with a default empty breadcrumb array
const BreadcrumbContext = createContext();

// Create a custom hook to use the BreadcrumbContext
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};

// Create a provider component
export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbData, setBreadcrumbData] = useState([]);

  // Function to update the breadcrumb data, memoized for stability
  const updateBreadcrumb = useCallback((newBreadcrumbData) => {
    setBreadcrumbData(newBreadcrumbData);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbData, updateBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
