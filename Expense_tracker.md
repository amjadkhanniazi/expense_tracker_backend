# Exp Tracker API Documentation

## Base URL
`http://localhost:5000`

## Authentication
All endpoints except `/api/auth/register`, `/api/auth/login`, `/api/auth/forgotpassword`, and `/api/auth/resetpassword` require a bearer token in the Authorization header.

## API Endpoints

### Auth

#### Register
- **Method**: POST
- **URL**: `/api/auth/register`
- **Body**:
  ```json
  {
    "username": "amjad",
    "email": "islamgk0897@gmail.com",
    "password": "SecureP@ss123"
  }
  ```

#### Login
- **Method**: POST
- **URL**: `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "islamgk0897@gmail.com",
    "password": "SecureP@ss123"
  }
  ```
- **Response**: Returns a token that should be stored for authenticated requests.

#### Logout
- **Method**: GET
- **URL**: `/api/auth/logout`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Get Current User
- **Method**: GET
- **URL**: `/api/auth/me`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Update User Details
- **Method**: PUT
- **URL**: `/api/auth/updatedetails`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "username": "alexdev",
    "email": "alex.dev@example.com"
  }
  ```

#### Update Password
- **Method**: PUT
- **URL**: `/api/auth/updatepassword`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "currentPassword": "SecureP@ss1234",
    "newPassword": "SecureP@ss123"
  }
  ```

#### Forgot Password
- **Method**: POST
- **URL**: `/api/auth/forgotpassword`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "islamgk0897@gmail.com"
  }
  ```

#### Reset Password
- **Method**: PUT
- **URL**: `/api/auth/resetpassword/1e2287d74f073ec6995db78cae8405c134d34eee`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "password": "SecureP@ss1234"
  }
  ```

### Categories

#### Create Category
- **Method**: POST
- **URL**: `/api/categories/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "name": "Groceries"
  }
  ```

#### Get All Categories
- **Method**: GET
- **URL**: `/api/categories/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Get A Category
- **Method**: GET
- **URL**: `/api/categories/681fa5b2c5b3bf02cd3e9398`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Update A Category
- **Method**: GET
- **URL**: `/api/categories/681fa5b2c5b3bf02cd3e9398`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "name": "Food & Groceries"
  }
  ```

#### Delete A Category
- **Method**: DELETE
- **URL**: `/api/categories/681fa5b2c5b3bf02cd3e9398`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

### Budget

#### Create A Budget
- **Method**: POST
- **URL**: `/api/budgets/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "category": "681fa8418bea41e16933070f",
    "amount": 500,
    "month": 5,
    "year": 2023
  }
  ```

#### Get All Budgets
- **Method**: GET
- **URL**: `/api/budgets/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Get Budget By Month
- **Method**: GET
- **URL**: `/api/budgets?month=5&year=2023`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Get A Single Budget
- **Method**: GET
- **URL**: `/api/budgets/681fa8b08bea41e169330713`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Update A Budget
- **Method**: PUT
- **URL**: `/api/budgets/681fa8b08bea41e169330713`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "amount": 609
  }
  ```

#### Delete A Budget
- **Method**: DELETE
- **URL**: `/api/budgets/681fa8b08bea41e169330713`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Budget Status With Spending Details
- **Method**: GET
- **URL**: `/api/budgets/summary/24`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

### Transactions

#### Create A Transaction
- **Method**: POST
- **URL**: `/api/transactions/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "amount": 1500,
    "type": "expense",
    "category": "681fa8418bea41e16933070f",
    "description": "Grocery shopping"
  }
  ```

#### Get All Transactions
- **Method**: GET
- **URL**: `/api/transactions/`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Get A Single Transaction
- **Method**: GET
- **URL**: `/api/transactions/681fb233faa2c3e207f29753`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Update A Transaction
- **Method**: PUT
- **URL**: `/api/transactions/681fb233faa2c3e207f29753`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Body**:
  ```json
  {
    "type": "expense",
    "category": "681fa8418bea41e16933070f",
    "amount": 52.75,
    "description": "Grocery shopping with additional items"
  }
  ```

#### Delete A Transaction
- **Method**: DELETE
- **URL**: `/api/transactions/681fb29cfaa2c3e207f29757`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

---