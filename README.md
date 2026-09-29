# RepairHub - Full Stack Application

A modern, full-stack Local Repair Economy Platform with separate **Customer** and **Technician** login flows, built with React and Node.js/Express.

## 🚀 Features

### Customer Features
- **User Authentication** - Secure login/signup for customers
- **Search Technicians** - Find verified technicians by location and category
- **Book Repairs** - Request repairs with item details and preferred pickup date
- **Track Orders** - Monitor repair request status in real-time
- **Transparent Pricing** - See technician rates upfront

### Technician Features
- **User Authentication** - Secure login/signup for technicians
- **Manage Profile** - Display specialty and credentials
- **View Requests** - See incoming customer repair requests
- **Accept/Decline** - Manage repair requests efficiently
- **Track Progress** - Update repair status (pending → accepted → in-progress → completed)
- **Build Reputation** - Rating and review system

## 📁 Project Structure

```
VNit/
├── backend/                    # Express.js API server
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── README.md              # Backend documentation
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.js            # Main App component
│   │   ├── index.js          # React entry point
│   │   ├── components/
│   │   │   ├── Login.js      # Login/Register page
│   │   │   ├── Login.css
│   │   │   ├── Platform.js   # Main platform wrapper
│   │   │   ├── Navbar.js     # Navigation bar
│   │   │   ├── CustomerDashboard.js
│   │   │   ├── TechnicianDashboard.js
│   │   │   ├── Dashboard.css
│   │   │   └── Platform.css
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment variables
│   └── README.md             # Frontend documentation
│
└── README.md                 # This file
```

## 🔧 Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Frontend
- **React** - UI framework
- **axios** - HTTP client
- **CSS3** - Styling

## 📋 Demo Credentials

### Customer Login
```
Email: customer@example.com
Password: password123
```

### Technician Login
```
Email: tech@example.com
Password: password123
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

#### 1. Clone/Navigate to project
```bash
cd c:\Users\Vedant Sachin Renge\Downloads\VNit
```

#### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:5000`

The server logs will show:
```
🚀 RepairHub Backend running on port 5000
📝 Demo Login Credentials:
   Customer: customer@example.com / password123
   Technician: tech@example.com / password123
```

#### 3. Frontend Setup (in new terminal)
```bash
cd frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000` and automatically open in your browser.

## 🔐 Authentication Flow

1. **Login Page Opens First** - User must login before accessing platform
2. **Choose User Type** - Customer or Technician buttons
3. **Login/Register** - Enter credentials or create new account
4. **JWT Token** - Backend issues secure token
5. **Access Platform** - Token stored in localStorage
6. **Auto-Verify** - Token verified on app load
7. **Logout** - Token cleared on logout

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/customer-login` - Customer login
- `POST /api/auth/customer-register` - Customer signup
- `POST /api/auth/technician-login` - Technician login
- `POST /api/auth/technician-register` - Technician signup
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout

### Technicians
- `GET /api/technicians` - Get all technicians
- `GET /api/technicians/search` - Search by location/category
- `GET /api/technicians/:id` - Get technician details

### Bookings
- `POST /api/bookings` - Create booking (customer)
- `GET /api/bookings` - Get user's bookings
- `PUT /api/bookings/:id` - Update booking status (technician)

## 💻 Usage Guide

### For Customers

1. **Login** with customer credentials (or sign up)
2. **Search Technicians**
   - Enter location (try: "new york", "los angeles", "chicago")
   - Select repair category
   - Click "Search"
3. **View Technicians**
   - See ratings, reviews, and hourly rates
   - Review distance and specialty
4. **Book a Repair**
   - Click "Book Now" on any technician
   - Provide item type, issue description, pickup date
   - Request will be sent to technician
5. **Track Status**
   - View all repair requests
   - See status: pending → accepted → in-progress → completed

### For Technicians

1. **Login** with technician credentials (or sign up)
2. **View Dashboard**
   - See profile with specialty and rating
   - View quick stats
3. **Manage Requests**
   - Accept or decline incoming requests
   - Update repair progress
4. **Complete Repairs**
   - Move through status flow
   - Mark as complete when done

## 🛠️ Customization

### Change API URL
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Modify Colors
Edit `frontend/src/App.css` - CSS variables:
```css
:root {
  --primary-color: #2563eb;
  --primary-dark: #1e40af;
  /* ... other variables */
}
```

### Add More Technicians
Edit `backend/server.js` - `techniciansDatabase` array

### Change Port
Edit `backend/.env`:
```env
PORT=5000
```

## 📝 Database Notes

Currently uses **in-memory storage** for demo. In production, replace with:
- MongoDB
- PostgreSQL
- MySQL
- Firebase

Data will reset when server restarts.

## 🔒 Security Notes

⚠️ **For Production:**
1. Change `JWT_SECRET` in `.env`
2. Enable HTTPS
3. Use real database
4. Add additional validation
5. Implement rate limiting
6. Add CSRF protection
7. Use secure password policies
8. Implement proper error handling

## 📦 Building for Production

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

Build output goes to `frontend/build/`

## 🐛 Troubleshooting

### "Cannot POST /api/auth/customer-login"
- Check backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend/.env

### "CORS error"
- Backend CORS is enabled by default
- Check both servers are running

### "Token invalid"
- Clear localStorage: F12 → Application → Local Storage → Clear
- Login again

### Technician search returns no results
- Use exact city names: "new york", "los angeles", "chicago"
- Sample data only includes these cities

## 📞 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check terminal output for server logs
3. Verify both frontend and backend are running
4. Check environment variables

## 📄 License

Open source educational project.

---

**RepairHub** - Making repair accessible, affordable, and sustainable. 🚀
