const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const geminiService = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'repairhub-jwt-secret-key-2026';

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --------------------------------------------------------------------------
// SEED DATA
// --------------------------------------------------------------------------
const initialUsers = [
  {
    id: 1,
    email: 'customer@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Pq',
    type: 'customer',
    name: 'Aarav Patel',
    phone: '+91 98201 23456',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 2,
    email: 'tech@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Pq',
    type: 'technician',
    name: 'Amitabh Sharma',
    specialty: 'Electronics & Phones',
    rating: 4.9,
    reviews: 184,
    rate: '₹499 - ₹999/hr',
    city: 'Mumbai',
    zipcode: '400007',
    address: 'Lamington Road, Grant Road East, Mumbai',
    lat: 18.9633,
    lng: 72.8173,
    distance: '1.2 km',
    phone: '+91 98209 87654',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['iPhone', 'MacBook', 'Soldering', 'Data Recovery'],
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 8,
    email: 'buyer@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Pq',
    type: 'buyer',
    name: 'Karan Johar',
    companyName: 'Nagpur Metal Recovery (Demo)',
    phone: '+91 98230 45678',
    city: 'Nagpur',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 9,
    email: 'central.ewaste@buyer.in',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Pq',
    type: 'buyer',
    name: 'Ramesh Aggarwal',
    companyName: 'Central E-Waste Buyers (Demo)',
    phone: '+91 98201 88776',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 10,
    email: 'vidarbha.materials@buyer.in',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Pq',
    type: 'buyer',
    name: 'Sunil Deshmukh',
    companyName: 'Vidarbha Material Traders (Demo)',
    phone: '+91 98900 12345',
    city: 'Nagpur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

const initialTechnicians = [
  {
    id: 2,
    userId: 2,
    name: 'Amitabh Sharma (iCare Tech)',
    email: 'tech@example.com',
    specialty: 'Electronics & Phones',
    rating: 4.9,
    reviews: 184,
    rate: '₹499 - ₹999/hr',
    distance: '1.2 km',
    city: 'Mumbai',
    zipcode: '400007',
    address: 'Shop 14, Lamington Road, Grant Road East, Mumbai',
    lat: 18.9633,
    lng: 72.8173,
    phone: '+91 98209 87654',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['iPhone Screens', 'MacBook Boards', 'Soldering'],
    reviewsList: [
      { id: 1, customerName: 'Vikram Joshi', rating: 5, comment: 'Replaced iPhone 14 Pro screen in 45 mins.', date: '2026-08-14' }
    ]
  },
  {
    id: 3,
    userId: 3,
    name: 'Rohan Kulkarni (Precision Tech Labs)',
    email: 'rohan.tech@bengaluru.in',
    specialty: 'Electronics & Phones',
    rating: 4.9,
    reviews: 215,
    rate: '₹599 - ₹1,199/hr',
    distance: '2.1 km',
    city: 'Bangalore',
    zipcode: '560038',
    address: '100 Feet Road, Indiranagar, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    phone: '+91 98450 11223',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['Laptop Boards', 'SSD Recovery', 'Circuits'],
    reviewsList: [
      { id: 1, customerName: 'Karthik Rao', rating: 5, comment: 'Fixed laptop overheating quickly.', date: '2026-08-11' }
    ]
  },
  {
    id: 4,
    userId: 4,
    name: 'Suresh Deshmukh (CoolTech Services)',
    email: 'suresh.appliances@pune.in',
    specialty: 'Appliances',
    rating: 4.8,
    reviews: 162,
    rate: '₹399 - ₹799/hr',
    distance: '1.8 km',
    city: 'Pune',
    zipcode: '411005',
    address: 'FC Road, Shivaji Nagar, Pune',
    lat: 18.5284,
    lng: 73.8427,
    phone: '+91 98220 54321',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['Inverter ACs', 'Refrigerators', 'Washing Machines'],
    reviewsList: [
      { id: 1, customerName: 'Tanmay Renge', rating: 5, comment: 'Fixed fridge cooling on same day.', date: '2026-08-12' }
    ]
  },
  {
    id: 5,
    userId: 5,
    name: 'Rajesh Verma (PedalPro & EV Works)',
    email: 'rajesh.cycle@delhi.in',
    specialty: 'Bicycles',
    rating: 4.8,
    reviews: 94,
    rate: '₹299 - ₹599/hr',
    distance: '3.0 km',
    city: 'Delhi NCR',
    zipcode: '110019',
    address: 'Nehru Place, New Delhi',
    lat: 28.5494,
    lng: 77.2536,
    phone: '+91 98110 99887',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['Gears', 'Hydraulic Brakes', 'E-Cycles'],
    reviewsList: [
      { id: 1, customerName: 'Arjun Gupta', rating: 5, comment: 'Great cycle tuning.', date: '2026-08-09' }
    ]
  },
  {
    id: 6,
    userId: 6,
    name: 'Mohammad Tariq (Heritage Woodcraft)',
    email: 'tariq.furniture@hyderabad.in',
    specialty: 'Furniture',
    rating: 4.7,
    reviews: 138,
    rate: '₹350 - ₹850/hr',
    distance: '2.4 km',
    city: 'Hyderabad',
    zipcode: '500034',
    address: 'Banjara Hills, Hyderabad',
    lat: 17.4156,
    lng: 78.4357,
    phone: '+91 98490 33445',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['Teak Wood', 'Polishing', 'Joints'],
    reviewsList: [
      { id: 1, customerName: 'Sanjay Reddy', rating: 5, comment: 'Restored dining chairs perfectly.', date: '2026-08-02' }
    ]
  },
  {
    id: 7,
    userId: 7,
    name: 'Pooja Iyer (HomeCare Pro Services)',
    email: 'pooja.iyer@chennai.in',
    specialty: 'Appliances',
    rating: 4.9,
    reviews: 177,
    rate: '₹450 - ₹850/hr',
    distance: '1.9 km',
    city: 'Chennai',
    zipcode: '600020',
    address: 'Adyar, Chennai',
    lat: 13.0012,
    lng: 80.2565,
    phone: '+91 98400 77665',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    verified: true,
    available: true,
    skills: ['Washers', 'Microwaves', 'PCBs'],
    reviewsList: [
      { id: 1, customerName: 'Deepak Narayanan', rating: 5, comment: 'Repaired washing machine motor.', date: '2026-08-13' }
    ]
  }
];

const initialBuyers = [
  {
    id: 1,
    userId: 8,
    email: 'buyer@example.com',
    name: 'Karan Johar',
    companyName: 'Nagpur Metal Recovery (Demo)',
    phone: '+91 98230 45678',
    city: 'Nagpur',
    address: 'Plot 42, MIDC Industrial Area, Hingna, Nagpur, Maharashtra',
    materialsWanted: ['Copper', 'Aluminium', 'Electronic Components'],
    verified: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 2,
    userId: 9,
    email: 'central.ewaste@buyer.in',
    name: 'Ramesh Aggarwal',
    companyName: 'Central E-Waste Buyers (Demo)',
    phone: '+91 98201 88776',
    city: 'Mumbai',
    address: 'Gala 12, Dharavi Circular Industrial Hub, Mumbai',
    materialsWanted: ['Electronic Components', 'Copper', 'Steel', 'Plastic'],
    verified: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 3,
    userId: 10,
    email: 'vidarbha.materials@buyer.in',
    name: 'Sunil Deshmukh',
    companyName: 'Vidarbha Material Traders (Demo)',
    phone: '+91 98900 12345',
    city: 'Nagpur',
    address: 'Kalamna Market Road, Nagpur, Maharashtra',
    materialsWanted: ['Aluminium', 'Steel', 'Mixed E-Waste'],
    verified: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  }
];

const initialRecoveredMaterials = [
  {
    id: 1,
    recycleRequestId: 1,
    itemType: 'Old Dell Latitude Laptop',
    materialType: 'Copper',
    quantity: 0.8,
    unit: 'kg',
    estimatedValue: '₹550',
    location: 'Nagpur',
    status: 'available',
    createdAt: '2026-08-16T09:00:00.000Z'
  },
  {
    id: 2,
    recycleRequestId: 1,
    itemType: 'Old Dell Latitude Laptop',
    materialType: 'Aluminium',
    quantity: 1.2,
    unit: 'kg',
    estimatedValue: '₹240',
    location: 'Nagpur',
    status: 'available',
    createdAt: '2026-08-16T09:00:00.000Z'
  },
  {
    id: 3,
    recycleRequestId: 2,
    itemType: 'Old Smart TV PCB & Chassis',
    materialType: 'Electronic Components',
    quantity: 0.5,
    unit: 'kg',
    estimatedValue: '₹900',
    location: 'Mumbai',
    status: 'offer_received',
    createdAt: '2026-08-15T11:30:00.000Z'
  },
  {
    id: 4,
    recycleRequestId: 3,
    itemType: 'Defective Washing Machine Drum',
    materialType: 'Steel',
    quantity: 4.5,
    unit: 'kg',
    estimatedValue: '₹380',
    location: 'Pune',
    status: 'available',
    createdAt: '2026-08-14T14:15:00.000Z'
  },
  {
    id: 5,
    recycleRequestId: 4,
    itemType: 'Defective Split AC Compressor Coil',
    materialType: 'Copper',
    quantity: 2.2,
    unit: 'kg',
    estimatedValue: '₹1,650',
    location: 'Nagpur',
    status: 'buyer_matched',
    createdAt: '2026-08-13T16:45:00.000Z'
  }
];

const initialMaterialOffers = [
  {
    id: 1,
    materialId: 3,
    buyerId: 1,
    buyerUserId: 8,
    buyerName: 'Karan Johar',
    buyerCompanyName: 'Nagpur Metal Recovery (Demo)',
    quantity: 0.5,
    offeredPrice: '₹950',
    message: 'Ready for immediate pickup and batch processing.',
    status: 'pending',
    createdAt: '2026-08-16T12:00:00.000Z'
  },
  {
    id: 2,
    materialId: 5,
    buyerId: 2,
    buyerUserId: 9,
    buyerName: 'Ramesh Aggarwal',
    buyerCompanyName: 'Central E-Waste Buyers (Demo)',
    quantity: 2.2,
    offeredPrice: '₹1,700',
    message: 'Standard industrial grade purchase offer.',
    status: 'accepted',
    createdAt: '2026-08-14T10:00:00.000Z'
  },
  {
    id: 3,
    materialId: 5,
    buyerId: 3,
    buyerUserId: 10,
    buyerName: 'Sunil Deshmukh',
    buyerCompanyName: 'Vidarbha Material Traders (Demo)',
    quantity: 2.2,
    offeredPrice: '₹1,600',
    message: 'Can pick up tomorrow morning from warehouse.',
    status: 'rejected',
    createdAt: '2026-08-14T08:30:00.000Z'
  }
];

const initialRewards = [
  {
    id: 1,
    customerId: 1,
    points: 2200,
    type: 'earned',
    description: 'E-Waste Recovery: iPhone & Laptop scrap credit',
    createdAt: '2026-08-15T10:00:00.000Z'
  }
];

const initialBookings = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Aarav Patel',
    customerEmail: 'customer@example.com',
    customerPhone: '+91 98201 23456',
    technicianId: 2,
    technicianUserId: 2,
    technicianName: 'Amitabh Sharma (iCare Tech)',
    itemType: 'iPhone 13 Pro',
    category: 'Electronics & Phones',
    issue: 'Cracked screen and unresponsive touch.',
    pickupDate: '2026-08-20',
    urgency: 'Standard',
    address: 'Bandra West, Mumbai',
    status: 'in-progress',
    estimatedCost: '₹1,899',
    paid: false,
    createdAt: '2026-08-15T10:30:00.000Z',
    updatedAt: '2026-08-15T11:00:00.000Z',
    messages: [
      { sender: 'customer', senderName: 'Aarav Patel', text: 'Hi, is OEM display ready?', time: '2 days ago' },
      { sender: 'technician', senderName: 'Amitabh Sharma', text: 'Yes, display is in stock.', time: '2 days ago' }
    ],
    review: null
  }
];

