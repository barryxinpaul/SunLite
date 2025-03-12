const API_BASE_URL = "http://localhost:8080/api";

/**
 * Legacy API methods - Kept for backward compatibility
 * These methods use the simpler promise-based approach
 */
export const tradingApi = {
  // User Management
  initializeUser: () =>
    fetch(`${API_BASE_URL}/initialize-user`, { method: "POST" }).then((res) =>
      res.json(),
    ),

  login: () =>
    fetch(`${API_BASE_URL}/login`, { method: "POST" }).then((res) =>
      res.json(),
    ),

  // Portfolio Management
  getPortfolio: () =>
    fetch(`${API_BASE_URL}/portfolio`).then((res) => res.json()),

  // Trading Operations
  buyStock: (symbol, amount) =>
    fetch(`${API_BASE_URL}/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, amount }),
    }).then((res) => res.json()),

  sellStock: (symbol, quantity) =>
    fetch(`${API_BASE_URL}/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, quantity }),
    }).then((res) => res.json()),

  // Market Data
  getStockPrice: (symbol) =>
    fetch(`${API_BASE_URL}/stock-price/${symbol}`).then((res) => res.json()),

  getBatchStockPrices: (symbols) =>
    fetch(`${API_BASE_URL}/stock-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols }),
    }).then((res) => res.json()),

  getS3P500Data: (page = 1) =>
    fetch(`${API_BASE_URL}/sp500-data?page=${page}`).then((res) => res.json()),
};

/**
 * Main API service object
 * Provides comprehensive portfolio and trading functionality
 */
const api = {
  /**
   * User Management Methods
   * Handle user initialization and authentication
   */
  async initializeUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/initialize-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to initialize user");
      return await response.json();
    } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
    }
  },

  async login() {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Login failed");
      return await response.json();
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  /**
   * Portfolio Management Methods
   * Handle fetching and updating portfolio data
   */

  /**
   * Fetches the current portfolio state
   * @returns {Promise<Object>} Portfolio data including holdings and cash balance
   * @throws {Error} If portfolio fetch fails
   */
  async getPortfolio() {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return await response.json();
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  },

  /**
   * Trading Operations
   * Handle buying and selling of stocks
   */

  /**
   * Execute a stock purchase
   * @param {string} symbol - Stock ticker symbol
   * @param {number} shares - Number of shares to buy (optional)
   * @param {number} amount - Dollar amount to invest (optional)
   * @returns {Promise<Object>} Transaction result and updated portfolio
   * @throws {Error} If purchase fails
   */
  async buyStock(symbol, shares, amount) {
    try {
      const requestBody = {
        symbol: symbol,
      };

      if (amount) {
        requestBody.amount = amount;
      } else if (shares) {
        requestBody.shares = shares;
      }

      const response = await fetch(`${API_BASE_URL}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Cache the latest portfolio data
      this.setCachedPortfolio(data.portfolio);

      return data;
    } catch (error) {
      console.error("Error buying stock:", error);
      throw error;
    }
  },

  /**
   * Execute a stock sale
   * @param {string} symbol - Stock ticker symbol
   * @param {number} quantity - Number of shares to sell
   * @returns {Promise<Object>} Transaction result and updated portfolio
   * @throws {Error} If sale fails
   */
  async sellStock(symbol, quantity) {
    try {
      const response = await fetch(`${API_BASE_URL}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sell stock");
      }

      // Get current portfolio data
      const currentPortfolio =
        this._latestPortfolio || (await this.getPortfolioDetails());

      // Find the stock in the portfolio
      const stockIndex = currentPortfolio.portfolio.findIndex(
        (stock) => stock.symbol === symbol,
      );
      if (stockIndex !== -1) {
        const stock = currentPortfolio.portfolio[stockIndex];
        const saleValue = quantity * stock.current_price;

        // Update the portfolio
        const updatedPortfolio = {
          ...currentPortfolio,
          buying_power: (currentPortfolio.buying_power || 0) + saleValue,
          portfolio: currentPortfolio.portfolio
            .map((s, index) => {
              if (index === stockIndex) {
                const newQuantity = s.quantity - quantity;
                // Remove stock if quantity is 0
                if (newQuantity <= 0) {
                  return null;
                }
                return {
                  ...s,
                  quantity: newQuantity,
                  current_value: newQuantity * s.current_price,
                };
              }
              return s;
            })
            .filter(Boolean), // Remove null entries (sold out positions)
        };

        // Update all_time_returns if it exists
        if (updatedPortfolio.all_time_returns) {
          updatedPortfolio.all_time_returns = {
            ...updatedPortfolio.all_time_returns,
            current_value: updatedPortfolio.portfolio.reduce(
              (total, stock) => total + stock.current_value,
              updatedPortfolio.buying_power,
            ),
          };
        }

        // Update cached portfolio data
        this.setCachedPortfolio(updatedPortfolio);
      }

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error("Error selling stock:", error);
      throw error;
    }
  },

  // Market Data
  async getStockPrice(symbol) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-price/${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch stock price");
      return await response.json();
    } catch (error) {
      console.error("Error fetching stock price:", error);
      throw error;
    }
  },

  async getBatchStockPrices(symbols) {
    try {
      const response = await fetch(`${API_BASE_URL}/stock-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols }),
      });
      if (!response.ok) throw new Error("Failed to fetch batch stock prices");
      return await response.json();
    } catch (error) {
      console.error("Error fetching batch stock prices:", error);
      throw error;
    }
  },

  async getS3P500Data(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/sp500-data?page=${page}`);
      if (!response.ok) throw new Error("Failed to fetch S&P 500 data");
      return await response.json();
    } catch (error) {
      console.error("Error fetching S&P 500 data:", error);
      throw error;
    }
  },

  // API Documentation
  async getApiDocs() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) throw new Error("Failed to fetch API documentation");
      return await response.json();
    } catch (error) {
      console.error("Error fetching API documentation:", error);
      throw error;
    }
  },

  /**
   * Portfolio Cache Management
   * Handle local caching of portfolio data for performance
   */

  // Store the latest portfolio data
  _latestPortfolio: null,

  /**
   * Update the cached portfolio data and notify components
   * @param {Object} data - New portfolio data to cache
   */
  setCachedPortfolio(data) {
    this._latestPortfolio = data;
    // Dispatch an event to notify components
    window.dispatchEvent(new CustomEvent("portfolioUpdate", { detail: data }));
  },

  /**
   * Get the currently cached portfolio data
   * @returns {Object|null} Cached portfolio data or null if not cached
   */
  getCachedPortfolio() {
    return this._latestPortfolio;
  },

  async getPortfolioDetails() {
    try {
      // If we have cached data, use it
      if (this._latestPortfolio) {
        console.log("Using cached portfolio data:", this._latestPortfolio);
        return this._latestPortfolio;
      }

      // Otherwise fetch from server
      const response = await fetch(`${API_BASE_URL}/portfolio/details`);
      if (!response.ok) throw new Error("Failed to fetch portfolio details");

      const data = await response.json();
      this.setCachedPortfolio(data); // Cache the fetched data
      return data;
    } catch (error) {
      console.error("Error fetching portfolio details:", error);
      throw error;
    }
  },

  /**
   * Clear the portfolio cache and notify components
   * Used when resetting or initializing a new portfolio
   */
  clearCache() {
    this._latestPortfolio = null;
    // Notify components that cache was cleared
    window.dispatchEvent(new CustomEvent("portfolioUpdate", { detail: null }));
  },

  async initializePortfolio() {
    try {
      // Clear the cache before initializing
      this.clearCache();

      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize portfolio");
      }

      // Cache the new initial portfolio data
      if (data.portfolio) {
        this.setCachedPortfolio(data.portfolio);
      }

      return data;
    } catch (error) {
      console.error("Error initializing portfolio:", error);
      throw error;
    }
  },

  /**
   * Daily Reward System
   * Handle daily login rewards and streak management
   */

  /**
   * Claim daily reward and update portfolio
   * @param {number} amount - Reward amount to add to portfolio
   * @returns {Promise<Object>} Updated portfolio data
   * @throws {Error} If claim fails
   */
  async claimDailyReward(amount) {
    try {
      const response = await fetch(`${API_BASE_URL}/claim-daily-reward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Failed to claim daily reward");

      const data = await response.json();

      if (data.success) {
        // Get current portfolio data
        const currentPortfolio =
          this._latestPortfolio || (await this.getPortfolioDetails());

        // Update buying power with claimed amount
        const updatedPortfolio = {
          ...currentPortfolio,
          buying_power: (currentPortfolio.buying_power || 0) + amount,
          all_time_returns: {
            ...currentPortfolio.all_time_returns,
            current_value:
              (currentPortfolio.all_time_returns?.current_value || 0) + amount,
          },
        };

        // Update cached portfolio data
        this.setCachedPortfolio(updatedPortfolio);
      }

      return data;
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      throw error;
    }
  },
};

export default api;

