import { useState, useEffect } from "react";
import api from './services/api';

export default function BuyModal({ isOpen, onClose }) {
    if (!isOpen) return null;
  
    const [page, setPage] = useState(1)
    const [stockList, setStockList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [amount, setAmount] = useState("");

    // Format currency values
    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Update dollar amounts when amount changes
    const handleAmountChange = (e) => {
        const newAmount = e.target.value;
        setAmount(newAmount);
        
        // Update dollar amounts for each stock based on their percentages
        if (newAmount && !isNaN(newAmount)) {
            const inputAmount = Number(newAmount);
            setStockList(prevStocks => 
                prevStocks.map(stock => ({
                    ...stock,
                    dollar: (inputAmount * (Number(stock.percent) / 100))
                }))
            );
        } else {
            // Reset dollar amounts if input is invalid
            setStockList(prevStocks => 
                prevStocks.map(stock => ({
                    ...stock,
                    dollar: 0
                }))
            );
        }
    };

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                setIsLoading(true);
                const data = await api.getPortfolioDetails();
                
                // Calculate total stock value
                const stocksValue = (data.all_time_returns?.current_value || 0) - (data.buying_power || 0);
                
                // Transform portfolio data into required format
                const transformedStocks = data.portfolio.map(stock => ({
                    company: stock.symbol,
                    value: formatCurrency(stock.current_price),
                    shares: stock.quantity,
                    percent: ((stock.current_value / stocksValue) * 100).toFixed(0),
                    dollar: 0
                }));

                setStockList(transformedStocks);
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
                setError('Failed to load holdings data');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchPortfolioData();
            setAmount(""); // Reset amount when modal opens
        }
    }, [isOpen]);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
        <div className="bg-white shadow-lg w-[600px] relative">
          <button
            className="absolute top-1 right-3 text-white hover:text-gray-400 text-xl"
            onClick={onClose}
          >
            &times;
          </button>
  
          <h2 className="text-lg font-bold text-[#F0B627] bg-[#013946] p-6 text-center">
            Buy to Qtrade Securities Inc.
          </h2>
  
            {
                page === 1 ? (
                    <div className="px-10 py-6">
            <p className="text-[#013946] font-semibold mb-1 ">Enter Amount</p>
            <input
              type="number"
              className="w-full border border-gray-300 p-2"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              min="0"
              step="0.01"
            />
  
            <hr className="my-4 border-gray-300" />
  
            <p className="font-semibold text-[#013946] mb-2">Holdings</p>
  
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Value</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Shares</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">%</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">$</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center">
                          <div className="animate-pulse text-gray-500">Loading...</div>
                        </td>
                      </tr>
                    ) : stockList.map((stock, index) => (
                      <tr 
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                          {stock.company}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                          {stock.value}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                          {stock.shares}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                          {stock.percent}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-500">
                          {formatCurrency(stock.dollar)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center mt-4">
                <button
                className="bg-gray-300 text-black font-semibold px-4 py-1 hover:bg-gray-400"
                onClick={() => {
                    setPage(2)
                    }}
                >
                Buy
                </button>
            </div>
          </div>
                ) : (
                    <div className="px-10 py-6">
                    <button onClick={() => setPage(1)} className="text-black text-left">
                      &lt; back
                    </button>
                
                  
                    <div className="bg-gray-100 p-6 mt-4">

                    <h2 className="text-lg font-bold text-[#013946] mb-4 text-center">Review Order</h2>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <p className="font-semibold">Order type:</p>
                          <p className="font-thin">Limit buy</p>
                        </div>
                        
                        <div className="flex justify-between">
                          <p className="font-semibold">Account:</p>
                          <p className="font-thin">TFSA</p>
                        </div>
                  
                        <div className="flex justify-between">
                          <p className="font-semibold">Cost:</p>
                          <p className="font-thin">{formatCurrency(Number(amount))}</p>
                        </div>
                  
                        <div className="flex justify-between border-b border-gray-300 pb-2">
                          <p className="font-semibold">Commission fee:</p>
                          <p className="font-thin">{formatCurrency(4)}</p>
                        </div>
                  
                        <div className="flex justify-between mt-6">
                          <p className="font-semibold">Total:</p>
                          <p className="font-normal">{formatCurrency(Number(amount) + 4)}</p>
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex justify-center mt-4">
                      <button className="bg-gray-100 text-red-500 font-semibold px-6 py-2 hover:bg-gray-300"
                      onClick={onClose}>
                        Confirm Purchase
                      </button>
                    </div>
                  </div>
                           
            )
            }
          
        </div>
      </div>
    );
  }
