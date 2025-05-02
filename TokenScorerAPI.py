#!/usr/bin/env python
# coding: utf-8

# In[ ]:


#!pip install flask-cors
#!pip install web3
#!pip install --upgrade --force-reinstall pandas numpy scikit-learn

# In[ ]:


#!/usr/bin/env python3
# Token Scorer API
# This script provides a Flask API for the token scoring engine

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from web3 import Web3
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# ------------------ CONFIG ------------------ #
INFURA_URL = "https://mainnet.infura.io/v3/4541a90c12644bad8a3f5ef811f79204"
ETHERSCAN_API_KEY = "YIV1RV1ZF983R4HC7PF5FBTYFHIHWQQT9V"

# Connect to Ethereum node
web3 = Web3(Web3.HTTPProvider(INFURA_URL))

# ------------------ ML MODEL ------------------ #
# Example training dataset: [wallet_growth, verified (0/1), top_holder_ratio, liquidity]
X_train = np.array([
    [800, 1, 0.3, 50000],
    [1000, 1, 0.2, 150000],
    [500, 0, 0.5, 10000],
    [1500, 1, 0.1, 200000]
])
# Target success scores (e.g., price % growth or internal score)
y_train = np.array([30, 60, 10, 90])

# Train linear regression model
ml_model = LinearRegression()
ml_model.fit(X_train, y_train)

# ------------------ UTILS ------------------ #
def get_token_info(address):
    """Get basic token info using ERC20 ABI."""
    if not web3.isConnected():
        return None, None, None
    
    try:
        erc20_abi = [
            {"constant": True, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
        ]
        contract = web3.eth.contract(address=web3.toChecksumAddress(address), abi=erc20_abi)
        name = contract.functions.name().call()
        symbol = contract.functions.symbol().call()
        supply = contract.functions.totalSupply().call()
        return name, symbol, supply
    except Exception as e:
        print(f"Error getting token info: {str(e)}")
        return None, None, None

def is_contract_verified(token_address):
    """Check if the contract is verified on Etherscan."""
    url = f"https://api.etherscan.io/api?module=contract&action=getabi&address={token_address}&apikey={ETHERSCAN_API_KEY}"
    try:
        r = requests.get(url).json()
        return r['status'] == '1'
    except Exception as e:
        print(f"Error checking contract verification: {str(e)}")
        return False

def get_top_holders(token_address):
    """Fetch top holders (simplified here)."""
    # In a production environment, this would query a real data source
    return 0.3  # Placeholder: e.g., 30% held by top 5 holders

def get_liquidity_from_uniswap(token_address):
    """Pull liquidity data from Uniswap Subgraph."""
    query = {
        "query": """
        {
          token(id: "%s") {
            derivedETH
            totalLiquidity
          }
        }
        """ % token_address.lower()
    }
    try:
        response = requests.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
            json=query,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'token' in data['data'] and data['data']['token'] is not None:
                return float(data['data']['token']['totalLiquidity'])
            else:
                print(f"Token {token_address} not found on Uniswap V2")
                return 0
        else:
            print(f"Error fetching Uniswap data: {response.status_code}")
            return 0
    except Exception as e:
        print(f"Exception while fetching Uniswap data: {str(e)}")
        return 0

def get_wallet_growth():
    """Simplified wallet growth estimate."""
    # This would normally use a real data source
    return np.random.randint(500, 1500)

def calculate_social_buzz(token_address):
    """Calculate social buzz score."""
    # In a production environment, this would query social media APIs
    return np.random.randint(30, 95)

def score_token(token_address):
    """Score a token based on multiple metrics."""
    # Get on-chain metrics
    wallet_growth = get_wallet_growth()
    verified = is_contract_verified(token_address)
    top_holders_ratio = get_top_holders(token_address)
    liquidity = get_liquidity_from_uniswap(token_address)

    # Calculate individual scores
    momentum_score = min(wallet_growth / 1500, 1.0) * 100
    credibility_score = 60 if verified else 30
    tokenomics_score = (1 - top_holders_ratio) * 100
    liquidity_score = min(liquidity / 100000, 1.0) * 100
    social_score = calculate_social_buzz(token_address)

    # --- ML Model Application (Keep this commented out) --- #
    # features = np.array([[wallet_growth, 1 if verified else 0, top_holders_ratio, liquidity]])
    # ml_score = ml_model.predict(features)[0]
    # --- End ML Model Application --- #

    return {
        "momentum": round(momentum_score),
        "credibility": round(credibility_score),
        "tokenomics": round(tokenomics_score),
        "liquidity": round(liquidity_score),
        "social": round(social_score)
    }

# ------------------ API ROUTES ------------------ #
@app.route('/api/token-score', methods=['GET'])
def get_token_score():
    """API endpoint to score a token."""
    token_query = request.args.get('query', '')
    
    # Check if the query is an Ethereum address
    is_address = token_query.startswith('0x') and len(token_query) == 42
    
    if is_address:
        # Score the token if it's an address
        name, symbol, supply = get_token_info(token_query)
        if not name:
            return jsonify({"error": "Invalid token address or contract not found"}), 400
            
        scores = score_token(token_query)
        
        return jsonify({
            "name": name,
            "symbol": symbol,
            "address": token_query,
            "supply": str(supply),
            **scores
        })
    else:
        # Handle token lookup by name/symbol
        # In a production environment, this would query a token database
        scores = {
            "momentum": np.random.randint(30, 95),
            "credibility": np.random.randint(30, 95),
            "tokenomics": np.random.randint(30, 95),
            "liquidity": np.random.randint(30, 95),
            "social": np.random.randint(30, 95)
        }
        
        return jsonify({
            "name": f"{token_query.title()} Token",
            "symbol": token_query.upper()[:4],
            "address": "0x" + "0" * 40,  # Placeholder address
            "supply": "1000000000000000000000000",  # Placeholder supply
            **scores
        })

# ------------------ SERVER ------------------ #
if __name__ == '__main__':
    print("Starting Token Scorer API...")
    # Corrected line:
    print(f"Connected to Ethereum: {web3.is_connected()}")
    app.run(debug=True, port=5000)

