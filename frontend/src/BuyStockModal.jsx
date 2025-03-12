import { useState, useEffect } from "react";
import api from './services/api';
import { usePortfolio } from './context/PortfolioContext';

export default function BuyStockModal({ isOpen, onClose, stock, onPurchaseComplete }) {
  const { refreshPortfolio } = usePortfolio();
  const [amount, setAmount] = useState("");
  const [shares, setShares] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // First useEffect - Reset states
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setShares(0);
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, stock]);

  // Second useEffect - Calculate shares
  useEffect(() => {
    if (amount && !isNaN(amount) && stock?.price) {
      setShares(Number(amount) / stock.price);
    } else {
      setShares(0);
    }
  }, [amount, stock?.price]);

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);
      
      const result = await api.buyStock(stock.symbol, null, Number(amount));
      
      setSuccessMessage(
        `Successfully bought stock ${stock.symbol} for ${formatCurrency(Number(amount))}`
      );

      // Refresh portfolio immediately
      refreshPortfolio();

      // Notify parent components
      if (onPurchaseComplete) {
        onPurchaseComplete(result.portfolio);
      }
      
      // Close after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setError(error.message || 'Failed to complete purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !stock) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white shadow-lg w-[400px] relative rounded-lg">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-lg font-bold text-[#F0B627] bg-[#013946] p-6 rounded-t-lg">
          Buy {stock.symbol}
        </h2>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">
              {successMessage}
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-lg font-semibold">${stock.price.toFixed(2)}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Invest
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Enter dollar amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shares to Buy:</span>
              <span className="font-semibold">{shares.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Cost:</span>
              <span className="font-semibold">{formatCurrency(Number(amount || 0))}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!amount || isNaN(amount) || Number(amount) <= 0 || isSubmitting}
              className="bg-[#013946] text-white px-6 py-2 rounded hover:bg-[#436E95] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 