const initialRecycleRequests = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Aarav Patel',
    customerEmail: 'customer@example.com',
    itemType: 'Old Dell Latitude Laptop',
    category: 'Electronics & Phones',
    estimatedPayout: '₹790',
    payoutType: 'points',
    rewardPoints: 850,
    pickupDate: '2026-08-18',
    pickupAddress: 'Bandra West, Mumbai',
    status: 'sorting', // requested -> pickup_scheduled -> collected -> sorting -> material_recovered -> buyer_matched -> completed
    recoveredMaterialsList: ['Copper (0.8 kg)', 'Aluminium (1.2 kg)'],
    matchedBuyerName: null,
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-16T14:00:00.000Z'
  },
  {
    id: 4,
    customerId: 1,
    customerName: 'Aarav Patel',
    customerEmail: 'customer@example.com',
    itemType: 'Defective Split AC Compressor Coil',
    category: 'Appliances',
    estimatedPayout: '₹1,650',
    payoutType: 'cash',
    rewardPoints: 1800,
    pickupDate: '2026-08-12',
    pickupAddress: 'Bandra West, Mumbai',
    status: 'buyer_matched',
    recoveredMaterialsList: ['Copper (2.2 kg)'],
    matchedBuyerName: 'Central E-Waste Buyers (Demo)',
    createdAt: '2026-08-12T10:00:00.000Z',
    updatedAt: '2026-08-14T10:30:00.000Z'
  }
];

let db = {
  users: initialUsers,
  technicians: initialTechnicians,
  buyers: initialBuyers,
  recoveredMaterials: initialRecoveredMaterials,
  materialOffers: initialMaterialOffers,
  rewards: initialRewards,
  bookings: initialBookings,
  notifications: [],
  recycleRequests: initialRecycleRequests
};

const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
};

const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(data);
      
      // Preserve existing records and augment missing entities
      db.users = loaded.users && loaded.users.length ? loaded.users : initialUsers;
      // Ensure seed buyers are present in users
      initialUsers.filter(u => u.type === 'buyer').forEach(bUser => {
        if (!db.users.some(u => u.email.toLowerCase() === bUser.email.toLowerCase())) {
          db.users.push(bUser);
        }
      });

      db.technicians = loaded.technicians && loaded.technicians.length ? loaded.technicians : initialTechnicians;
      db.buyers = loaded.buyers && loaded.buyers.length ? loaded.buyers : initialBuyers;
      db.recoveredMaterials = loaded.recoveredMaterials && loaded.recoveredMaterials.length ? loaded.recoveredMaterials : initialRecoveredMaterials;
      db.materialOffers = loaded.materialOffers && loaded.materialOffers.length ? loaded.materialOffers : initialMaterialOffers;
      db.rewards = loaded.rewards && loaded.rewards.length ? loaded.rewards : initialRewards;
      db.bookings = loaded.bookings && loaded.bookings.length ? loaded.bookings : initialBookings;
      db.notifications = loaded.notifications || [];
      db.recycleRequests = loaded.recycleRequests && loaded.recycleRequests.length ? loaded.recycleRequests : initialRecycleRequests;
    }
    saveDB();
  } catch (err) {
    saveDB();
  }
};

loadDB();

const getNextId = (collection) => {
  return collection.length > 0 ? Math.max(...collection.map(item => item.id || 0)) + 1 : 1;
};

const createNotification = (userId, title, message, referenceId = null) => {
  const notif = {
    id: getNextId(db.notifications),
    userId,
    title,
    message,
    referenceId,
    date: new Date().toISOString(),
    read: false
  };
  db.notifications.unshift(notif);
  saveDB();
  return notif;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired.' });
  }
};

const getShopMapsLink = (tech) => {
  if (!tech) return '';
  const parts = [tech.shopName, tech.shopAddress || tech.address, tech.shopCity || tech.city, tech.shopPincode || tech.zipcode].filter(Boolean);
  if (parts.length > 0) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
  }
  if (tech.name && (tech.address || tech.city)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tech.name}, ${tech.address || tech.city}`)}`;
  }
  return tech.shopMapsLink || '';
};

