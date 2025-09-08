Setup for Oracle Autonomous DB (Wallet)

1. Place your wallet zip in the project root and unzip to ./wallet so it contains tnsnames.ora, sqlnet.ora, cwallet.sso, etc.
2. Create a .env file like:

PORT=3000
ORACLE_USER=your_user
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=yourdb_tp
ORACLE_WALLET_DIR=./wallet

3. Start the server:

npm run dev

Endpoints:
- GET /health
- GET /api/lost
- POST /api/lost { item_name, category, lost_location, description }
- GET /api/found
- POST /api/found { item_name, category, found_location, description }
- GET /api/matches
- POST /api/automatch

