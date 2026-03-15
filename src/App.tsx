import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Egg, Users, DollarSign, Activity, 
  Calendar, Droplets, Utensils, Info, ChevronRight, 
  TrendingUp, AlertCircle, CheckCircle2, Clock, 
  ChevronLeft, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { format, addDays, differenceInDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { CHICKEN_TIPS } from './constants';
import { 
  FarmData, Chicken, EggEntry, Sale, Customer, 
  FeedEntry, CleaningEntry, BroodingEntry, HealthStatus 
} from './types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function App() {
  // --- State ---
  const [data, setData] = useState<FarmData>(() => {
    const saved = localStorage.getItem('farmData');
    if (saved) return JSON.parse(saved);
    return {
      chickens: [],
      eggEntries: [],
      sales: [],
      customers: [],
      feedEntries: [],
      cleaningEntries: [],
      broodingEntries: [],
      eggStock: 0
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'chickens' | 'eggs' | 'finance' | 'health' | 'cleaning' | 'brooding'>('dashboard');
  const [tipIndex, setTipIndex] = useState(0);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('farmData', JSON.stringify(data));
  }, [data]);

  // --- Rotating Tips ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % CHICKEN_TIPS.length);
    }, 1000 * 60 * 60 * 4); // Every 4 hours
    return () => clearInterval(interval);
  }, []);

  // --- Calculations ---
  const stats = useMemo(() => {
    const totalEggs = data.eggEntries.reduce((sum, e) => sum + e.count, 0);
    const totalEarnings = data.sales.reduce((sum, s) => sum + s.price, 0);
    const totalCosts = data.feedEntries.reduce((sum, f) => sum + f.cost, 0);
    const sickCount = data.chickens.filter(c => c.status !== 'healthy').length;
    
    return { totalEggs, totalEarnings, totalCosts, sickCount };
  }, [data]);

  const chartData = useMemo(() => {
    return data.eggEntries.slice(-7).map(e => ({
      date: format(parseISO(e.date), 'd.M.'),
      count: e.count
    }));
  }, [data.eggEntries]);

  // --- Handlers ---
  const addChicken = (chicken: Omit<Chicken, 'id'>) => {
    const newChicken = { ...chicken, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, chickens: [...prev.chickens, newChicken] }));
  };

  const removeChicken = (id: string) => {
    setData(prev => ({ ...prev, chickens: prev.chickens.filter(c => c.id !== id) }));
  };

  const addEggEntry = (entry: Omit<EggEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setData(prev => ({ 
      ...prev, 
      eggEntries: [...prev.eggEntries, newEntry],
      eggStock: prev.eggStock + entry.count
    }));
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: crypto.randomUUID() };
    setData(prev => {
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === sale.customerId) {
          return {
            ...c,
            totalSpent: c.totalSpent + sale.price,
            totalEggsBought: c.totalEggsBought + sale.eggCount
          };
        }
        return c;
      });
      return {
        ...prev,
        sales: [...prev.sales, newSale],
        customers: updatedCustomers,
        eggStock: Math.max(0, prev.eggStock - sale.eggCount)
      };
    });
  };

  const addCustomer = (name: string) => {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      totalSpent: 0,
      totalEggsBought: 0
    };
    setData(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
  };

  const addFeedEntry = (entry: Omit<FeedEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, feedEntries: [...prev.feedEntries, newEntry] }));
  };

  const updateChickenStatus = (id: string, status: HealthStatus, meds: any[]) => {
    setData(prev => ({
      ...prev,
      chickens: prev.chickens.map(c => c.id === id ? { ...c, status, medications: meds } : c)
    }));
  };

  const addCleaning = (entry: Omit<CleaningEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, cleaningEntries: [...prev.cleaningEntries, newEntry] }));
  };

  const addBrooding = (entry: Omit<BroodingEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, broodingEntries: [...prev.broodingEntries, newEntry] }));
  };

  const updateBrooding = (id: string, updates: Partial<BroodingEntry>) => {
    setData(prev => ({
      ...prev,
      broodingEntries: prev.broodingEntries.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  // --- Components ---
  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200' 
          : 'text-stone-500 hover:bg-stone-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 p-6 flex flex-col gap-8 hidden md:flex">
        <div className="flex items-center gap-3 text-emerald-700">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Egg size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FarmaPomocník</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem id="dashboard" icon={TrendingUp} label="Přehled" />
          <NavItem id="chickens" icon={Users} label="Slepice" />
          <NavItem id="eggs" icon={Egg} label="Vajíčka" />
          <NavItem id="finance" icon={DollarSign} label="Finance" />
          <NavItem id="health" icon={Activity} label="Zdraví" />
          <NavItem id="cleaning" icon={Calendar} label="Čištění" />
          <NavItem id="brooding" icon={Clock} label="Kvokání" />
        </nav>

        <div className="mt-auto bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800 mb-2">
            <Info size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Tip dne</span>
          </div>
          <p className="text-sm text-emerald-700 leading-relaxed italic">
            "{CHICKEN_TIPS[tipIndex]}"
          </p>
          <button 
            onClick={() => setTipIndex(prev => (prev + 1) % CHICKEN_TIPS.length)}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
          >
            Další tip →
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">
              {activeTab === 'dashboard' && 'Vítejte zpět!'}
              {activeTab === 'chickens' && 'Správa slepic'}
              {activeTab === 'eggs' && 'Evidence vajíček'}
              {activeTab === 'finance' && 'Finance a výdaje'}
              {activeTab === 'health' && 'Zdravotní stav'}
              {activeTab === 'cleaning' && 'Čištění a údržba'}
              {activeTab === 'brooding' && 'Kvokání a líhnutí'}
            </h2>
            <p className="text-stone-500 mt-1">
              Dnes je {format(new Date(), 'EEEE d. MMMM yyyy', { locale: cs })}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                <Egg size={18} />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Skladem</p>
                <p className="text-lg font-bold text-stone-900">{data.eggStock} ks</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Celkem vajec" value={stats.totalEggs} icon={Egg} color="emerald" />
                <StatCard label="Slepic" value={data.chickens.length} icon={Users} color="amber" />
                <StatCard label="Výdělek" value={`${stats.totalEarnings} Kč`} icon={DollarSign} color="blue" />
                <StatCard label="Nemocné" value={stats.sickCount} icon={AlertCircle} color="red" />
              </div>

              {/* Chart */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-600" />
                    Produkce vajec (posledních 7 dní)
                  </h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="font-bold text-stone-800 mb-4">Poslední záznamy krmení</h3>
                <div className="space-y-4">
                  {data.feedEntries.slice(-3).reverse().map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg text-amber-700">
                          <Utensils size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{f.amountKg} kg krmiva</p>
                          <p className="text-xs text-stone-500">{format(parseISO(f.date), 'd. M. yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{f.cost} Kč</p>
                        <p className="text-xs text-stone-500">{f.waterLiters} L vody</p>
                      </div>
                    </div>
                  ))}
                  {data.feedEntries.length === 0 && (
                    <p className="text-center text-stone-400 py-4 italic">Zatím žádné záznamy krmení.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Cleaning Alert */}
              <div className="card border-l-4 border-l-emerald-500">
                <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" />
                  Plánovaná údržba
                </h3>
                {data.cleaningEntries.length > 0 ? (
                  <div className="space-y-3">
                    {data.cleaningEntries.slice(-2).map(c => (
                      <div key={c.id} className="text-sm">
                        <p className="text-stone-500">Příští {c.type === 'cleaning' ? 'čištění' : 'podestýlka'}:</p>
                        <p className="font-bold text-stone-900">{format(parseISO(c.nextPlannedDate), 'd. MMMM', { locale: cs })}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic">Žádné naplánované čištění.</p>
                )}
              </div>

              {/* Health Summary */}
              <div className="card border-l-4 border-l-red-500">
                <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                  <Activity size={18} className="text-red-600" />
                  Zdravotní stav
                </h3>
                {stats.sickCount > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-stone-600">Máte <span className="font-bold text-red-600">{stats.sickCount}</span> nemocné slepice.</p>
                    <button onClick={() => setActiveTab('health')} className="text-xs font-bold text-emerald-700 hover:underline">
                      Zobrazit detaily →
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic">Všechny slepice jsou zdravé! ✨</p>
                )}
              </div>

              {/* Brooding Alert */}
              {data.broodingEntries.filter(b => !b.endDate).length > 0 && (
                <div className="card border-l-4 border-l-blue-500">
                  <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    Aktuální kvokání
                  </h3>
                  <div className="space-y-3">
                    {data.broodingEntries.filter(b => !b.endDate).map(b => {
                      const chicken = data.chickens.find(c => c.id === b.chickenId);
                      const daysLeft = differenceInDays(parseISO(b.expectedHatchDate), new Date());
                      return (
                        <div key={b.id} className="text-sm">
                          <p className="font-bold">{chicken?.name || 'Slepice'}</p>
                          <p className="text-stone-500">Líhnutí za: <span className="text-blue-600 font-bold">{daysLeft} dní</span></p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chickens Tab */}
        {activeTab === 'chickens' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-lg mb-4">Přidat novou slepici</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addChicken({
                  name: formData.get('name') as string,
                  breed: formData.get('breed') as string,
                  birthDate: formData.get('birthDate') as string,
                  status: 'healthy',
                  medications: []
                });
                (e.target as HTMLFormElement).reset();
              }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input name="name" placeholder="Jméno" className="input-field" required />
                <input name="breed" placeholder="Plemeno" className="input-field" required />
                <input name="birthDate" type="date" className="input-field" required />
                <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                  <Plus size={18} /> Přidat
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.chickens.map(chicken => {
                const ageWeeks = differenceInDays(new Date(), parseISO(chicken.birthDate)) / 7;
                return (
                  <div key={chicken.id} className="card group relative">
                    <button 
                      onClick={() => removeChicken(chicken.id)}
                      className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-stone-100 p-3 rounded-2xl text-stone-600">
                        <Users size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{chicken.name}</h4>
                        <p className="text-sm text-stone-500">{chicken.breed}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Věk:</span>
                        <span className="font-medium">{Math.floor(ageWeeks)} týdnů</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Stav:</span>
                        <span className={`font-bold ${
                          chicken.status === 'healthy' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {chicken.status === 'healthy' ? 'Zdravá' : 'Nemocná'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.chickens.length === 0 && (
                <div className="col-span-full py-12 text-center text-stone-400 italic">
                  Zatím nemáte žádné slepice. Přidejte první!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eggs Tab */}
        {activeTab === 'eggs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-bold text-lg mb-4">Dnešní snáška</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addEggEntry({
                    date: formData.get('date') as string,
                    count: Number(formData.get('count')),
                    extraLarge: Number(formData.get('xl')),
                    extraSmall: Number(formData.get('xs'))
                  });
                  (e.target as HTMLFormElement).reset();
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Datum</label>
                      <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Celkem vajec</label>
                      <input name="count" type="number" placeholder="0" className="input-field" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Extra velká</label>
                      <input name="xl" type="number" defaultValue="0" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Extra malá</label>
                      <input name="xs" type="number" defaultValue="0" className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <Plus size={18} /> Zapsat snášku
                  </button>
                </form>
              </div>

              <div className="card">
                <h3 className="font-bold text-lg mb-4">Historie snášek</h3>
                <div className="space-y-3">
                  {data.eggEntries.slice().reverse().map(e => (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="font-bold">{e.count} vajec</p>
                        <p className="text-xs text-stone-500">{format(parseISO(e.date), 'd. M. yyyy')}</p>
                      </div>
                      <div className="flex gap-2">
                        {e.extraLarge > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">XL: {e.extraLarge}</span>}
                        {e.extraSmall > 0 && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">XS: {e.extraSmall}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-emerald-900 text-white border-none">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-emerald-800 p-3 rounded-2xl">
                    <Egg size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Sklad vajec</h3>
                    <p className="text-emerald-300">Aktuálně k dispozici</p>
                  </div>
                </div>
                <div className="text-5xl font-black mb-2">{data.eggStock} <span className="text-xl font-normal text-emerald-300">ks</span></div>
                <div className="h-1 bg-emerald-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, (data.eggStock / 100) * 100)}%` }}></div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-lg mb-4">Prodej vajíček</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addSale({
                    date: format(new Date(), 'yyyy-MM-dd'),
                    customerId: formData.get('customerId') as string,
                    eggCount: Number(formData.get('eggCount')),
                    price: Number(formData.get('price'))
                  });
                  (e.target as HTMLFormElement).reset();
                }} className="space-y-4">
                  <select name="customerId" className="input-field" required>
                    <option value="">Vyberte zákazníka</option>
                    {data.customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="eggCount" type="number" placeholder="Počet vajec" className="input-field" required />
                    <input name="price" type="number" placeholder="Cena (Kč)" className="input-field" required />
                  </div>
                  <button type="submit" className="btn-primary w-full">Prodat</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-emerald-50 border-emerald-100">
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-1">Celkové příjmy</p>
                <p className="text-3xl font-black text-emerald-900">{stats.totalEarnings} Kč</p>
              </div>
              <div className="card bg-red-50 border-red-100">
                <p className="text-red-600 text-sm font-bold uppercase tracking-wider mb-1">Celkové výdaje</p>
                <p className="text-3xl font-black text-red-900">{stats.totalCosts} Kč</p>
              </div>
              <div className="card bg-blue-50 border-blue-100">
                <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-1">Čistý zisk</p>
                <p className="text-3xl font-black text-blue-900">{stats.totalEarnings - stats.totalCosts} Kč</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="font-bold text-lg mb-4">Zapsat výdaj (Krmivo/Voda)</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addFeedEntry({
                    date: formData.get('date') as string,
                    amountKg: Number(formData.get('amountKg')),
                    cost: Number(formData.get('cost')),
                    waterLiters: Number(formData.get('waterLiters')),
                    durationDays: Number(formData.get('duration')) || undefined
                  });
                  (e.target as HTMLFormElement).reset();
                }} className="space-y-4">
                  <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="input-field" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="amountKg" type="number" step="0.1" placeholder="Množství krmiva (kg)" className="input-field" required />
                    <input name="cost" type="number" placeholder="Cena krmiva (Kč)" className="input-field" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input name="waterLiters" type="number" step="0.1" placeholder="Voda (litry)" className="input-field" required />
                    <input name="duration" type="number" placeholder="Jak dlouho vydrželo (dny)" className="input-field" />
                  </div>
                  <button type="submit" className="btn-primary w-full">Uložit výdaj</button>
                </form>
              </div>

              <div className="card">
                <h3 className="font-bold text-lg mb-4">Zákazníci</h3>
                <div className="flex gap-2 mb-4">
                  <input id="newCustName" placeholder="Jméno nového zákazníka" className="input-field flex-1" />
                  <button onClick={() => {
                    const input = document.getElementById('newCustName') as HTMLInputElement;
                    if (input.value) {
                      addCustomer(input.value);
                      input.value = '';
                    }
                  }} className="btn-secondary">Přidat</button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {data.customers.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <div>
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-stone-500">{c.totalEggsBought} vajec celkem</p>
                      </div>
                      <p className="font-black text-emerald-700">{c.totalSpent} Kč</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.chickens.map(chicken => (
                <div key={chicken.id} className={`card border-t-4 ${
                  chicken.status === 'healthy' ? 'border-t-emerald-500' : 'border-t-red-500'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{chicken.name}</h4>
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">{chicken.breed}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      chicken.status === 'healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {chicken.status === 'healthy' ? 'Zdravá' : 'Nemocná'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-stone-400 uppercase mb-1 block">Změnit stav</label>
                      <select 
                        value={chicken.status}
                        onChange={(e) => updateChickenStatus(chicken.id, e.target.value as HealthStatus, chicken.medications)}
                        className="input-field text-sm py-1"
                      >
                        <option value="healthy">Zdravá</option>
                        <option value="sick">Nemocná</option>
                        <option value="improving">Lepší se</option>
                        <option value="recovering">V rekonvalescenci</option>
                      </select>
                    </div>

                    {chicken.status !== 'healthy' && (
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <h5 className="text-xs font-bold text-stone-600 mb-2 flex items-center gap-1">
                          <Activity size={12} /> Léky a poznámky
                        </h5>
                        <textarea 
                          className="w-full bg-transparent text-sm focus:outline-none min-h-[60px]"
                          placeholder="Zadejte léky nebo poznámky..."
                          defaultValue={chicken.medications[0]?.notes || ''}
                          onBlur={(e) => {
                            const newMeds = [{ name: 'Aktuální léčba', startDate: new Date().toISOString(), notes: e.target.value }];
                            updateChickenStatus(chicken.id, chicken.status, newMeds);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cleaning Tab */}
        {activeTab === 'cleaning' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-bold text-lg mb-4">Zapsat údržbu</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addCleaning({
                    date: formData.get('date') as string,
                    type: formData.get('type') as 'cleaning' | 'bedding',
                    nextPlannedDate: formData.get('nextDate') as string
                  });
                  (e.target as HTMLFormElement).reset();
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Datum provedení</label>
                      <input name="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="input-field" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Typ údržby</label>
                      <select name="type" className="input-field" required>
                        <option value="cleaning">Čištění kurníku</option>
                        <option value="bedding">Výměna podestýlky</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-1 block">Příští plánovaný termín</label>
                    <input name="nextDate" type="date" className="input-field" required />
                  </div>
                  <button type="submit" className="btn-primary w-full">Uložit záznam</button>
                </form>
              </div>

              <div className="card">
                <h3 className="font-bold text-lg mb-4">Historie údržby</h3>
                <div className="space-y-3">
                  {data.cleaningEntries.slice().reverse().map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${c.type === 'cleaning' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {c.type === 'cleaning' ? <Trash2 size={16} /> : <Calendar size={16} />}
                        </div>
                        <div>
                          <p className="font-bold">{c.type === 'cleaning' ? 'Čištění' : 'Podestýlka'}</p>
                          <p className="text-xs text-stone-500">Provedeno: {format(parseISO(c.date), 'd. M. yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-stone-400 uppercase">Příště</p>
                        <p className="text-sm font-bold text-emerald-700">{format(parseISO(c.nextPlannedDate), 'd. M. yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brooding Tab */}
        {activeTab === 'brooding' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-lg mb-4">Nové kvokání / sezení na vejcích</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const startDate = formData.get('startDate') as string;
                // Chickens sit for ~21 days
                const expected = format(addDays(parseISO(startDate), 21), 'yyyy-MM-dd');
                addBrooding({
                  chickenId: formData.get('chickenId') as string,
                  startDate,
                  expectedHatchDate: expected,
                  notes: formData.get('notes') as string
                });
                (e.target as HTMLFormElement).reset();
              }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select name="chickenId" className="input-field" required>
                  <option value="">Vyberte slepici</option>
                  {data.chickens.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input name="startDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="input-field" required />
                <button type="submit" className="btn-primary">Zahájit sledování</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.broodingEntries.map(b => {
                const chicken = data.chickens.find(c => c.id === b.chickenId);
                const isFinished = !!b.endDate;
                const daysLeft = differenceInDays(parseISO(b.expectedHatchDate), new Date());
                
                return (
                  <div key={b.id} className={`card ${isFinished ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-700">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{chicken?.name || 'Slepice'}</h4>
                          <p className="text-xs text-stone-500">Zahájeno: {format(parseISO(b.startDate), 'd. M. yyyy')}</p>
                        </div>
                      </div>
                      {!isFinished && (
                        <button 
                          onClick={() => updateBrooding(b.id, { endDate: format(new Date(), 'yyyy-MM-dd') })}
                          className="text-xs font-bold text-emerald-700 hover:underline"
                        >
                          Ukončit
                        </button>
                      )}
                    </div>
                    
                    {!isFinished ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-stone-400 font-bold uppercase">Předpokládané líhnutí</p>
                            <p className="text-xl font-black text-blue-900">{format(parseISO(b.expectedHatchDate), 'd. MMMM', { locale: cs })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-blue-600">{daysLeft} <span className="text-sm font-normal">dní</span></p>
                          </div>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000" 
                            style={{ width: `${Math.max(0, Math.min(100, (differenceInDays(new Date(), parseISO(b.startDate)) / 21) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-stone-500 italic">Sledování ukončeno {format(parseISO(b.endDate!), 'd. M. yyyy')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: 'emerald' | 'amber' | 'blue' | 'red' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100'
  };

  return (
    <div className={`card ${colors[color]} border flex flex-col items-center justify-center text-center p-4`}>
      <Icon size={20} className="mb-2 opacity-60" />
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}
