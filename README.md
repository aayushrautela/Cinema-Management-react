# Cinema Ticket Purchasing System - ASP.NET Core + React

An ASP.NET Core Web API + React frontend application for online cinema ticket purchasing with seat reservation functionality.

## Features

- **User Registration & Management**: Users can register and edit their profiles (name, surname, phone number)
- **Admin Screening Management**: Administrators can create and delete film screenings
- **Seat Reservation**: Users can view room occupancy and reserve/release seats
- **Conflict Handling**: Database-level unique constraints prevent duplicate seat reservations
- **Concurrency Control**: Optimistic locking prevents concurrent user profile edits from overwriting each other
- **Bootstrap UI**: Responsive design using Bootstrap 5.3.3
- **Cross-Platform**: Runs on Linux, Windows, and macOS

## Technology Stack

- ASP.NET Core 8.0 Web API
- React 18 + TypeScript + Vite
- Entity Framework Core 8.0
- MySQL Database (using Pomelo.EntityFrameworkCore.MySql)
- ASP.NET Core Identity for authentication
- Bootstrap 5.3.3 for UI styling
- Axios for API calls

## Project Structure

```
Cinema-Management/
├── API/                    # API Controllers and DTOs
│   ├── Controllers/        # REST API endpoints
│   └── DTOs/              # Data Transfer Objects
├── ClientApp/             # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── services/      # API service layers
│   └── package.json
├── Data/                  # DbContext and database initialization
├── Models/                # Entity Framework models
├── legacy/                # Old MVC code (for reference)
├── wwwroot/               # Production React build output
├── scripts/               # Setup scripts
├── Program.cs             # API entry point
└── appsettings.json       # Configuration
```

## Prerequisites

- .NET 8.0 SDK or later
- Node.js 18+ and npm
- MySQL Server 8.0 or later

## Setup Instructions

### 1. Install Dependencies

```bash
# .NET SDK (Linux/Fedora)
sudo dnf install dotnet-sdk-8.0

# Node.js
sudo dnf install nodejs npm
```

### 2. Install MySQL

```bash
sudo dnf install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

Or use the provided script:
```bash
./scripts/setup-mysql-simple.sh
```

### 3. Configure Database

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CinemaDB;Uid=cinemauser;Pwd=coolpass;CharSet=utf8mb4;"
  },
  "SeedTestData": false
}
```

### 4. Build and Run (Development)

```bash
# Terminal 1: Start the API
dotnet run

# Terminal 2: Start React dev server
cd ClientApp
npm install
npm run dev
```

Open http://localhost:5173 - the React app proxies API calls to http://localhost:5000

### 5. Production Build

```bash
# Build React and output to wwwroot
cd ClientApp
npm run build

# Run production server
cd ..
dotnet run
```

Open http://localhost:5000 - serves React app + API from same port

## Default Users

- **Admin**: `admin@cinema.com` / `Admin@123`
- Test users available when `SeedTestData: true`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/check | Check authentication status |
| GET | /api/screenings | List all screenings |
| GET | /api/screenings/{id} | Get screening with seat status |
| POST | /api/screenings | Create screening (Admin) |
| DELETE | /api/screenings/{id} | Delete screening (Admin) |
| GET | /api/reservations/my | Get user's reservations |
| POST | /api/reservations | Reserve a seat |
| DELETE | /api/reservations | Release a seat |
| GET | /api/users | List all users (Admin) |
| PUT | /api/users/{id} | Update user profile |
| DELETE | /api/users/{id} | Delete user (Admin) |
| GET | /api/cinemas | List all cinemas |

## License

This project is for educational purposes.