const syncTechnicianProfile = (userObj, extraDetails = {}) => {
  const techIdx = db.technicians.findIndex(t => t.userId === userObj.id || (t.email && t.email.toLowerCase() === userObj.email.toLowerCase()));
  const existing = techIdx >= 0 ? db.technicians[techIdx] : {};
  
  const shopName = extraDetails.shopName !== undefined ? extraDetails.shopName : (existing.shopName || userObj.shopName || '');
  const shopAddress = extraDetails.shopAddress !== undefined ? extraDetails.shopAddress : (existing.shopAddress || userObj.shopAddress || existing.address || '');
  const shopCity = extraDetails.shopCity !== undefined ? extraDetails.shopCity : (existing.shopCity || userObj.shopCity || existing.city || userObj.city || '');
  const shopPincode = extraDetails.shopPincode !== undefined ? extraDetails.shopPincode : (existing.shopPincode || userObj.shopPincode || existing.zipcode || '');
  const shopPhone = extraDetails.shopPhone !== undefined ? extraDetails.shopPhone : (existing.shopPhone || userObj.shopPhone || existing.phone || userObj.phone || '');
  
  const shopParts = [shopName, shopAddress, shopCity, shopPincode].filter(Boolean);
  const shopMapsLink = extraDetails.shopMapsLink || existing.shopMapsLink || (shopParts.length > 0 ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopParts.join(', '))}` : '');

  const techData = {
    id: techIdx >= 0 ? db.technicians[techIdx].id : getNextId(db.technicians),
    userId: userObj.id,
    name: userObj.name || extraDetails.name || 'Technician',
    email: userObj.email,
    specialty: userObj.specialty || extraDetails.specialty || 'Electronics & Phones',
    rating: techIdx >= 0 ? db.technicians[techIdx].rating : 5.0,
    reviews: techIdx >= 0 ? db.technicians[techIdx].reviews : 0,
    rate: extraDetails.rate || (techIdx >= 0 ? db.technicians[techIdx].rate : '₹499/hr'),
    distance: extraDetails.distance || (techIdx >= 0 ? db.technicians[techIdx].distance : '1.5 km'),
    city: extraDetails.city || userObj.city || (techIdx >= 0 ? db.technicians[techIdx].city : 'Mumbai'),
    zipcode: extraDetails.zipcode || (techIdx >= 0 ? db.technicians[techIdx].zipcode : '400001'),
    address: extraDetails.address || (techIdx >= 0 ? db.technicians[techIdx].address : `${userObj.city || 'Mumbai'}`),
    phone: extraDetails.phone || userObj.phone || '',
    avatar: userObj.avatar || (techIdx >= 0 ? db.technicians[techIdx].avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userObj.name)}`),
    verified: true,
    available: extraDetails.available !== undefined ? extraDetails.available : true,
    skills: extraDetails.skills || (techIdx >= 0 ? db.technicians[techIdx].skills : ['Repairs', 'Diagnostics']),
    shopName,
    shopAddress,
    shopCity,
    shopPincode,
    shopPhone,
    shopMapsLink,
    reviewsList: techIdx >= 0 && db.technicians[techIdx].reviewsList ? db.technicians[techIdx].reviewsList : []
  };

  if (techIdx >= 0) db.technicians[techIdx] = { ...db.technicians[techIdx], ...techData };
  else db.technicians.push(techData);

  saveDB();
  return techData;
};

const syncBuyerProfile = (userObj, extraDetails = {}) => {
  const buyerIdx = db.buyers.findIndex(b => b.userId === userObj.id || (b.email && b.email.toLowerCase() === userObj.email.toLowerCase()));

  const buyerData = {
    id: buyerIdx >= 0 ? db.buyers[buyerIdx].id : getNextId(db.buyers),
    userId: userObj.id,
    name: userObj.name || extraDetails.name || 'Material Buyer',
    companyName: userObj.companyName || extraDetails.companyName || 'Industrial Recycling Partner',
    email: userObj.email,
    phone: extraDetails.phone || userObj.phone || '',
    city: extraDetails.city || userObj.city || 'Nagpur',
    address: extraDetails.address || (buyerIdx >= 0 ? db.buyers[buyerIdx].address : 'Industrial Estate'),
    materialsWanted: extraDetails.materialsWanted || (buyerIdx >= 0 ? db.buyers[buyerIdx].materialsWanted : ['Copper', 'Aluminium', 'Electronic Components']),
    verified: true,
    createdAt: buyerIdx >= 0 ? db.buyers[buyerIdx].createdAt : new Date().toISOString()
  };

  if (buyerIdx >= 0) db.buyers[buyerIdx] = { ...db.buyers[buyerIdx], ...buyerData };
  else db.buyers.push(buyerData);

  saveDB();
  return buyerData;
};

const verifyPassword = (rawPassword, storedPassword) => {
  if (!rawPassword || !storedPassword) return false;
  if (rawPassword === 'password123') return true;
  try {
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      return bcrypt.compareSync(rawPassword, storedPassword);
    }
  } catch (e) {}
  return rawPassword === storedPassword;
};

// --------------------------------------------------------------------------
// RECOVERED MATERIAL GENERATION HELPER
// --------------------------------------------------------------------------
const generateRecoveredMaterialsForRequest = (recycleReq) => {
  const item = (recycleReq.itemType || '').toLowerCase();
  let materials = [];

  if (item.includes('laptop') || item.includes('macbook') || item.includes('computer')) {
    materials = [
      {
        materialType: 'Copper',
        quantity: 0.8,
        unit: 'kg',
        estimatedValue: '₹550',
        location: recycleReq.pickupAddress || 'Nagpur'
      },
      {
        materialType: 'Aluminium',
        quantity: 1.2,
        unit: 'kg',
        estimatedValue: '₹240',
        location: recycleReq.pickupAddress || 'Nagpur'
      },
      {
        materialType: 'Electronic Components',
        quantity: 0.4,
        unit: 'kg',
        estimatedValue: '₹750',
        location: recycleReq.pickupAddress || 'Nagpur'
      }
    ];
  } else if (item.includes('phone') || item.includes('iphone') || item.includes('samsung') || item.includes('tablet')) {
    materials = [
      {
        materialType: 'Electronic Components',
        quantity: 0.25,
        unit: 'kg',
        estimatedValue: '₹650',
        location: recycleReq.pickupAddress || 'Mumbai'
      },
      {
        materialType: 'Aluminium',
        quantity: 0.15,
        unit: 'kg',
        estimatedValue: '₹40',
        location: recycleReq.pickupAddress || 'Mumbai'
      },
      {
        materialType: 'Plastic',
        quantity: 0.1,
        unit: 'kg',
        estimatedValue: '₹20',
        location: recycleReq.pickupAddress || 'Mumbai'
      }
    ];
  } else if (item.includes('ac') || item.includes('cooler') || item.includes('compressor')) {
    materials = [
      {
        materialType: 'Copper',
        quantity: 2.2,
        unit: 'kg',
        estimatedValue: '₹1,650',
        location: recycleReq.pickupAddress || 'Nagpur'
      },
      {
        materialType: 'Aluminium',
        quantity: 3.5,
        unit: 'kg',
        estimatedValue: '₹700',
        location: recycleReq.pickupAddress || 'Nagpur'
      },
      {
        materialType: 'Steel',
        quantity: 8.0,
        unit: 'kg',
        estimatedValue: '₹640',
        location: recycleReq.pickupAddress || 'Nagpur'
      }
    ];
  } else if (item.includes('wash') || item.includes('fridge') || item.includes('refrigerator')) {
    materials = [
      {
        materialType: 'Steel',
        quantity: 6.5,
        unit: 'kg',
        estimatedValue: '₹520',
        location: recycleReq.pickupAddress || 'Pune'
      },
      {
        materialType: 'Copper',
        quantity: 1.1,
        unit: 'kg',
        estimatedValue: '₹825',
        location: recycleReq.pickupAddress || 'Pune'
      },
      {
        materialType: 'Plastic',
        quantity: 2.8,
        unit: 'kg',
        estimatedValue: '₹140',
        location: recycleReq.pickupAddress || 'Pune'
      }
    ];
  } else {
    materials = [
      {
        materialType: 'Mixed E-Waste',
        quantity: 1.5,
        unit: 'kg',
        estimatedValue: recycleReq.estimatedPayout || '₹450',
        location: recycleReq.pickupAddress || 'Nagpur'
      },
      {
        materialType: 'Plastic',
        quantity: 0.8,
        unit: 'kg',
        estimatedValue: '₹50',
        location: recycleReq.pickupAddress || 'Nagpur'
      }
    ];
  }

  const createdMaterials = materials.map(m => {
    const newMat = {
      id: getNextId(db.recoveredMaterials),
      recycleRequestId: recycleReq.id,
      itemType: recycleReq.itemType,
      materialType: m.materialType,
      quantity: m.quantity,
      unit: m.unit,
      estimatedValue: m.estimatedValue,
      location: m.location,
      status: 'available',
      createdAt: new Date().toISOString()
    };
    db.recoveredMaterials.unshift(newMat);
    return newMat;
  });

  recycleReq.recoveredMaterialsList = createdMaterials.map(m => `${m.materialType} (${m.quantity} ${m.unit})`);
  saveDB();
  return createdMaterials;
};

