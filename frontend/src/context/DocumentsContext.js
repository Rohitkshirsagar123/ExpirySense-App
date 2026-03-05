import React, { createContext, useContext, useState } from "react";

// Create the context
const DocumentsContext = createContext();

// Create a provider component
export const DocumentsProvider = ({ children }) => {
  const [allDocuments, setAllDocuments] = useState([]);

  return (
    <DocumentsContext.Provider value={{ allDocuments, setAllDocuments }}>
      {children}
    </DocumentsContext.Provider>
  );
};

// Custom hook to use the DocumentsContext
export const useDocuments = () => useContext(DocumentsContext);