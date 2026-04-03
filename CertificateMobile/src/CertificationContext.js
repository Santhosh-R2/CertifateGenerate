import React, { createContext, useState, useContext } from 'react';

const CertificationContext = createContext();

export function CertificationProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [templateUri, setTemplateUri] = useState(null);
  const [certificateFields, setCertificateFields] = useState({});
  const [importedData, setImportedData] = useState([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  const value = {
    isAuthenticated, setIsAuthenticated,
    templateUri, setTemplateUri,
    certificateFields, setCertificateFields,
    importedData, setImportedData,
    issueDate, setIssueDate
  };

  return (
    <CertificationContext.Provider value={value}>
      {children}
    </CertificationContext.Provider>
  );
}

export function useCertification() {
  return useContext(CertificationContext);
}
