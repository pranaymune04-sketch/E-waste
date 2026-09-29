// Firebase Configuration & Google Authentication Handler

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemo-Key-RepairHub-GCP-Project",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "repairhub-production.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "repairhub-production",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "repairhub-production.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "918273645012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:918273645012:web:a1b2c3d4e5f6g7h8"
};

// Google Sign-In Provider Simulation / Firebase Bridge
export const triggerGoogleAuth = async ({ userType, specialty, city, customName, customEmail }) => {
  // Returns formatted user profile object for Google Sign In
  const mockNames = userType === 'technician' 
    ? ['Alex Rivera (Certified Tech)', 'Marcus Taylor (Pro Repair)', 'David Kim (Senior Specialist)']
    : ['Sarah Jenkins', 'Michael Davis', 'Elena Rostova'];
  
  const chosenName = customName || mockNames[Math.floor(Math.random() * mockNames.length)];
  const emailSlug = chosenName.toLowerCase().replace(/[^a-z0-9]/g, '.');
  const chosenEmail = customEmail || `${emailSlug}@gmail.com`;
  const photoSeed = encodeURIComponent(chosenName);

  return {
    email: chosenEmail,
    name: chosenName,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${photoSeed}`,
    userType,
    specialty: specialty || 'Electronics & Phones',
    city: city || 'New York'
  };
};