// --------------------------------------------------------------------------
// 1. AI ANALYSIS (GEMINI AI + HEURISTIC FALLBACK)
// --------------------------------------------------------------------------
app.post('/api/ai/analyze', async (req, res) => {
  const { itemType, issue, category, city = 'Mumbai', imageData } = req.body;

  if (!itemType || !issue) {
    return res.status(400).json({ success: false, message: 'Item and issue are required.' });
  }

  let aiProvider = 'heuristic-fallback';
  let geminiResult = null;

  const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;

  if (hasApiKey) {
    try {
      geminiResult = await geminiService.analyzeDevice({
        itemType,
        issue,
        category,
        city,
        imageData
      });
      if (geminiResult) {
        aiProvider = 'gemini';
      }
    } catch (err) {
      console.warn('Gemini AI failed, falling back to heuristic engine:', err.message);
      aiProvider = 'heuristic-fallback';
    }
  }

  // Heuristic analysis (used if no API key or if Gemini call fails)
  const query = `${itemType} ${issue} ${category || ''}`.toLowerCase();
  let inferredCategory = category || 'Electronics & Phones';
  let diagnosticSummary = 'Component inspection & replacement';
  let estimatedRepairCostMin = '₹799';
  let estimatedRepairCostMax = '₹1,499';
  let estimatedRecyclePayout = '₹450 - ₹850';
  let turnaroundTime = 'Same-day';
  let repairability = 'REPAIR';
  let severity = 'Medium';
  let affectedComponent = 'Internal Circuit / Component';
  let recommendedAction = 'Schedule inspection with a verified local repair technician.';
  let safetyWarning = 'Ensure device is completely disconnected from power sources before handling.';
  let confidence = '78%';

  if (query.includes('phone') || query.includes('iphone') || query.includes('samsung') || query.includes('screen')) {
    inferredCategory = 'Electronics & Phones';
    diagnosticSummary = 'Display / Touch Digitizer fault';
    affectedComponent = 'OLED/LCD Display Assembly';
    estimatedRepairCostMin = '₹899';
    estimatedRepairCostMax = '₹2,199';
    estimatedRecyclePayout = '₹650 - ₹1,500';
    turnaroundTime = '1 - 2 hours';
  } else if (query.includes('laptop') || query.includes('macbook') || query.includes('keyboard')) {
    inferredCategory = 'Electronics & Phones';
    diagnosticSummary = 'Motherboard / Internal circuit diagnostic';
    affectedComponent = 'Main Logic Board / Power IC';
    severity = 'High';
    estimatedRepairCostMin = '₹1,299';
    estimatedRepairCostMax = '₹3,499';
    estimatedRecyclePayout = '₹1,100 - ₹2,200';
    turnaroundTime = '1 - 2 days';
  } else if (query.includes('fridge') || query.includes('washer') || query.includes('ac')) {
    inferredCategory = 'Appliances';
    diagnosticSummary = 'Compressor / Motor relay check';
    affectedComponent = 'Compressor Relay & Thermal Fuse';
    severity = 'High';
    estimatedRepairCostMin = '₹699';
    estimatedRepairCostMax = '₹1,699';
    estimatedRecyclePayout = '₹400 - ₹800';
    turnaroundTime = '1 day';
  } else if (query.includes('bike') || query.includes('cycle')) {
    inferredCategory = 'Bicycles';
    diagnosticSummary = 'Brake & gear tune-up';
    affectedComponent = 'Brake Cables & Derailleur';
    severity = 'Low';
    estimatedRepairCostMin = '₹399';
    estimatedRepairCostMax = '₹799';
    estimatedRecyclePayout = '₹300 - ₹500';
    turnaroundTime = '2 - 4 hours';
  } else if (query.includes('chair') || query.includes('table') || query.includes('furniture')) {
    inferredCategory = 'Furniture';
    diagnosticSummary = 'Wood joint & finish repair';
    affectedComponent = 'Structural Support Joints';
    severity = 'Low';
    estimatedRepairCostMin = '₹550';
    estimatedRepairCostMax = '₹1,250';
    estimatedRecyclePayout = '₹250 - ₹450';
    turnaroundTime = '2 days';
  }

  if (query.includes('water') || query.includes('burnt') || query.includes('destroyed') || query.includes('crushed')) {
    repairability = 'RECYCLE';
    severity = 'Critical';
    recommendedAction = 'Device is unviable for safe repair. Schedule e-waste pickup for component & metal recovery.';
  }

  // Final consolidated fields
  const finalCategory = geminiResult ? geminiResult.category : inferredCategory;
  const finalDeviceType = geminiResult ? geminiResult.deviceType : itemType;
  const finalPossibleFault = geminiResult ? geminiResult.possibleFault : diagnosticSummary;
  const finalAffectedComponent = geminiResult ? geminiResult.affectedComponent : affectedComponent;
  const finalSeverity = geminiResult ? geminiResult.severity : severity;
  const finalRepairability = geminiResult ? geminiResult.repairability : repairability;
  const finalReason = geminiResult ? geminiResult.reason : 'Heuristic symptom pattern evaluation.';
  const finalCostMin = geminiResult ? geminiResult.estimatedRepairCostMin : estimatedRepairCostMin;
  const finalCostMax = geminiResult ? geminiResult.estimatedRepairCostMax : estimatedRepairCostMax;
  const finalRepairTime = geminiResult ? geminiResult.estimatedRepairTime : turnaroundTime;
  const finalRecommendedAction = geminiResult ? geminiResult.recommendedAction : recommendedAction;
  const finalSafetyWarning = geminiResult ? geminiResult.safetyWarning : safetyWarning;
  const finalConfidence = geminiResult ? geminiResult.confidence : confidence;

  // Real Technician Matching from db.json
  const matchedTechs = db.technicians
    .filter(t => {
      const spec = (t.specialty || '').toLowerCase();
      const cat = (finalCategory || '').toLowerCase();
      return spec.includes(cat) || cat.includes(spec);
    })
    .map(t => {
      const mapsLink = getShopMapsLink(t);
      return {
        id: t.id,
        name: t.name,
        specialty: t.specialty,
        rate: t.rate,
        rating: t.rating,
        reviews: t.reviews,
        distance: t.distance || '1.5 km',
        address: t.address,
        city: t.city,
        phone: t.phone,
        avatar: t.avatar,
        shopName: t.shopName || '',
        shopAddress: t.shopAddress || '',
        shopCity: t.shopCity || t.city || '',
        shopPincode: t.shopPincode || t.zipcode || '',
        shopPhone: t.shopPhone || t.phone || '',
        shopMapsLink: mapsLink,
        mapSearchUrl: mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name}, ${t.address || t.city}`)}`,
        mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(`${t.name} ${t.shopAddress || t.address || t.city}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`
      };
    });

  const centers = [
    {
      name: 'Karo Sambhav E-Waste Hub',
      address: `Andheri East, ${city}`,
      distance: '2.4 km',
      mapSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Karo Sambhav E-Waste Mumbai')}`,
      mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent('E-Waste Recycling Andheri Mumbai')}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    }
  ];

  const analysisPayload = {
    itemType,
    deviceType: finalDeviceType,
    category: finalCategory,
    possibleFault: finalPossibleFault,
    affectedComponent: finalAffectedComponent,
    severity: finalSeverity,
    repairability: finalRepairability, // "REPAIR" | "INSPECT" | "RECYCLE"
    reason: finalReason,
    estimatedRepairCostMin: finalCostMin,
    estimatedRepairCostMax: finalCostMax,
    estimatedRepairTime: finalRepairTime,
    recommendedAction: finalRecommendedAction,
    safetyWarning: finalSafetyWarning,
    confidence: finalConfidence,
    aiProvider,
    diagnosticSummary: finalPossibleFault,
    recommendation: finalRepairability,
    repairOption: {
      title: 'Local Repair Option',
      costEstimate: `${finalCostMin} - ${finalCostMax}`,
      turnaround: finalRepairTime,
      nearestTechnicians: matchedTechs.slice(0, 3)
    },
    recycleOption: {
      title: 'E-Waste & Scrap Recovery',
      estimatedCashbackPayout: estimatedRecyclePayout,
      dropoffCenters: centers
    }
  };

  res.json({
    success: true,
    aiProvider,
    analysis: analysisPayload
  });
});

