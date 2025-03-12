import React, { useState } from 'react';
import api from './services/api';

function ApiTest() {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value.toString();
  };

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    // Test Portfolio Details
    try {
      console.log('Testing portfolio details endpoint...');
      const portfolioDetails = await api.getPortfolioDetails();
      results.portfolioDetails = {
        success: true,
        data: portfolioDetails,
        validation: {
          // Portfolio holdings validation
          portfolioLength: portfolioDetails.portfolio?.length || 0,
          portfolioFirstItem: portfolioDetails.portfolio?.[0] || null,
          
          // Account values validation
          buyingPower: portfolioDetails.buying_power,
          totalValue: portfolioDetails.total_value,
          
          // Daily returns validation
          dailyReturn: portfolioDetails.daily_returns?.daily_return,
          dailyReturnPercentage: portfolioDetails.daily_returns?.daily_return_percentage,
          stockReturnsCount: portfolioDetails.daily_returns?.stock_returns?.length || 0,
          
          // All time returns validation
          totalReturn: portfolioDetails.all_time_returns?.total_return,
          totalReturnPercentage: portfolioDetails.all_time_returns?.total_return_percentage,
          initialInvestment: portfolioDetails.all_time_returns?.initial_investment,
          currentValue: portfolioDetails.all_time_returns?.current_value
        }
      };
    } catch (error) {
      results.portfolioDetails = {
        success: false,
        error: error.message,
        validation: {
          portfolioLength: 0,
          portfolioFirstItem: null,
          buyingPower: null,
          totalValue: null,
          dailyReturn: null,
          dailyReturnPercentage: null,
          stockReturnsCount: 0,
          totalReturn: null,
          totalReturnPercentage: null,
          initialInvestment: null,
          currentValue: null
        }
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Test Panel</h2>
      <button
        onClick={runTests}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Run API Tests'}
      </button>

      {Object.entries(testResults).map(([endpoint, result]) => (
        <div key={endpoint} className="mt-4">
          <h3 className="font-bold capitalize">{endpoint.replace(/([A-Z])/g, ' $1').trim()}</h3>
          {result.success ? (
            <>
              <pre className="bg-green-100 p-2 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
              <div className="mt-2">
                <h4 className="font-semibold">Validation Values:</h4>
                <ul className="list-disc pl-5">
                  {Object.entries(result.validation).map(([key, value]) => (
                    <li key={key} className="text-gray-700">
                      <span className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>{' '}
                      <span className="font-mono">
                        {formatValue(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <pre className="bg-red-100 p-2 rounded">
              Error: {result.error}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export default ApiTest; 