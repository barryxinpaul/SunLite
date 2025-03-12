import { createContext, useContext, useState } from "react";

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [portfolioVersion, setPortfolioVersion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshPortfolio = async () => {
    setIsRefreshing(true);
    try {
      setPortfolioVersion((prev) => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolioVersion,
        refreshPortfolio,
        isRefreshing,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}