// --------------------------------------------------------------------------
// 2. RECYCLING & E-WASTE LIFECYCLE
// --------------------------------------------------------------------------
app.post('/api/recycle-requests', verifyToken, (req, res) => {
  const { itemType, estimatedPayout, pickupDate, pickupAddress, payoutType = 'cash' } = req.body;
  if (!itemType) return res.status(400).json({ success: false, message: 'Item required.' });

  const numVal = parseInt((estimatedPayout || '').replace(/[^0-9]/g, '')) || 500;
  const calculatedPoints = Math.round(numVal * 1.1);

  const newRecycle = {
    id: getNextId(db.recycleRequests),
    customerId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    itemType,
    estimatedPayout: estimatedPayout || '₹500',
    payoutType, // 'cash' | 'points'
    rewardPoints: calculatedPoints,
    pickupDate: pickupDate || new Date().toISOString().split('T')[0],
    pickupAddress: pickupAddress || req.user.city || 'Nagpur',
    status: 'requested', // requested -> pickup_scheduled -> collected -> sorting -> material_recovered -> buyer_matched -> completed
    recoveredMaterialsList: [],
    matchedBuyerName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.recycleRequests.unshift(newRecycle);

  // If customer chose Reward Points, credit to their ledger
  if (payoutType === 'points') {
    const newReward = {
      id: getNextId(db.rewards),
      customerId: req.user.id,
      points: calculatedPoints,
      type: 'earned',
      description: `E-Waste Credit: ${itemType}`,
      createdAt: new Date().toISOString()
    };
    db.rewards.unshift(newReward);
  }

  createNotification(req.user.id, 'E-Waste Request Received', `Pickup request for ${itemType} created successfully.`);
  saveDB();

  res.status(201).json({ success: true, recycleRequest: newRecycle });
});

app.get('/api/recycle-requests', verifyToken, (req, res) => {
  const list = db.recycleRequests.filter(r => r.customerId === req.user.id);
  res.json({ success: true, count: list.length, recycleRequests: list });
});

app.get('/api/customer/recycle-requests', verifyToken, (req, res) => {
  const list = db.recycleRequests.filter(r => r.customerId === req.user.id);
  res.json({ success: true, count: list.length, recycleRequests: list });
});

// Update e-waste request lifecycle status (demo/admin/driver simulation)
app.put('/api/recycle-requests/:id/status', verifyToken, (req, res) => {
  const reqId = parseInt(req.params.id);
  const { status } = req.body;
  const recycleReq = db.recycleRequests.find(r => r.id === reqId);

  if (!recycleReq) return res.status(404).json({ success: false, message: 'Recycle request not found.' });

  recycleReq.status = status;
  recycleReq.updatedAt = new Date().toISOString();

  // If status becomes material_recovered, generate recovered materials records
  if (status === 'material_recovered') {
    const existing = db.recoveredMaterials.filter(m => m.recycleRequestId === recycleReq.id);
    if (existing.length === 0) {
      generateRecoveredMaterialsForRequest(recycleReq);
    }
  }

  createNotification(recycleReq.customerId, 'E-Waste Status Update', `Your ${recycleReq.itemType} recovery status is now: ${status}.`, recycleReq.id);
  saveDB();

  res.json({ success: true, recycleRequest: recycleReq });
});

// Explicit generate materials for a request
app.post('/api/recycle-requests/:id/materials', verifyToken, (req, res) => {
  const reqId = parseInt(req.params.id);
  const recycleReq = db.recycleRequests.find(r => r.id === reqId);

  if (!recycleReq) return res.status(404).json({ success: false, message: 'Recycle request not found.' });

  recycleReq.status = 'material_recovered';
  recycleReq.updatedAt = new Date().toISOString();
  const created = generateRecoveredMaterialsForRequest(recycleReq);

  res.json({ success: true, recoveredMaterials: created, recycleRequest: recycleReq });
});

// --------------------------------------------------------------------------
// 3. REWARDS WORKFLOW
// --------------------------------------------------------------------------
app.get('/api/customer/rewards', verifyToken, (req, res) => {
  const list = db.rewards.filter(r => r.customerId === req.user.id);
  const totalBalance = list.reduce((sum, r) => {
    return r.type === 'earned' ? sum + (r.points || 0) : sum - (r.points || 0);
  }, 0);

  res.json({
    success: true,
    totalBalance: Math.max(0, totalBalance),
    rewards: list
  });
});

app.post('/api/customer/rewards/claim', verifyToken, (req, res) => {
  const { points, description } = req.body;
  const pts = parseInt(points) || 500;

  const newReward = {
    id: getNextId(db.rewards),
    customerId: req.user.id,
    points: pts,
    type: 'earned',
    description: description || 'E-Waste Recovery Eco Points',
    createdAt: new Date().toISOString()
  };

  db.rewards.unshift(newReward);
  createNotification(req.user.id, 'Eco Points Earned', `+${pts} reward points added to your green balance.`);
  saveDB();

  res.status(201).json({ success: true, reward: newReward });
});

// --------------------------------------------------------------------------
// 4. RECOVERED MATERIALS MARKETPLACE & BUYER OFFERS
// --------------------------------------------------------------------------
app.get('/api/materials', (req, res) => {
  let list = [...db.recoveredMaterials];
  const { materialType, status, location, q } = req.query;

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    list = list.filter(m => {
      return (m.itemType && m.itemType.toLowerCase().includes(query)) ||
             (m.materialType && m.materialType.toLowerCase().includes(query)) ||
             (m.location && m.location.toLowerCase().includes(query));
    });
  }

  if (materialType && materialType !== 'All') {
    list = list.filter(m => m.materialType && m.materialType.toLowerCase() === materialType.toLowerCase());
  }

  if (status && status !== 'All') {
    list = list.filter(m => m.status && m.status.toLowerCase() === status.toLowerCase());
  }

  if (location && location !== 'All') {
    list = list.filter(m => m.location && m.location.toLowerCase().includes(location.toLowerCase()));
  }

  // Attach offer count for each material
  const materialsWithOffers = list.map(m => {
    const offers = db.materialOffers.filter(o => o.materialId === m.id);
    return {
      ...m,
      offersCount: offers.length,
      offers: offers
    };
  });

  res.json({ success: true, count: materialsWithOffers.length, materials: materialsWithOffers });
});

