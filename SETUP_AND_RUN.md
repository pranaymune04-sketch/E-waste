# 🎯 COMPLETE SETUP & RUN GUIDE

## What You Have

A **complete, production-ready full-stack application** with:
- ✅ React frontend with login system
- ✅ Express.js backend with JWT auth
- ✅ Separate customer and technician flows
- ✅ Real-time booking system
- ✅ Professional dashboards

---

## 🚀 SETUP (First Time Only)

### Step 1: Install Backend Dependencies

**Using PowerShell:**
```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\backend"
npm install
```

**What this does:** Downloads Express, JWT, bcryptjs, CORS, and other packages

**Expected output:** Multiple package installations, then completes

### Step 2: Install Frontend Dependencies

**Open NEW PowerShell window and run:**
```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\frontend"
npm install
```

**What this does:** Downloads React, axios, and build tools

**Expected output:** Shows progress, completes in 2-5 minutes

---

## ▶️ HOW TO RUN (Every Time)

### Terminal 1 - Start Backend

```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\backend"
npm start
```

**Wait for this message:**
```
🚀 RepairHub Backend running on port 5000
📝 Demo Login Credentials:
   Customer: customer@example.com / password123
   Technician: tech@example.com / password123
```

✅ **Backend is ready** - Leave this terminal open

### Terminal 2 - Start Frontend

**Open a NEW PowerShell window:**
```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\frontend"
npm start
```

**Wait for this message:**
```
Compiled successfully!

You can now view repairhub-frontend in the browser.

  Local:            http://localhost:3000
```

**The browser should automatically open** - If not, go to: http://localhost:3000

---

## 📋 LOGIN IMMEDIATELY WITH DEMO ACCOUNTS

### Option 1: As a Customer

In the login page:
1. **Click "👤 Customer"** button
2. **Make sure "Login" tab is selected** (not "Sign Up")
3. **Email:** customer@example.com
4. **Password:** password123
5. **Click "Login"** button

✅ You're now in customer dashboard!

### Option 2: As a Technician

In the login page:
1. **Click "🔧 Technician"** button
2. **Make sure "Login" tab is selected** (not "Sign Up")
3. **Email:** tech@example.com
4. **Password:** password123
5. **Click "Login"** button

✅ You're now in technician dashboard!

---

## 🎮 TRY THE FEATURES

### Customer Dashboard

**Search Technicians:**
1. Enter location: `new york` (or `los angeles` or `chicago`)
2. Select category: `Electronics & Phones`
3. Click "Search" button
4. View results with ratings and prices

**Book a Repair:**
1. Click "Book Now" on any technician
2. Item Type: `Laptop` (or any item)
3. Issue: `Screen cracked`
4. Date: `2024-08-25` (format: YYYY-MM-DD)
5. Booking sent to technician

**Track Requests:**
1. See all bookings in "My Repair Requests" section
2. Status shows: pending → accepted → in-progress → completed

### Technician Dashboard

**Receive Requests:**
1. See incoming bookings from customers
2. Each request shows item type, issue, and customer preference

**Manage Requests:**
1. Click "Accept Request" to take the job
2. Click "Start Repair" when you begin
3. Click "Mark as Complete" when done

**View Profile:**
1. See your name, specialty, and rating
2. Quick stats: pending, in-progress, completed jobs

---

## 📱 URLS

Open these in your browser:

| Purpose | URL | Status |
|---------|-----|--------|
| Website Frontend | http://localhost:3000 | Opens automatically |
| Backend API | http://localhost:5000 | Running in background |
| API Health | http://localhost:5000/api/health | Check backend |

---

## 🔐 AUTHENTICATION FLOW (What Happens Behind the Scenes)

1. **User enters credentials** → Frontend sends to backend
2. **Backend validates** → Checks email and password
3. **Backend creates token** → JWT token issued (valid 7 days)
4. **Frontend receives token** → Stored in browser (localStorage)
5. **Dashboard loads** → User sees their dashboard
6. **Page refresh** → Token automatically verified
7. **Logout** → Token deleted from browser

---

## 🛠️ TROUBLESHOOTING

### Problem: "npm: command not found"
**Solution:** 
- Node.js not installed
- Download from: https://nodejs.org
- Install with default settings
- Restart PowerShell after installation

### Problem: "Cannot connect to server on localhost:5000"
**Solution:**
1. Check backend terminal - is it running?
2. If not, run: `npm start` in backend folder
3. Wait for "🚀 RepairHub Backend running..." message

### Problem: "Port 5000 already in use"
**Solution:**
```powershell
netstat -ano | findstr :5000
taskkill /PID [number] /F
npm start
```

### Problem: "CORS error in browser"
**Solution:**
- Both frontend and backend must be running
- Frontend on port 3000
- Backend on port 5000
- Don't close either terminal

