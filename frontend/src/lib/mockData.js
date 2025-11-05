// src/lib/mockData.js

// -----------------------------
// Mock Data
// -----------------------------
export const mockRepairWorks = [
  { id: '1', name: 'Pant Fitting', price: 150 },
  { id: '2', name: 'Blouse Cutting', price: 200 },
  { id: '3', name: 'Shirt Stitching', price: 300 },
  { id: '4', name: 'Dress Alteration', price: 250 },
];

// Alias for imports
export const RepairWork = mockRepairWorks;

export const mockStores = [
  {
    id: '1',
    name: 'Main Store',
    ownerName: 'Rajesh Patel',
    mobile: '+91 9876543210',
    address: '123 Fashion Street, Ahmedabad, Gujarat',
  },
  {
    id: '2',
    name: 'Branch Store',
    ownerName: 'Priya Shah',
    mobile: '+91 9876543211',
    address: '456 Textile Road, Surat, Gujarat',
  },
];

// Alias for imports
export const Store = mockStores;

export const mockWorkOrders = [
  {
    id: '1',
    customerName: 'Amit Kumar',
    repairWorks: [mockRepairWorks[0], mockRepairWorks[1]],
    storeId: '1',
    storeName: 'Main Store',
    date: '2024-10-25T10:30:00Z',
    totalAmount: 350,
  },
  {
    id: '2',
    customerName: 'Sneha Patel',
    repairWorks: [mockRepairWorks[2]],
    storeId: '2',
    storeName: 'Branch Store',
    date: '2024-10-24T14:15:00Z',
    totalAmount: 300,
  },
];

// Alias for imports
export const WorkOrder = mockWorkOrders;

export const mockUser = {
  email: 'admin@tailorshop.com',
  password: 'admin123',
  language: 'english',
};

// Alias for imports
export const User = mockUser;

// -----------------------------
// Local Storage Utilities
// -----------------------------
export const getStoredData = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStoredData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// -----------------------------
// Authentication Utilities
// -----------------------------
export const isAuthenticated = () => localStorage.getItem('isLoggedIn') === 'true';

export const login = (email, password) => {
  if (email === mockUser.email && password === mockUser.password) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
};

// -----------------------------
// Initialize Data in Local Storage
// -----------------------------
export const initializeData = () => {
  if (!localStorage.getItem('repairWorks')) setStoredData('repairWorks', mockRepairWorks);
  if (!localStorage.getItem('stores')) setStoredData('stores', mockStores);
  if (!localStorage.getItem('workOrders')) setStoredData('workOrders', mockWorkOrders);
  if (!localStorage.getItem('userSettings')) setStoredData('userSettings', { language: 'english' });
};