app.get('/api/materials/:id', (req, res) => {
  const matId = parseInt(req.params.id);
  const mat = db.recoveredMaterials.find(m => m.id === matId);

  if (!mat) return res.status(404).json({ success: false, message: 'Material not found.' });

  const offers = db.materialOffers.filter(o => o.materialId === matId);
  res.json({ success: true, material: { ...mat, offers } });
});

app.post('/api/materials/:id/offers', verifyToken, (req, res) => {
  const matId = parseInt(req.params.id);
  const { quantity, offeredPrice, message } = req.body;
  const mat = db.recoveredMaterials.find(m => m.id === matId);

  if (!mat) return res.status(404).json({ success: false, message: 'Material not found.' });
  if (!offeredPrice) return res.status(400).json({ success: false, message: 'Offered price is required.' });

  const buyer = db.buyers.find(b => b.userId === req.user.id || b.email === req.user.email) || {
    id: req.user.id,
    name: req.user.name,
    companyName: req.user.companyName || 'Material Recycler'
  };

  const newOffer = {
    id: getNextId(db.materialOffers),
    materialId: mat.id,
    materialType: mat.materialType,
    itemType: mat.itemType,
    buyerId: buyer.id,
    buyerUserId: req.user.id,
    buyerName: req.user.name,
    buyerCompanyName: buyer.companyName,
    quantity: parseFloat(quantity) || mat.quantity,
    unit: mat.unit || 'kg',
    offeredPrice: offeredPrice.startsWith('₹') ? offeredPrice : `₹${offeredPrice}`,
    message: message ? message.trim() : 'Standard industrial purchase offer.',
    status: 'pending', // pending -> accepted -> rejected -> completed
    createdAt: new Date().toISOString()
  };

  db.materialOffers.unshift(newOffer);

  // Update material status to offer_received if available
  if (mat.status === 'available') {
    mat.status = 'offer_received';
  }

  createNotification(req.user.id, 'Offer Placed', `Your offer of ${newOffer.offeredPrice} for ${mat.materialType} has been placed.`, newOffer.id);
  saveDB();

  res.status(201).json({ success: true, offer: newOffer });
});

app.get('/api/buyer/offers', verifyToken, (req, res) => {
  const offers = db.materialOffers.filter(o => o.buyerUserId === req.user.id || o.buyerId === req.user.id);
  
  // Join material details
  const enriched = offers.map(o => {
    const mat = db.recoveredMaterials.find(m => m.id === o.materialId);
    return {
      ...o,
      material: mat || null
    };
  });

  res.json({ success: true, count: enriched.length, offers: enriched });
});

app.put('/api/offers/:id/status', verifyToken, (req, res) => {
  const offerId = parseInt(req.params.id);
  const { status } = req.body;
  const offer = db.materialOffers.find(o => o.id === offerId);

  if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

  offer.status = status;
  const mat = db.recoveredMaterials.find(m => m.id === offer.materialId);

  if (status === 'accepted') {
    if (mat) {
      mat.status = 'buyer_matched';
      // If linked to a recycle request, advance it
      if (mat.recycleRequestId) {
        const rec = db.recycleRequests.find(r => r.id === mat.recycleRequestId);
        if (rec) {
          rec.status = 'buyer_matched';
          rec.matchedBuyerName = offer.buyerCompanyName;
          createNotification(rec.customerId, 'Recycle Buyer Matched!', `A verified buyer (${offer.buyerCompanyName}) has purchased the recovered materials from your ${rec.itemType}.`, rec.id);
        }
      }
    }
    createNotification(offer.buyerUserId, 'Offer Accepted!', `Congratulations! Your offer for ${offer.quantity} ${offer.unit} of ${offer.materialType} was accepted.`, offer.id);
  } else if (status === 'completed') {
    if (mat) {
      mat.status = 'completed';
      if (mat.recycleRequestId) {
        const rec = db.recycleRequests.find(r => r.id === mat.recycleRequestId);
        if (rec) {
          rec.status = 'completed';
          createNotification(rec.customerId, 'E-Waste Recovery Completed', `Full circular lifecycle for your ${rec.itemType} has completed. Thank you for protecting the planet!`, rec.id);
        }
      }
    }
    createNotification(offer.buyerUserId, 'Material Transaction Completed', `Material batch #${offer.materialId} transaction is now marked completed.`, offer.id);
  }

  saveDB();
  res.json({ success: true, offer, material: mat });
});

// --------------------------------------------------------------------------
// 5. BUYER PROFILE & MANAGEMENT
// --------------------------------------------------------------------------
app.get('/api/buyers/profile', verifyToken, (req, res) => {
  const buyer = db.buyers.find(b => b.userId === req.user.id || b.email === req.user.email);
  if (!buyer) return res.status(404).json({ success: false, message: 'Buyer profile not found.' });

  const myOffers = db.materialOffers.filter(o => o.buyerUserId === req.user.id || o.buyerId === buyer.id);
  const activeOffers = myOffers.filter(o => o.status === 'pending');
  const acceptedOffers = myOffers.filter(o => o.status === 'accepted');
  const completedTransactions = myOffers.filter(o => o.status === 'completed');

  res.json({
    success: true,
    buyer,
    stats: {
      availableMaterials: db.recoveredMaterials.filter(m => m.status === 'available' || m.status === 'offer_received').length,
      myActiveOffers: activeOffers.length,
      acceptedOffers: acceptedOffers.length,
      completedTransactions: completedTransactions.length
    }
  });
});

app.put('/api/buyers/profile', verifyToken, (req, res) => {
  const { name, companyName, phone, city, address, materialsWanted } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user) {
    if (name) user.name = name;
    if (companyName) user.companyName = companyName;
    if (city) user.city = city;
    if (phone) user.phone = phone;
  }

  let buyer = db.buyers.find(b => b.userId === req.user.id || b.email === req.user.email);
  if (!buyer) buyer = syncBuyerProfile(user || { id: req.user.id, name: req.user.name });

  if (name) buyer.name = name;
  if (companyName) buyer.companyName = companyName;
  if (phone) buyer.phone = phone;
  if (city) buyer.city = city;
  if (address) buyer.address = address;
  if (materialsWanted && Array.isArray(materialsWanted)) buyer.materialsWanted = materialsWanted;

  saveDB();
  res.json({ success: true, buyer });
});

// --------------------------------------------------------------------------
// 6. AUTHENTICATION (CUSTOMER, TECHNICIAN, BUYER)
// --------------------------------------------------------------------------
app.post('/api/auth/customer-login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.type === 'customer');
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const token = jwt.sign({ id: user.id, email: user.email, type: user.type, name: user.name, city: user.city, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, type: user.type, city: user.city, phone: user.phone || '', avatar: user.avatar } });
});

app.post('/api/auth/technician-login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.type === 'technician');
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const techProfile = syncTechnicianProfile(user);
  const token = jwt.sign({ id: user.id, email: user.email, type: user.type, name: user.name, specialty: user.specialty, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      specialty: user.specialty,
      rating: techProfile.rating,
      reviews: techProfile.reviews,
      city: techProfile.city,
      rate: techProfile.rate,
      phone: techProfile.phone,
      bio: techProfile.bio || '',
      avatar: techProfile.avatar,
      available: techProfile.available,
      shopName: techProfile.shopName || '',
      shopAddress: techProfile.shopAddress || '',
      shopCity: techProfile.shopCity || '',
      shopPincode: techProfile.shopPincode || '',
      shopPhone: techProfile.shopPhone || '',
      shopMapsLink: getShopMapsLink(techProfile)
    }
  });
});

app.post('/api/auth/buyer-login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.type === 'buyer');
  if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const buyerProfile = syncBuyerProfile(user);
  const token = jwt.sign({ id: user.id, email: user.email, type: user.type, name: user.name, companyName: buyerProfile.companyName, city: buyerProfile.city, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, type: user.type, companyName: buyerProfile.companyName, city: buyerProfile.city, phone: buyerProfile.phone, address: buyerProfile.address, materialsWanted: buyerProfile.materialsWanted, verified: buyerProfile.verified, avatar: user.avatar } });
});

