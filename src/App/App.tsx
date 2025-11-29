import React, { useState, useEffect } from 'react';
import { QrCode, Scan, Coffee, Gift, User, Store, PlusCircle, History, LogOut, Wallet } from 'lucide-react';

// --- Types & Interfaces ---
interface Transaction {
  id: string;
  type: 'EARN' | 'REDEEM';
  amount: number;
  date: string;
  description: string;
}

interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: React.ReactNode;
}

interface UserData {
  id: string;
  name: string;
  points: number;
  transactions: Transaction[];
}

// --- Mock Data & Constants ---
const INITIAL_USER: UserData = {
  id: 'CUST-8821',
  name: 'Alex Johnson',
  points: 120,
  transactions: [
    { id: '1', type: 'EARN', amount: 50, date: '2023-10-25', description: 'Purchase at Downtown Branch' },
    { id: '2', type: 'REDEEM', amount: -20, date: '2023-10-26', description: 'Free Espresso' },
  ],
};

const REWARDS: Reward[] = [
  { id: 'r1', name: 'Free Espresso', cost: 50, icon: <Coffee className="w-6 h-6" /> },
  { id: 'r2', name: '$5 Store Credit', cost: 100, icon: <Wallet className="w-6 h-6" /> },
  { id: 'r3', name: 'Mystery Gift Box', cost: 200, icon: <Gift className="w-6 h-6" /> },
];

export default function LoyaltyApp() {
  // State
  const [view, setView] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [userData, setUserData] = useState<UserData>(INITIAL_USER);
  const [merchantInputId, setMerchantInputId] = useState('');
  const [pointsInput, setPointsInput] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize data from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('loyalty_user');
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse saved user data:", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('loyalty_user', JSON.stringify(userData));
  }, [userData]);

  // --- Actions ---
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const addPoints = (amount: number, desc: string) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'EARN',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      description: desc,
    };
    setUserData(prev => ({
      ...prev,
      points: prev.points + amount,
      transactions: [newTx, ...prev.transactions]
    }));
    showNotification(`Successfully added ${amount} points!`);
  };

  const redeemReward = (reward: Reward) => {
    if (userData.points < reward.cost) {
      showNotification('Insufficient points!');
      return;
    }
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: 'REDEEM',
      amount: -reward.cost,
      date: new Date().toISOString().split('T')[0],
      description: `Redeemed: ${reward.name}`,
    };
    setUserData(prev => ({
      ...prev,
      points: prev.points - reward.cost,
      transactions: [newTx, ...prev.transactions]
    }));
    showNotification(`Redeemed ${reward.name}!`);
  };

  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pointsInput <= 0) return;
    addPoints(pointsInput, 'Store Visit (Manual Entry)');
    setPointsInput(0);
  };

  // --- Components ---

  const CustomerView = () => (
    <div className="space-y-6">
      {/* Digital Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform transition hover:scale-105 duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Loyalty Plus</h2>
            <p className="opacity-80">Member since 2023</p>
          </div>
          <QrCode className="w-12 h-12 opacity-90" />
        </div>
        <div className="mt-8">
          <p className="text-sm opacity-75">CURRENT BALANCE</p>
          <p className="text-5xl font-extrabold tracking-tight">{userData.points} <span className="text-2xl font-normal">PTS</span></p>
        </div>
        <div className="mt-4 flex justify-between items-end">
          <p className="font-mono text-sm tracking-widest opacity-80">{userData.id}</p>
          <p className="text-sm font-semibold">{userData.name}</p>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-purple-600" /> Rewards
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {REWARDS.map(reward => (
            <div key={reward.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  {reward.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{reward.name}</p>
                  <p className="text-xs text-gray-500 font-bold">{reward.cost} PTS</p>
                </div>
              </div>
              <button
                onClick={() => redeemReward(reward)}
                disabled={userData.points < reward.cost}
                className={`px-4