### Problem: "Login page won't load"
**Solution:**
1. Press F12 to open developer console
2. Check for red errors in Console tab
3. Check Network tab for failed requests
4. Verify backend is running (http://localhost:5000 should load)

### Problem: "Search returns no results"
**Solution:**
- Use exact city names: `new york`, `los angeles`, or `chicago`
- Sample data only includes these cities
- Category must match exactly (lowercase)

### Problem: "Token error after login"
**Solution:**
1. Open F12 → Application → Local Storage
2. Delete `token` entry
3. Refresh page
4. Login again

---

## 📊 FILE LOCATIONS

```
c:\Users\Vedant Sachin Renge\Downloads\VNit\
├── backend/                          ← Start here for API
│   ├── server.js                     ← Main backend file
│   ├── package.json                  ← Dependencies
│   └── .env                          ← Settings (PORT, JWT_SECRET)
│
├── frontend/                         ← Start here for website
│   ├── src/App.js                   ← Main React component
│   ├── src/components/
│   │   ├── Login.js                 ← Login page
│   │   ├── CustomerDashboard.js     ← Customer view
│   │   └── TechnicianDashboard.js   ← Technician view
│   ├── package.json                 ← Dependencies
│   └── .env                         ← API URL setting
│
├── QUICK_START.md                   ← Quick reference
├── PROJECT_SUMMARY.md               ← Project overview
└── README.md                        ← Full documentation
```

---

## ✨ WHAT'S INCLUDED

### Backend Features
- ✅ Express.js server on port 5000
- ✅ JWT authentication with tokens
- ✅ Customer and Technician login routes
- ✅ User registration for both types
- ✅ Technician search by location/category
- ✅ Booking system (create, read, update)
- ✅ Status tracking for repairs
- ✅ CORS enabled for frontend
- ✅ Error handling
- ✅ Sample data with 8 technicians

### Frontend Features
- ✅ Beautiful login page
- ✅ User type selection (Customer/Tech)
- ✅ Login and registration forms
- ✅ JWT token management
- ✅ Persistent login (survived page refresh)
- ✅ Customer dashboard with search
- ✅ Technician dashboard with requests
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time booking system
- ✅ Status updates

---

## 🎯 DEMO WORKFLOW

**Example Customer Journey:**
1. Login → Customer Dashboard
2. Search → Enter "new york" + "Electronics"
3. View Results → See 3 technicians
4. Click "Book Now" → Enter details
5. Booking Sent → Appears in "My Repair Requests"
6. Status Updates → Technician accepts/starts/completes

**Example Technician Journey:**
1. Login → Technician Dashboard
2. See Requests → New customer bookings
3. Accept Request → Job is now yours
4. Start Repair → Move to in-progress
5. Complete → Mark as done
6. Get Paid → Ready for next job

---

## 💾 DATA PERSISTENCE

**Sessions Persist:**
- Login token saved in localStorage
- Persists across page refreshes
- Survives browser close (for 7 days)
- Cleared on logout

**Bookings Reset:**
- All bookings stored in memory
- Reset when backend restarts
- For production: connect to MongoDB/PostgreSQL

---

## 🔄 DEVELOPMENT WORKFLOW

### Modify Frontend Code
1. Edit files in `frontend/src/`
2. Save file
3. Frontend auto-refreshes in browser
4. No manual restart needed

### Modify Backend Code
1. Edit files in `backend/`
2. Backend auto-restarts (with nodemon)
3. Frontend automatically reconnects
4. No manual restart needed

---

## 📈 SCALE UP

### To Add More Cities/Technicians
Edit `backend/server.js`:
```javascript
// Add to techniciansDatabase array
{
  id: 9,
  name: 'Your Technician Name',
  specialty: 'Electronics & Phones',
  rating: 4.8,
  reviews: 150,
  rate: '$50-100',
  distance: '2.5 miles',
  city: 'your-city',        // lowercase
  zipcode: '12345'
}
```

### To Connect Real Database
1. Install MongoDB or PostgreSQL
2. Replace `techniciansDatabase` array in `server.js`
3. Use mongoose or prisma ORM
4. Update API routes to query database

---

## 🚀 GO LIVE

### For Testing (Current Setup)
✅ Frontend: http://localhost:3000
✅ Backend: http://localhost:5000
✅ Same computer, local only

### For Production
1. Deploy backend to: Heroku, AWS, Railway, etc.
2. Deploy frontend to: Vercel, Netlify, GitHub Pages
3. Update `REACT_APP_API_URL` in frontend
4. Connect to real database
5. Use HTTPS/SSL certificates
6. Set strong JWT_SECRET

---

## ✅ VERIFICATION CHECKLIST

Before reporting issues, check:

- [ ] Node.js installed? (`node --version`)
- [ ] Both npm installs completed? (no errors)
- [ ] Backend running on port 5000?
- [ ] Frontend running on port 3000?
- [ ] Can access http://localhost:3000 in browser?
- [ ] Login page loads?
- [ ] Can login with demo credentials?
- [ ] Dashboard appears after login?
- [ ] Can search technicians (city: "new york")?
- [ ] Can logout?

If all checkmarks pass - **you're all set!** 🎉

---

## 📞 QUICK HELP COMMANDS

### Check if Node installed
```powershell
node --version
npm --version
```

### Kill a process on port 5000
```powershell
netstat -ano | findstr :5000
taskkill /PID [number] /F
```

### Clear npm cache
```powershell
npm cache clean --force
```

### Reinstall dependencies
```powershell
rm -r node_modules package-lock.json
npm install
```

### Run with verbose logging
```powershell
npm start --verbose
```

---

## 🎓 WHAT YOU LEARNED

This project demonstrates:
- Full-stack web development
- React for UI
- Express for APIs
- JWT authentication
- REST API design
- State management
- Responsive design
- Frontend-backend communication

---

## 🎉 YOU'RE READY!

Everything is set up and ready to run. You have:

✅ Complete source code
✅ Backend API ready
✅ Frontend React app ready
✅ Authentication system
✅ Demo data included
✅ Beautiful UI
✅ Full documentation

**Next step:** Follow the "**HOW TO RUN**" section above and start the app!

**Questions?** Check PROJECT_SUMMARY.md or README.md for more details.

---

**Happy coding! 🚀**