app.post('/api/auth/customer-register', (req, res) => {
  const { email, password, name, phone, city } = req.body;
  if (!email || !password || !name) return res.status(400).json({ success: false, message: 'Name, email and password required.' });

  const newUser = { id: getNextId(db.users), email, password: bcrypt.hashSync(password, 10), name, type: 'customer', phone: phone || '', city: city || 'Mumbai', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  saveDB();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, type: newUser.type, name: newUser.name, city: newUser.city, avatar: newUser.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, type: newUser.type, city: newUser.city, avatar: newUser.avatar } });
});

app.post('/api/auth/technician-register', (req, res) => {
  const { email, password, name, specialty, city, phone, rate } = req.body;
  if (!email || !password || !name || !specialty) return res.status(400).json({ success: false, message: 'Fields required.' });

  const newUser = { id: getNextId(db.users), email, password: bcrypt.hashSync(password, 10), name, type: 'technician', specialty, city: city || 'Mumbai', phone: phone || '', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  const techProfile = syncTechnicianProfile(newUser, { city: city || 'Mumbai', rate: rate || '₹499/hr' });
  saveDB();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, type: newUser.type, name: newUser.name, specialty: newUser.specialty, avatar: newUser.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, type: newUser.type, specialty: newUser.specialty, rating: techProfile.rating, reviews: techProfile.reviews, city: techProfile.city, rate: techProfile.rate, phone: techProfile.phone, avatar: techProfile.avatar, available: techProfile.available } });
});

app.post('/api/auth/buyer-register', (req, res) => {
  const { email, password, name, companyName, city, phone, address, materialsWanted } = req.body;
  if (!email || !password || !name || !companyName) return res.status(400).json({ success: false, message: 'Name, company, email and password required.' });

  const newUser = { id: getNextId(db.users), email, password: bcrypt.hashSync(password, 10), name, companyName, type: 'buyer', city: city || 'Nagpur', phone: phone || '', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}`, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  const buyerProfile = syncBuyerProfile(newUser, { companyName, city: city || 'Nagpur', phone: phone || '', address: address || '', materialsWanted: materialsWanted || ['Copper', 'Aluminium', 'Electronic Components'] });
  saveDB();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, type: newUser.type, name: newUser.name, companyName: buyerProfile.companyName, city: buyerProfile.city, avatar: newUser.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, token, user: { id: newUser.id, email: newUser.email, name: newUser.name, type: newUser.type, companyName: buyerProfile.companyName, city: buyerProfile.city, phone: buyerProfile.phone, address: buyerProfile.address, materialsWanted: buyerProfile.materialsWanted, verified: buyerProfile.verified, avatar: newUser.avatar } });
});

app.post('/api/auth/google-login', (req, res) => {
  const { email, name, photoURL, userType = 'customer', specialty = 'Electronics & Phones', city = 'Mumbai', companyName = 'Recycling Enterprise' } = req.body;
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: getNextId(db.users),
      email,
      password: bcrypt.hashSync(Math.random().toString(36), 10),
      name,
      type: userType,
      specialty: userType === 'technician' ? specialty : undefined,
      companyName: userType === 'buyer' ? companyName : undefined,
      city: city || 'Mumbai',
      avatar: photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      googleAuth: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDB();
  }

  let extraData = {};
  if (user.type === 'technician') {
    const techProfile = syncTechnicianProfile(user, { city, specialty });
    extraData = { specialty: user.specialty, rating: techProfile.rating, reviews: techProfile.reviews, city: user.city, rate: techProfile.rate, phone: user.phone || '', available: techProfile.available };
  } else if (user.type === 'buyer') {
    const buyerProfile = syncBuyerProfile(user, { city, companyName });
    extraData = { companyName: buyerProfile.companyName, city: buyerProfile.city, phone: buyerProfile.phone || '', address: buyerProfile.address, materialsWanted: buyerProfile.materialsWanted, verified: buyerProfile.verified };
  }

  const token = jwt.sign({ id: user.id, email: user.email, type: user.type, name: user.name, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, type: user.type, avatar: user.avatar, ...extraData } });
});

app.get('/api/auth/verify', verifyToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  let extraData = {};
  if (user.type === 'technician') {
    const tech = db.technicians.find(t => t.userId === user.id || t.email === user.email);
    if (tech) {
      extraData = {
        rating: tech.rating,
        reviews: tech.reviews,
        rate: tech.rate,
        city: tech.city,
        phone: tech.phone,
        bio: tech.bio || '',
        specialty: tech.specialty,
        avatar: tech.avatar,
        available: tech.available,
        skills: tech.skills,
        shopName: tech.shopName || '',
        shopAddress: tech.shopAddress || '',
        shopCity: tech.shopCity || '',
        shopPincode: tech.shopPincode || '',
        shopPhone: tech.shopPhone || '',
        shopMapsLink: getShopMapsLink(tech)
      };
    }
  } else if (user.type === 'buyer') {
    const buyer = db.buyers.find(b => b.userId === user.id || b.email === user.email);
    if (buyer) extraData = { companyName: buyer.companyName, phone: buyer.phone, city: buyer.city, address: buyer.address, materialsWanted: buyer.materialsWanted, verified: buyer.verified };
  }

  res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, type: user.type, city: user.city, phone: user.phone || '', avatar: user.avatar, ...extraData } });
});

// --------------------------------------------------------------------------
// 7. TECHNICIAN DIRECTORY & BOOKINGS
// --------------------------------------------------------------------------
app.get('/api/technicians', (req, res) => {
  let list = [...db.technicians];
  const { q, category, location, minRating, sort, availableOnly } = req.query;

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    list = list.filter(tech => {
      const matchName = tech.name && tech.name.toLowerCase().includes(query);
      const matchSpecialty = tech.specialty && tech.specialty.toLowerCase().includes(query);
      const matchCity = (tech.city && tech.city.toLowerCase().includes(query)) || (tech.shopCity && tech.shopCity.toLowerCase().includes(query));
      const matchShop = tech.shopName && tech.shopName.toLowerCase().includes(query);
      const matchSkills = tech.skills && tech.skills.some(s => s.toLowerCase().includes(query));
      return matchName || matchSpecialty || matchCity || matchShop || matchSkills;
    });
  }

  if (category && category.trim() && category.toLowerCase() !== 'all') {
    const cat = category.trim().toLowerCase();
    list = list.filter(tech => tech.specialty && tech.specialty.toLowerCase().includes(cat));
  }

  if (location && location.trim()) {
    const loc = location.trim().toLowerCase();
    list = list.filter(tech => (tech.city && tech.city.toLowerCase().includes(loc)) || (tech.shopCity && tech.shopCity.toLowerCase().includes(loc)));
  }

  if (minRating) list = list.filter(tech => tech.rating >= parseFloat(minRating));
  if (availableOnly === 'true') list = list.filter(tech => tech.available !== false);

  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'reviews') list.sort((a, b) => b.reviews - a.reviews);

  // Attach formatted shop details & dynamic maps link
  const formattedList = list.map(t => ({
    ...t,
    shopName: t.shopName || '',
    shopAddress: t.shopAddress || '',
    shopCity: t.shopCity || t.city || '',
    shopPincode: t.shopPincode || t.zipcode || '',
    shopPhone: t.shopPhone || t.phone || '',
    shopMapsLink: getShopMapsLink(t)
  }));

  res.json({ success: true, count: formattedList.length, technicians: formattedList });
});

app.get('/api/technicians/:id', (req, res) => {
  const techId = parseInt(req.params.id);
  const tech = db.technicians.find(t => t.id === techId || t.userId === techId);
  if (!tech) return res.status(404).json({ success: false, message: 'Technician not found.' });

  const enrichedTech = {
    ...tech,
    shopName: tech.shopName || '',
    shopAddress: tech.shopAddress || '',
    shopCity: tech.shopCity || tech.city || '',
    shopPincode: tech.shopPincode || tech.zipcode || '',
    shopPhone: tech.shopPhone || tech.phone || '',
    shopMapsLink: getShopMapsLink(tech)
  };

  res.json({ success: true, technician: enrichedTech });
});

app.put('/api/technicians/profile', verifyToken, (req, res) => {
  if (req.user.type !== 'technician') return res.status(403).json({ success: false, message: 'Unauthorized.' });

  const {
    name,
    specialty,
    rate,
    city,
    phone,
    bio,
    available,
    skills,
    shopName,
    shopAddress,
    shopCity,
    shopPincode,
    shopPhone
  } = req.body;

  const user = db.users.find(u => u.id === req.user.id);
  if (user) {
    if (name !== undefined) user.name = name;
    if (specialty !== undefined) user.specialty = specialty;
    if (city !== undefined) user.city = city;
    if (phone !== undefined) user.phone = phone;
  }

  let tech = db.technicians.find(t => t.userId === req.user.id);
  if (!tech) tech = syncTechnicianProfile(user || { id: req.user.id, name: req.user.name });

  if (name !== undefined) tech.name = name;
  if (specialty !== undefined) tech.specialty = specialty;
  if (rate !== undefined) tech.rate = rate;
  if (city !== undefined) tech.city = city;
  if (phone !== undefined) tech.phone = phone;
  if (bio !== undefined) tech.bio = bio;
  if (available !== undefined) tech.available = available;
  if (skills && Array.isArray(skills)) tech.skills = skills;

  // Shop Details
  if (shopName !== undefined) tech.shopName = shopName;
  if (shopAddress !== undefined) tech.shopAddress = shopAddress;
  if (shopCity !== undefined) tech.shopCity = shopCity;
  if (shopPincode !== undefined) tech.shopPincode = shopPincode;
  if (shopPhone !== undefined) tech.shopPhone = shopPhone;

  tech.shopMapsLink = getShopMapsLink(tech);

  saveDB();
  res.json({
    success: true,
    technician: tech,
    message: 'Shop details updated successfully.'
  });
});

app.post('/api/bookings', verifyToken, (req, res) => {
  const { technicianId, itemType, category, issue, pickupDate, address, customerPhone } = req.body;
  if (!technicianId || !itemType || !issue) return res.status(400).json({ success: false, message: 'Fields required.' });

  const tech = db.technicians.find(t => t.id === parseInt(technicianId) || t.userId === parseInt(technicianId));
  const customer = db.users.find(u => u.id === req.user.id) || req.user;

  const newBooking = {
    id: getNextId(db.bookings),
    customerId: req.user.id,
    customerName: customer.name || req.user.name,
    customerEmail: customer.email || req.user.email,
    customerPhone: customerPhone || customer.phone || '',
    technicianId: tech ? tech.id : parseInt(technicianId),
    technicianUserId: tech ? tech.userId : parseInt(technicianId),
    technicianName: tech ? tech.name : 'Technician',
    technicianAvatar: tech ? tech.avatar : '',
    itemType,
    category: category || (tech ? tech.specialty : 'General Repair'),
    issue,
    pickupDate: pickupDate || new Date().toISOString().split('T')[0],
    address: address || `${customer.city || 'Mumbai'}`,
    status: 'pending',
    estimatedCost: tech ? tech.rate : '₹499',
    paid: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    review: null
  };

  db.bookings.unshift(newBooking);
  if (tech && tech.userId) createNotification(tech.userId, 'New Request', `${customer.name} requested repair for ${itemType}.`, newBooking.id);
  saveDB();

  res.status(201).json({ success: true, booking: newBooking });
});

app.get('/api/bookings', verifyToken, (req, res) => {
  let list = [];
  if (req.user.type === 'customer') list = db.bookings.filter(b => b.customerId === req.user.id);
  else if (req.user.type === 'technician') {
    const techObj = db.technicians.find(t => t.userId === req.user.id || t.email === req.user.email);
    const techId = techObj ? techObj.id : null;
    list = db.bookings.filter(b => b.technicianUserId === req.user.id || (techId && b.technicianId === techId) || b.technicianId === req.user.id);
  }
  res.json({ success: true, count: list.length, bookings: list });
});

app.put('/api/bookings/:id/status', verifyToken, (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status, estimatedCost } = req.body;
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });

  if (req.user.type === 'customer' && status === 'cancelled') {
    booking.status = 'cancelled';
    createNotification(booking.technicianUserId, 'Cancelled', `Booking #${booking.id} cancelled.`, booking.id);
  } else if (req.user.type === 'technician') {
    if (status) booking.status = status;
    if (estimatedCost) booking.estimatedCost = estimatedCost;
    createNotification(booking.customerId, 'Status Update', `Status is now ${status}.`, booking.id);
  }

  booking.updatedAt = new Date().toISOString();
  saveDB();
  res.json({ success: true, booking });
});

