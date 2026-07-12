import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import clsx from 'clsx';
import {
  getCheckoutStats,
  getDashboardBooksPanel,
  getDashboardStats,
  getOverdueHistory,
  getRecentCheckouts,
  type DashboardStat,
  type DashboardRange,
  type DashboardStats,
} from '../api/dashboard';

const statConfig: Array<{
  key: keyof DashboardStats;
  label: string;
  format?: (value: number) => string;
}> = [
  { key: 'borrowedBooks', label: 'Borrowed Books' },
  { key: 'returnedBooks', label: 'Returned Books' },
  { key: 'overdueBooks', label: 'Overdue Books' },
  { key: 'missingBooks', label: 'Missing Books' },
  { key: 'totalBooks', label: 'Total Books' },
  { key: 'visitors', label: 'Visitors' },
  { key: 'newMembers', label: 'New Members' },
  { key: 'pendingFees', label: 'Pending Fees', format: (value) => `$${value.toLocaleString()}` },
];

const rangeOptions: Array<{ value: DashboardRange; label: string }> = [
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'last_6_months', label: 'Last 6 months' },
  { value: 'last_12_months', label: 'Last 12 months' },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;

const getChangeStyles = (direction: DashboardStat['direction']) => {
  if (direction === 'up') {
    return {
      className: 'bg-green-50 text-green-600',
      icon: <ArrowUpRight className="h-3 w-3" />,
    };
  }

  if (direction === 'down') {
    return {
      className: 'bg-red-50 text-red-500',
      icon: <ArrowDownRight className="h-3 w-3" />,
    };
  }

  return {
    className: 'bg-gray-100 text-gray-500',
    icon: <Minus className="h-3 w-3" />,
  };
};

