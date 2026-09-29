## 🚀 QUICK START GUIDE - RepairHub Full Stack

### What's New
You now have a **complete full-stack application** with:
- ✅ Two separate login pages (Customer & Technician)
- ✅ Login required before accessing platform
- ✅ Express.js backend API with JWT authentication
- ✅ React frontend with state management
- ✅ Different dashboards for customers and technicians
- ✅ Fully functional booking system

---

## 📋 DEMO CREDENTIALS

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

---

## 🔧 HOW TO RUN (Windows PowerShell)

### Step 1: Start Backend Server
Open PowerShell and navigate to project:
```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\backend"
npm install
npm start
```

**You should see:**
```
🚀 RepairHub Backend running on port 5000
📝 Demo Login Credentials:
   Customer: customer@example.com / password123
   Technician: tech@example.com / password123
```

### Step 2: Start Frontend (New PowerShell Window)
```powershell
cd "c:\Users\Vedant Sachin Renge\Downloads\VNit\frontend"
npm install
npm start
```

**Website automatically opens at:** http://localhost:3000

---

## 🎯 TRY THE APP

### As a Customer:
1. Click "👤 Customer" tab
2. Use: customer@example.com / password123
3. Click "Login"
4. Search for technicians (City: "new york", Category: "Electronics & Phones")
5. Click "Book Now" on any technician
6. Follow prompts to provide item details

### As a Technician:
1. Click "🔧 Technician" tab
2. Use: tech@example.com / password123
3. Click "Login"
4. View incoming repair requests
5. Click "Accept Request" or "Decline"
6. Update status: Start Repair → Mark as Complete

---

## 📁 FOLDER STRUCTURE

```
VNit/
├── backend/                 (Express API Server)
│   ├── server.js           (Main API - port 5000)
│   ├── package.json
│   └── .env
│
├── frontend/               (React Web App)
│   ├── src/
│   │   ├── App.js         (Login/Platform switcher)
│   │   ├── components/
│   │   │   ├── Login.js   (Login page)
│   │   │   ├── Platform.js (Main app)
│   │   │   ├── CustomerDashboard.js
│   │   │   └── TechnicianDashboard.js
│   ├── public/index.html
│   ├── package.json
│   └── .env
```

---

## 🔐 FLOW

**Website Visit** → **Login Page** → **Choose Type** → **Enter Credentials** → **Dashboard**

---

## 🛠️ TECH STACK

**Backend:** Node.js + Express + JWT Auth + bcryptjs
**Frontend:** React + Axios + CSS3
**Database:** In-memory (demo mode - resets on restart)

---

## ✨ KEY FEATURES

**Customers:**
- Search technicians by location & category
- Book repairs with item details
- Track repair status
- View booking history

**Technicians:**
- Receive repair requests
- Accept/decline requests
- Update repair progress
- View profiles with ratings

---

## 🐛 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| "Cannot connect to API" | Make sure backend is running on port 5000 |
| "CORS error" | Both frontend and backend must be running |
| "Login fails" | Check demo credentials above |
| "No technicians found" | Use city: "new york", "los angeles", or "chicago" |
| "Token invalid" | Clear browser cache or logout/login again |

---

## 🚀 NEXT STEPS

**To customize:**
1. Edit colors in `frontend/src/App.css`
2. Add more technicians in `backend/server.js`
3. Change API port in `backend/.env`
4. Modify frontend API URL in `frontend/.env`

**For production:**
1. Connect to real database (MongoDB/PostgreSQL)
2. Use HTTPS
3. Change JWT_SECRET in backend
4. Add payment processing
5. Deploy to cloud (Heroku, AWS, Vercel, etc)

---

## 📞 TROUBLESHOOTING

1. **Clear npm cache if installation fails:**
   ```powershell
   npm cache clean --force
   npm install
   ```

2. **Kill process on port 5000 if it's already in use:**
   ```powershell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

3. **Clear browser localStorage:**
   - Press F12 in browser
   - Go to "Application" tab
   - Click "Local Storage"
   - Clear all data
   - Refresh page

---

## ✅ YOU'RE ALL SET!

Your RepairHub platform is ready to go. Both customer and technician flows are complete with:
- Secure authentication
- Real-time request management
- Status tracking
- Professional dashboards

**Enjoy!** 🎉
