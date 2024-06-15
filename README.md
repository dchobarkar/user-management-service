# User Management Microservice

This project is a Nest.js microservice for managing users. It includes caching for frequently accessed data, supports searching users, and allows users to block other users so that ignored users are not visible in search results. The service uses PostgreSQL as the database.

## Project Setup

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- npm (v6 or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dchobarkar/user-management-system.git
cd user-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
JWT_SECRET_KEY=your_jwt_secret
```

4. Start the application:

```bash
npm run start:dev
```

## Endpoints

### AuthController

#### 1. Generate JWT Token

**Endpoint:** `GET /auth/token`

**Description:** Generates a JWT token for a given user ID. This token is used to authenticate subsequent requests.

**Request:**

```json
{
  "id": 1
}
```

**Response:**

```json
{
  "token": "your_generated_jwt_token"
}
```

### UserController

#### 2. Create User

**Endpoint:** `POST /users`

**Description:** Creates a new user.

**Request:**

```json
{
  "name": "John",
  "surname": "Doe",
  "username": "johndoe",
  "birthdate": "1990-01-01"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "username": "johndoe",
  "birthdate": "1990-01-01"
}
```

#### 3. Get All Users

**Endpoint:** `GET /users`

**Description:** Retrieves all users.

**Response:**

```json
[
  {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "username": "johndoe",
    "birthdate": "1990-01-01"
  },
  {
    "id": 2,
    "name": "Jane",
    "surname": "Smith",
    "username": "janesmith",
    "birthdate": "1985-05-15"
  }
]
```

#### 4. Get User by ID

**Endpoint:** `GET /users/:id`

**Description:** Retrieves a user by their ID.

**Response:**

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "username": "johndoe",
  "birthdate": "1990-01-01"
}
```

#### 5. Update User

**Endpoint:** `PUT /users/:id`

**Description:** Updates a user's details.

**Request:**

```json
{
  "name": "John",
  "surname": "Doe",
  "username": "johndoe123",
  "birthdate": "1990-01-01"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  "username": "johndoe123",
  "birthdate": "1990-01-01"
}
```

#### 6. Delete User

**Endpoint:** `DELETE /users/:id`

**Description:** Deletes a user by their ID.

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

#### 7. Search Users

**Endpoint:** `GET /users/search`

**Description:** Searches for users by username and/or age range. Users who have been blocked by the requester are not included in the results.

**Query Parameters:**

- `username` (optional)
- `minAge` (optional)
- `maxAge` (optional)

**Request:**

```
GET /users/search?username=johndoe&minAge=25&maxAge=35
```

**Response:**

```json
[
  {
    "id": 2,
    "name": "Jane",
    "surname": "Smith",
    "username": "janesmith",
    "birthdate": "1985-05-15"
  }
]
```

### BlockController

#### 8. Block User

**Endpoint:** `PUT /block/:blockedUserId`

**Description:** Blocks a user, preventing them from appearing in search results for the requester.

**Request:**

```
POST /block/2
```

**Response:**

```json
{
  "message": "User blocked successfully"
}
```

#### 9. Unblock User

**Endpoint:** `PUT /block/:blockedUserId/unblock`

**Description:** Unblocks a previously blocked user.

**Request:**

```
POST /block/2/unblock
```

**Response:**

```json
{
  "message": "User unblocked successfully"
}
```

## Testing

To run the tests, use the following command:

```bash
npm run test
```

## Contact

Darshan Chobarkar - [@dchobarkar](https://www.linkedin.com/in/dchobarkar/) - [@barbatos\_\_08](https://twitter.com/barbatos__08) - contact@darshanwebdev.com

Project Link: [https://github.com/dchobarkar/user-management-system](https://github.com/dchobarkar/user-management-system)
