import { useState, useEffect } from "react";
import BuyModal from "./BuyModal"; // Import BuyModal component
import Popup from "./Popup";  // Import Popup component
import api from './services/api';
import { usePortfolio } from './context/PortfolioContext';

/**
 * Overview Component
 * Displays the main portfolio dashboard including:
 * - Total account value
 * - Daily/Total returns
 * - Buying power
 * - Streak information
 * - Daily claim functionality
 */
export default function Overview() {
  // State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Portfolio data state with default values
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    cashBalance: 0,
    stocksValue: 0,
    streak: 0,
    lastLogin: '',
    dailyReturn: 0,
    dailyReturnPercentage: 0,
    totalReturn: 0,
    totalReturnPercentage: 0,
    initialInvestment: 0,
    currentValue: 0
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get portfolio context for updates
  const { portfolioVersion, refreshPortfolio } = usePortfolio();

  // Utility Functions
  // Format currency values with $ and commas
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format percentage values with % sign
  const formatPercentage = (value) => {
    return value.toFixed(2) + '%';
  };

  // Fetch and update portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Try cached data first, then fetch from server
        const data = api.getCachedPortfolio() || await api.getPortfolioDetails();
        
        // Transform API data into component state
        setPortfolioData({
          totalValue: data.all_time_returns?.current_value,
          cashBalance: data.buying_power || 0,
          stocksValue: (data.all_time_returns?.current_value || 0),
          streak: data.streak_info?.current_streak || 0,
          lastLogin: data.streak_info?.last_login || '',
          dailyReturn: data.daily_returns?.daily_return || 0,
          dailyReturnPercentage: data.daily_returns?.daily_return_percentage || 0,
          totalReturn: data.all_time_returns?.total_return || 0,
          totalReturnPercentage: data.all_time_returns?.total_return_percentage || 0,
          initialInvestment: data.all_time_returns?.initial_investment || 0,
          currentValue: data.all_time_returns?.current_value || 0
        });
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setError('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for portfolio updates from other components
    const handlePortfolioUpdate = (event) => {
      const newData = event.detail;
      console.log('Portfolio update received in Overview:', newData);
      fetchPortfolioData();
    };

    // Set up event listener and initial fetch
    window.addEventListener('portfolioUpdate', handlePortfolioUpdate);
    fetchPortfolioData();

    // Cleanup event listener
    return () => window.removeEventListener('portfolioUpdate', handlePortfolioUpdate);
  }, [portfolioVersion]);

  // Format date for streak display (e.g., "January 1, 2024")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle daily reward claim button click
  const handleDailyClaim = () => {
    setIsPopupOpen(true);
  };

  // Show error state if fetch failed
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Component render
  return (
    <div className="ml-4 mt-0">
      <div className="flex justify-between items-center">
        <p style={{ color: "#013946" }} className="font-bold">Overview</p>
      </div>
      <div className="w-125 h-100 bg-[#F3F3F3] mt-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            <div>
              <p className="pt-6 ml-10">Account Value</p>
              <p className="ml-10 font-bold text-4xl">
                {formatCurrency(portfolioData.totalValue)}
              </p>
            </div>

            <hr className="mt-6 border-t border-gray-300 w-5/6 mx-auto" />

            <div className="inline-flex mt-4 mx-auto">
              <div className="ml-4">
                <p className="ml-6">Today's change</p>
                <p className="ml-6 font-bold text-3xl">
                  {formatPercentage(portfolioData.dailyReturnPercentage)}
                </p>
                <p className="ml-6 text-sm">
                  {formatCurrency(portfolioData.dailyReturn)}
                </p>
              </div>

              <div>
                <p className="ml-6">Total change</p>
                <p className="ml-6 font-bold text-3xl">
                  {formatPercentage(portfolioData.totalReturnPercentage)}
                </p>
                <p className="ml-6 text-sm">
                  {formatCurrency(portfolioData.totalReturn)}
                </p>
              </div>

              <div className="ml-4">
                <p className="ml-4">Buying Power</p>
                <p className="ml-4 font-bold text-3xl">
                  {formatCurrency(portfolioData.cashBalance)}
                </p>
              </div>
            </div>

            <div className="inline-flex w-full mt-6 mx-auto">
              <div>
                <p className="ml-10">Streak</p>
                <p className="ml-10 font-bold text-3xl">{portfolioData.streak} days</p>
                <p className="ml-16">Since {formatDate(portfolioData.lastLogin)}</p>
              </div>

              <div>
                <button 
                  onClick={handleDailyClaim}
                  className="bg-gray-300 ml-10 mt-8 text-black px-5 py-2 hover:bg-gray-400"
                >
                  Daily Claim
                </button>
              </div>
            </div>

            <hr className="mt-6 border-t border-gray-300 w-5/6 mx-auto" />

            <div className="flex justify-center mt-1">
              <button 
                className="bg-[#013946] text-white font-bold px-6 py-3 hover:bg-[#436E95] hover:text-red-600"
                onClick={() => setIsModalOpen(true)}
              >
                Buy Holdings
              </button>
            </div>
          </>
        )}
      </div>

      <BuyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <Popup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Daily Reward"
        message="Claim your daily reward!"
        onCardFlip={(amount) => {
          // Update portfolio data directly
          setPortfolioData(prev => ({
            ...prev,
            cashBalance: prev.cashBalance + amount,
            totalValue: prev.totalValue + amount,
            currentValue: prev.currentValue + amount,
            streak: prev.streak + 1  // Increment streak by 1
          }));
        }}
      />
    </div>
  );
}