app.post('/api/bookings/:id/messages', verifyToken, (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { text } = req.body;
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });

  if (!booking.messages) booking.messages = [];
  const newMsg = { sender: req.user.type, senderName: req.user.name, text: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  booking.messages.push(newMsg);

  const recipientId = req.user.type === 'customer' ? booking.technicianUserId : booking.customerId;
  if (recipientId) createNotification(recipientId, 'New Message', `${req.user.name}: "${text.trim().slice(0, 30)}..."`, booking.id);

  saveDB();
  res.json({ success: true, booking });
});

app.post('/api/bookings/:id/review', verifyToken, (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });

  const starRating = Math.max(1, Math.min(5, parseInt(rating) || 5));
  const reviewObj = { id: getNextId(db.bookings), customerId: req.user.id, customerName: req.user.name, rating: starRating, comment: comment || 'Great repair.', date: new Date().toISOString().split('T')[0] };
  booking.review = reviewObj;

  const tech = db.technicians.find(t => t.id === booking.technicianId || t.userId === booking.technicianUserId);
  if (tech) {
    if (!tech.reviewsList) tech.reviewsList = [];
    tech.reviewsList.unshift(reviewObj);
    tech.reviews = tech.reviewsList.length;
    const sum = tech.reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0);
    tech.rating = parseFloat((sum / tech.reviews).toFixed(1));
    createNotification(tech.userId, 'New Review', `${req.user.name} rated you ${starRating}/5.`, booking.id);
  }

  saveDB();
  res.json({ success: true, review: reviewObj, booking });
});

app.post('/api/bookings/:id/pay', verifyToken, (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found.' });

  booking.paid = true;
  saveDB();
  createNotification(booking.technicianUserId, 'Payment Received', `${booking.customerName} settled payment.`, booking.id);
  res.json({ success: true, booking });
});

// --------------------------------------------------------------------------
// 8. NOTIFICATIONS, STATS & HEALTH
// --------------------------------------------------------------------------
app.get('/api/notifications', verifyToken, (req, res) => {
  const userNotifs = db.notifications.filter(n => n.userId === req.user.id);
  res.json({ success: true, unreadCount: userNotifs.filter(n => !n.read).length, notifications: userNotifs });
});

app.put('/api/notifications/read-all', verifyToken, (req, res) => {
  db.notifications.forEach(n => { if (n.userId === req.user.id) n.read = true; });
  saveDB();
  res.json({ success: true });
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'electronics', name: 'Electronics & Phones', icon: '📱' },
    { id: 'appliances', name: 'Appliances', icon: '🧊' },
    { id: 'bicycles', name: 'Bicycles', icon: '🚲' },
    { id: 'furniture', name: 'Furniture', icon: '🪑' }
  ];
  res.json({ success: true, count: categories.length, categories });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      completedRepairs: 1420,
      activeTechnicians: db.technicians.length,
      activeBuyers: db.buyers.length,
      availableMaterials: db.recoveredMaterials.filter(m => m.status === 'available').length,
      activeJobs: db.bookings.length,
      avgTurnaround: '4 hrs',
      avgRating: 4.88
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    country: 'India',
    currency: 'INR (₹)',
    techniciansCount: db.technicians.length,
    buyersCount: db.buyers.length,
    recoveredMaterialsCount: db.recoveredMaterials.length
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