const StatSkeleton = () => (
  <div className="h-[110px] rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
    <div className="h-3 w-28 animate-pulse rounded-full bg-gray-100" />
    <div className="mt-6 h-7 w-20 animate-pulse rounded-full bg-gray-100" />
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'top' | 'new'>('top');
  const [range, setRange] = useState<DashboardRange>('last_6_months');

  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', range],
    queryFn: () => getDashboardStats(range),
  });

  const checkoutStatsQuery = useQuery({
    queryKey: ['dashboard-checkout-stats', range],
    queryFn: () => getCheckoutStats(range),
  });

  const overdueQuery = useQuery({
    queryKey: ['dashboard-overdue-history'],
    queryFn: getOverdueHistory,
  });

  const recentCheckoutsQuery = useQuery({
    queryKey: ['dashboard-recent-checkouts'],
    queryFn: getRecentCheckouts,
  });

  const booksPanelQuery = useQuery({
    queryKey: ['dashboard-books-panel', activeTab],
    queryFn: () => getDashboardBooksPanel(activeTab),
  });

  const errors = [
    statsQuery.error,
    checkoutStatsQuery.error,
    overdueQuery.error,
    recentCheckoutsQuery.error,
    booksPanelQuery.error,
  ].filter(Boolean);

  const chartData =
    checkoutStatsQuery.data?.map((point) => ({
      name: point.day,
      borrowed: point.borrowed,
      returned: point.returned,
    })) ?? [];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {getErrorMessage(errors[0], 'Unable to load dashboard data.')}
        </div>
      )}

      <div className="flex justify-stretch sm:justify-end">
        <label className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-[13px] font-medium text-charcoal shadow-sm sm:w-auto sm:justify-start">
          <span className="text-gray-400">Range</span>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as DashboardRange)}
            className="bg-transparent text-[13px] font-semibold text-charcoal outline-none"
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 8 }).map((_, index) => <StatSkeleton key={index} />)
          : statConfig.map((config) => {
              const stat = statsQuery.data?.[config.key];
              if (!stat) return null;

              const changeStyles = getChangeStyles(stat.direction);

              return (
                <div
                  key={config.key}
                  className="flex h-[110px] flex-col justify-between rounded-2xl border border-gray-50 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sm:p-6"
                >
                  <span className="text-[13px] font-medium text-gray-500">{config.label}</span>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-[28px] font-bold leading-none text-charcoal">
                      {config.format ? config.format(stat.value) : stat.value.toLocaleString()}
                    </span>
                    <div
                      className={clsx(
                        'flex items-center gap-0.5 rounded-full px-2 py-1 text-[12px] font-medium',
                        changeStyles.className
                      )}
                    >
                      {changeStyles.icon}
                      {Math.abs(stat.changePercent)}%
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-7 xl:col-span-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-[16px] font-bold text-charcoal">Check-out statistics</h3>
            <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-gold" />
                Borrowed
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                Returned
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {checkoutStatsQuery.isLoading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-gray-50" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[13px] text-gray-500">
                No checkout statistics available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9963C" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#C9963C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F87171" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
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
                    tickFormatter={(value) => (value >= 1000 ? `${value / 1000}K` : String(value))}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="borrowed"
                    stroke="#C9963C"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBorrowed)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returned"
                    stroke="#F87171"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-5 xl:col-span-4">
          <h3 className="mb-6 text-[16px] font-bold text-charcoal">Overdue's History</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-[640px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[110px]" />
                <col className="w-[180px]" />
                <col className="w-[160px]" />
                <col className="w-[120px]" />
                <col className="w-[90px]" />
              </colgroup>
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-3 pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Member ID
                  </th>
                  <th className="whitespace-nowrap px-3 pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Title
                  </th>
                  <th className="whitespace-nowrap px-3 pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    ISBN
                  </th>
                  <th className="whitespace-nowrap px-3 pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Due Date
                  </th>
                  <th className="whitespace-nowrap px-3 pb-4 text-right text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Fine
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-600">
                {overdueQuery.isLoading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[13px] text-gray-500">
                      Loading overdue history...
                    </td>
                  </tr>
                )}
                {!overdueQuery.isLoading && (overdueQuery.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[13px] text-gray-500">
                      No overdue history.
                    </td>
                  </tr>
                )}
                {overdueQuery.data?.map((row) => (
                  <tr
                    key={`${row.memberCode}-${row.isbn}-${row.dueDate}`}
                    className="border-t border-gray-50"
                  >
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-charcoal">
                      {row.memberCode}
                    </td>
                    <td className="truncate px-3 py-4" title={row.title}>
                      {row.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-gray-500">{row.isbn}</td>
                    <td className="whitespace-nowrap px-3 py-4">{formatDate(row.dueDate)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right font-medium text-red-500">
                      {formatCurrency(row.fineAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-8 xl:col-span-9">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-charcoal">Recent Check-out's</h3>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="text-[13px] font-medium text-amber-gold transition-colors hover:text-amber-gold/80"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] whitespace-nowrap border-collapse text-left">
              <thead>
                <tr>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    ID
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    ISBN
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Title
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Author
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Member
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Issued Date
                  </th>
                  <th className="pb-4 text-[12px] font-semibold uppercase tracking-wider text-gray-400">
                    Return Date
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-gray-600">
                {recentCheckoutsQuery.isLoading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[13px] text-gray-500">
                      Loading recent check-outs...
                    </td>
                  </tr>
                )}
                {!recentCheckoutsQuery.isLoading &&
                  (recentCheckoutsQuery.data?.length ?? 0) === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[13px] text-gray-500">
                        No recent check-outs.
                      </td>
                    </tr>
                  )}
                {recentCheckoutsQuery.data?.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-50 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="py-4 font-medium text-charcoal">{row.id}</td>
                    <td className="py-4">{row.isbn}</td>
                    <td className="py-4 font-medium text-charcoal">{row.title}</td>
                    <td className="py-4">{row.author}</td>
                    <td className="py-4">{row.member}</td>
                    <td className="py-4">{formatDate(row.issuedDate)}</td>
                    <td className="py-4">{formatDate(row.returnDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-gray-50 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-4 xl:col-span-3">
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-gray-50 p-1">
            <button
              onClick={() => setActiveTab('top')}
              className={clsx(
                'flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all',
                activeTab === 'top'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              )}
            >
              Top Books
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={clsx(
                'flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all',
                activeTab === 'new'
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-charcoal'
              )}
            >
              New arrivals
            </button>
          </div>

          <div className="flex-1 space-y-5">
            {booksPanelQuery.isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-50" />
                ))}
              </div>
            )}
            {!booksPanelQuery.isLoading && (booksPanelQuery.data?.length ?? 0) === 0 && (
              <p className="text-[13px] text-gray-500">No books available.</p>
            )}
            {booksPanelQuery.data?.map((book) => (
              <div
                key={`${book.title}-${book.author}`}
                className="group flex items-start justify-between"
              >
                <div>
                  <h4 className="text-[14px] font-bold text-charcoal transition-colors group-hover:text-amber-gold">
                    {book.title}
                  </h4>
                  <p className="mt-0.5 text-[12px] text-gray-500">
                    {book.author} · {book.availableCopies} available
                  </p>
                  <div
                    className={clsx(
                      'mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium',
                      book.status.toLowerCase() === 'available'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    )}
                  >
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
