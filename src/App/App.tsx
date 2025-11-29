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
      setUserData(JSON.parse(saved));
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
    // In a real app, we would verify merchantInputId matches a user
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userData.points >= reward.cost
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <History className="w-5 h-5 mr-2 text-gray-600" /> Recent Activity
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {userData.transactions.length === 0 ? (
             <p className="p-4 text-center text-gray-400 text-sm">No transactions yet.</p>
          ) : (
            userData.transactions.map((tx, idx) => (
              <div key={tx.id} className={`p-4 flex justify-between items-center ${idx !== userData.transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <span className={`font-bold ${tx.type === 'EARN' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'EARN' ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const MerchantView = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <Store className="w-6 h-6 mr-2" /> Merchant Portal
        </h2 >
        <p className="opacity-70 text-sm">Issue points to customers manually or scan their ID.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Scan className="w-5 h-5 mr-2 text-blue-600" /> Issue Points
        </h3>
        <form onSubmit={handleMerchantSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer ID</label>
            <input
              type="text"
              value={merchantInputId}
              onChange={(e) => setMerchantInputId(e.target.value)}
              placeholder="e.g. CUST-8821"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Points Amount</label>
            <div className="flex items-center space-x-4">
               <button
                 type="button"
                 onClick={() => setPointsInput(Math.max(0, pointsInput - 10))}
                 className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
               >-</button>
               <input
                type="number"
                value={pointsInput}
                onChange={(e) => setPointsInput(parseInt(e.target.value) || 0)}
                className="w-full text-center p-3 font-bold text-xl border border-gray-200 rounded-lg outline-none"
               />
               <button
                 type="button"
                 onClick={() => setPointsInput(pointsInput + 10)}
                 className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
               >+</button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add Points
          </button>
        </form>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          <strong>Tip:</strong> In a real deployment, this would connect to a barcode scanner API. For this demo, enter the ID shown in the Customer View.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex justify-center">
      {/* Mobile-first Container */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10 flex justify-between items-center">
           <h1 className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
             Loya<span className="text-gray-800">App</span>
           </h1>
           <button
             onClick={() => setView(view === 'CUSTOMER' ? 'MERCHANT' : 'CUSTOMER')}
             className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
           >
             Switch to {view === 'CUSTOMER' ? 'Merchant' : 'Customer'}
           </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
           {view === 'CUSTOMER' ? <CustomerView /> : <MerchantView />}
        </main>

        {/* Notification Toast */}
        {notification && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-bounce">
            {notification}
          </div>
        )}

        {/* Tab Bar (Visual Only for this demo) */}
        <nav className="bg-white border-t border-gray-100 p-2 flex justify-around items-center text-xs font-medium text-gray-400 pb-safe">
           <div className={`flex flex-col items-center cursor-pointer ${view === 'CUSTOMER' ? 'text-purple-600' : ''}`} onClick={() => setView('CUSTOMER')}>
             <User className="w-6 h-6 mb-1" />
             <span>Profile</span>
           </div>
           <div className="flex flex-col items-center cursor-pointer hover:text-gray-600">
             <Scan className="w-6 h-6 mb-1" />
             <span>Scan</span>
           </div>
           <div className={`flex flex-col items-center cursor-pointer ${view === 'MERCHANT' ? 'text-blue-600' : ''}`} onClick={() => setView('MERCHANT')}>
             <Store className="w-6 h-6 mb-1" />
             <span>Store</span>
           </div>
        </nav>
      </div>
    </div>
  );
}