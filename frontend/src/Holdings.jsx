import { useState, useEffect } from "react";
import StockDisplay from "./StockDisplay";
import api from './services/api';
import { usePortfolio } from './context/PortfolioContext';
import axios from 'axios';
import Popup from "./Popup";

/**
 * Holdings Component
 * Displays the current portfolio holdings including:
 * - Stock symbols and descriptions
 * - Quantities and values
 * - Current prices and portfolio percentages
 * - Sell functionality for each position
 */
export default function Holdings() {
  // Get portfolio context for updates
  const { portfolioVersion } = usePortfolio();
  
  // State Management
  const [stockList, setStockList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Sell modal states
  const [sellPopupOpen, setSellPopupOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");

  // Format currency values with $ and commas
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Fetch and transform portfolio data
  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      // Try cached data first, then fetch from server
      const data = api.getCachedPortfolio() || await api.getPortfolioDetails();
      
      // Calculate total value of stock holdings
      const stocksValue = (data.all_time_returns?.current_value || 0) - (data.buying_power || 0);
      setTotalStockValue(stocksValue);
      
      // Transform API data into display format
      const transformedStocks = data.portfolio.map(stock => ({
        symbol: stock.symbol,
        description: stock.symbol,
        quantity: Number(stock.quantity).toFixed(2),
        price: formatCurrency(stock.current_price),
        avgPrice: formatCurrency(stock.average_price),
        currentValue: formatCurrency(stock.current_value),
        portPercent: ((stock.current_value / stocksValue) * 100).toFixed(0)
      }));

      setStockList(transformedStocks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to load holdings data');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for portfolio updates from other components
  useEffect(() => {
    const handlePortfolioUpdate = (event) => {
      const newData = event.detail;
      console.log('Portfolio update received:', newData);
      fetchPortfolioData();
    };

    window.addEventListener('portfolioUpdate', handlePortfolioUpdate);
    return () => window.removeEventListener('portfolioUpdate', handlePortfolioUpdate);
  }, []);

  // Handle opening sell modal for a stock
  const handleSellClick = (stock) => {
    setSelectedStock(stock);
    setSellPopupOpen(true);
  };

  // Process stock sale
  const handleSellConfirm = async () => {
    try {
      const result = await api.sellStock(selectedStock.symbol, Number(sellQuantity));
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded shadow-lg z-50';
      message.textContent = `Successfully sold ${sellQuantity} shares of ${selectedStock.symbol}`;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      // Close popup and reset state
      setSellPopupOpen(false);
      setSelectedStock(null);
      setSellQuantity("");

      // Portfolio will auto-refresh due to cache update event
    } catch (error) {
      console.error('Error selling stock:', error);
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg z-50';
      errorMessage.textContent = error.message || 'Error selling stock. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };

  // Show error state if fetch failed
  if (error) {
    return <div className="text-red-500 ml-42 mt-0">{error}</div>;
  }

  // Component render
  return (
    <div className="mx-auto max-w-7xl px-4 mt-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#013946" }}>Holdings</h2>
          {lastRefresh && (
            <p className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchPortfolioData}
          className="px-4 py-2 bg-[#013946] text-white rounded hover:bg-[#436E95]"
        >
          Refresh
        </button>
      </div>
      <div className="w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Symbol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Current Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Avg Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Current Value</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Portfolio %</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-pulse text-gray-500">Loading...</div>
                  </td>
                </tr>
              ) : stockList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No holdings found
                  </td>
                </tr>
              ) : (
                stockList.map((stock, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {stock.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {stock.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {stock.avgPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {stock.currentValue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {stock.portPercent}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => handleSellClick(stock)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sell Popup */}
      <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 ${sellPopupOpen ? '' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-xl w-[400px]">
          <div className="bg-[#013946] text-[#F0B627] px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-bold">Sell {selectedStock?.symbol}</h2>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quantity to Sell (max: {selectedStock?.quantity})
              </label>
              <input
                type="number"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                max={selectedStock?.quantity}
                min="0"
                step="0.01"
                className="shadow appearance-none border rounded w-[400px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Add sell value calculation */}
            {sellQuantity && Number(sellQuantity) > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-semibold">{selectedStock?.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{Number(sellQuantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-gray-200">
                  <span>Total Sale Value:</span>
                  <span className="text-green-600">
                    {formatCurrency(Number(sellQuantity) * Number(selectedStock?.price.replace(/[^0-9.-]+/g, "")))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSellPopupOpen(false);
                  setSelectedStock(null);
                  setSellQuantity("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSellConfirm}
                disabled={!sellQuantity || Number(sellQuantity) <= 0 || Number(sellQuantity) > Number(selectedStock?.quantity)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
