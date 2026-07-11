import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

const statCards = [
  { label: 'Borrowed Books', value: '2405', change: '+23%', isPositive: true },
  { label: 'Returned Books', value: '783', change: '-14%', isPositive: false },
  { label: 'Overdue Books', value: '45', change: '+11%', isPositive: true },
  { label: 'Missing Books', value: '12', change: '+11%', isPositive: true },
  { label: 'Total Books', value: '32345', change: '+11%', isPositive: true },
  { label: 'Visitors', value: '1504', change: '+3%', isPositive: true },
  { label: 'New Members', value: '34', change: '-10%', isPositive: false },
  { label: 'Pending Fees', value: '$765', change: '+56%', isPositive: true },
];

const chartData = [
  { name: 'Mon', borrowed: 2400, returned: 1400 },
  { name: 'Tue', borrowed: 1398, returned: 2210 },
  { name: 'Wed', borrowed: 4800, returned: 2290 },
  { name: 'Thu', borrowed: 3908, returned: 2000 },
  { name: 'Fri', borrowed: 4800, returned: 2181 },
  { name: 'Sat', borrowed: 3800, returned: 2500 },
  { name: 'Sun', borrowed: 4300, returned: 2100 },
];

const overdueData = [
  { id: 'M-1024', title: 'The Great Gatsby', isbn: '978-0743273565', dueDate: 'Oct 12, 2023', fine: '$12.50' },
  { id: 'M-2045', title: '1984', isbn: '978-0451524935', dueDate: 'Oct 14, 2023', fine: '$8.00' },
  { id: 'M-3012', title: 'To Kill a Mockingbird', isbn: '978-0060935467', dueDate: 'Oct 15, 2023', fine: '$5.50' },
  { id: 'M-1899', title: 'Pride and Prejudice', isbn: '978-0061120084', dueDate: 'Oct 18, 2023', fine: '$2.00' },
];

const recentCheckouts = [
  { id: '#8924', isbn: '978-0316769488', title: 'The Catcher in the Rye', author: 'J.D. Salinger', member: 'Sarah Jenkins', issued: 'Oct 24, 2023', return: 'Nov 07, 2023' },
  { id: '#8925', isbn: '978-0142437209', title: 'Frankenstein', author: 'Mary Shelley', member: 'David Chen', issued: 'Oct 24, 2023', return: 'Nov 07, 2023' },
  { id: '#8926', isbn: '978-0618202621', title: 'The Hobbit', author: 'Mary Shelley', member: 'Emily Rodriguez', issued: 'Oct 24, 2023', return: 'Nov 07, 2023' },
  { id: '#8927', isbn: '978-0553213111', title: 'Moby Dick', author: 'Herman Melville', member: 'Michael Chang', issued: 'Oct 23, 2023', return: 'Nov 06, 2023' },
];

const topBooks = [
  { title: 'The Midnight Library', borrower: 'Matt Haig', status: 'Available' },
  { title: 'Atomic Habits', borrower: 'James Clear', status: 'Available' },
  { title: 'Dune', borrower: 'Frank Herbert', status: 'Available' },
  { title: 'Project Hail Mary', borrower: 'Andy Weir', status: 'Available' },
];

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'top' | 'new'>('top');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col justify-between h-[110px]">
            <span className="text-gray-500 text-[13px] font-medium">{stat.label}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-[28px] font-bold text-charcoal leading-none">{stat.value}</span>
              <div className={clsx(
                "flex items-center gap-0.5 px-2 py-1 rounded-full text-[12px] font-medium",
                stat.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              )}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change.replace('+', '').replace('-', '')}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Check-out Statistics Chart */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[16px] font-bold text-charcoal">Check-out statistics</h3>
            <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-gold"></div>
                Borrowed
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                Returned
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9963C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C9963C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F87171" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="borrowed" stroke="#C9963C" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrowed)" />
                <Area type="monotone" dataKey="returned" stroke="#F87171" strokeWidth={3} fillOpacity={1} fill="url(#colorReturned)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overdue's History */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col">
          <h3 className="text-[16px] font-bold text-charcoal mb-6">Overdue's History</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Member ID</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">ISBN</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider text-right">Fine</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-600">
                {overdueData.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-4 font-medium text-charcoal">{row.id}</td>
                    <td className="py-4 truncate max-w-[120px]" title={row.title}>{row.title}</td>
                    <td className="py-4 text-gray-500">{row.isbn}</td>
                    <td className="py-4">{row.dueDate}</td>
                    <td className="py-4 text-right text-red-500 font-medium">{row.fine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Check-out's */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[16px] font-bold text-charcoal">Recent Check-out's</h3>
            <button className="text-[13px] font-medium text-amber-gold hover:text-amber-gold/80 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">ISBN</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Author</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Issued Date</th>
                  <th className="pb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Return Date</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-600">
                {recentCheckouts.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-charcoal">{row.id}</td>
                    <td className="py-4">{row.isbn}</td>
                    <td className="py-4 font-medium text-charcoal">{row.title}</td>
                    <td className="py-4">{row.author}</td>
                    <td className="py-4">{row.member}</td>
                    <td className="py-4">{row.issued}</td>
                    <td className="py-4">{row.return}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Books */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col">
          <div className="flex items-center gap-2 mb-6 bg-gray-50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('top')}
              className={clsx(
                "flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all",
                activeTab === 'top' ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"
              )}
            >
              Top Books
            </button>
            <button 
              onClick={() => setActiveTab('new')}
              className={clsx(
                "flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all",
                activeTab === 'new' ? "bg-white text-charcoal shadow-sm" : "text-gray-500 hover:text-charcoal"
              )}
            >
              New arrivals
            </button>
          </div>
          
          <div className="flex-1 space-y-5">
            {topBooks.map((book, i) => (
              <div key={i} className="flex items-start justify-between group cursor-pointer">
                <div>
                  <h4 className="text-[14px] font-bold text-charcoal group-hover:text-amber-gold transition-colors">{book.title}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{book.borrower}</p>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-600 text-[11px] font-medium">
                    {book.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
