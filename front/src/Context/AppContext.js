import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [logData, setLogData] = useState([]);

  return (
    <AppContext.Provider value={{ logData, setLogData }}>
      {children}
    </AppContext.Provider>
  );
};
