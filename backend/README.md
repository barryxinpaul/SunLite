# Stock Trading Application

A full-stack stock trading application that allows users to manage virtual portfolios, track performance, and maintain trading streaks. The application uses real-time stock data from Yahoo Finance and provides a gamified trading experience with streak rewards.

## Technologies Used

### Backend
- **Python 3.11+**
- **Flask**: Web framework for the REST API
- **MongoDB**: Database for storing user portfolios and stock data
- **yfinance**: Yahoo Finance API wrapper for real-time stock data
- **Flask-CORS**: Cross-Origin Resource Sharing support
- **python-dotenv**: Environment variable management

### Frontend
- **Node.js**: JavaScript runtime
- **Package management**: npm/yarn (as indicated by package.json)

## Features

- Real-time stock price tracking
- Virtual portfolio management
- Buy and sell stocks with virtual currency
- Daily login streak system with rewards
- Portfolio performance tracking (daily and all-time returns)
- Stock price caching system for improved performance
- User authentication and session management
- Cross-origin resource sharing support for frontend integration

## Prerequisites

- Python 3.11 or higher
- MongoDB Atlas account or local MongoDB installation
- Node.js and npm (for frontend development)
- Git

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your MongoDB connection string:
```
DB_URI="your-mongodb-connection-string"
```

## Running the Application

1. Make sure your MongoDB instance is running and accessible

2. Start the Flask backend server:
```bash
python run.py
```
The server will start on http://127.0.0.1:8080

## API Endpoints

The API is accessible under the `/api` prefix. Main endpoints include:

- Portfolio Management
  - GET `/api/portfolio`: Get user's current portfolio
  - POST `/api/buy`: Buy stocks
  - POST `/api/sell`: Sell stocks

- Performance Tracking
  - GET `/api/returns/daily`: Get daily returns
  - GET `/api/returns/alltime`: Get all-time returns

- Streak System
  - GET `/api/streak`: Get current streak information
  - POST `/api/streak/update`: Update login streak

## Testing

The application includes comprehensive test suites:
- `test_trading.py`: Tests for core trading functionality
- `test_returns.py`: Tests for return calculations
- `test_streak.py`: Tests for streak system

Run tests using:
```bash
python -m pytest
```

## Project Structure

- `app.py`: Main Flask application configuration
- `run.py`: Application entry point
- `trading.py`: Core trading logic and portfolio management
- `utils.py`: Utility functions
- `controllers/`: API route handlers
- `tickers.txt`: List of supported stock symbols
- `requirements.txt`: Python dependencies

## Initial Setup

When first running the application:
1. A new user starts with $10,000 in virtual buying power
2. The streak system is initialized
3. Stock data cache is created for improved performance

## Security Notes

- The application uses environment variables for sensitive data
- CORS is enabled for development but should be configured appropriately for production
- MongoDB connection strings should be kept secure and never committed to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here] 