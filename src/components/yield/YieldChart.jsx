import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';

const YieldChart = ({ yieldHistory = [], selectedPeriod = '30d', onPeriodChange }) => {
  const [chartType, setChartType] = useState('cumulative'); // 'cumulative' or 'daily'

  // Generate mock data if no history provided
  const chartData = useMemo(() => {
    if (yieldHistory.length > 0) return yieldHistory;

    // Generate mock data based on period
    const periods = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = periods[selectedPeriod] || 30;
    const data = [];
    let cumulative = 0;

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const dailyYield = 15 + Math.random() * 10; // $15-25 per day
      cumulative += dailyYield;

      data.push({
        date: date.toISOString().split('T')[0],
        daily: dailyYield,
        cumulative: cumulative,
        apy: 3.5 + Math.random() * 1.5, // 3.5-5% APY
      });
    }

    return data;
  }, [yieldHistory, selectedPeriod]);

  const periods = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { total: 0, average: 0, highest: 0 };

    const total = chartData[chartData.length - 1]?.cumulative || 0;
    const average = total / chartData.length;
    const highest = Math.max(...chartData.map(d => d.daily));

    return { total, average, highest };
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <div className="text-xs text-gray-400 mb-2">
          {payload[0].payload.date}
        </div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-3">
            <span className="text-sm text-gray-300">{entry.name}:</span>
            <span className="text-sm font-semibold text-white">
              {entry.name === 'APY' 
                ? formatPercent(entry.value)
                : formatCurrency(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Yield Performance</h3>
            <p className="text-sm text-gray-400">Track your earnings over time</p>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-900 rounded-lg p-1 gap-1">
            <button
              onClick={() => setChartType('cumulative')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                chartType === 'cumulative'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cumulative
            </button>
            <button
              onClick={() => setChartType('daily')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                chartType === 'daily'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Daily
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <DollarSign size={16} />
              <span>Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(stats.total)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <Calendar size={16} />
              <span>Daily Average</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats.average)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
              <TrendingUp size={16} />
              <span>Highest Day</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(stats.highest)}
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => onPeriodChange && onPeriodChange(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriod === period.value
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-400">
            {chartData.length} data points
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-50" />
              <p>No yield data available yet</p>
              <p className="text-sm mt-1">Start supplying to see your earnings</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'cumulative' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorCumulative)"
                  name="Total Yield"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="daily" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Daily Yield"
                />
                <Line 
                  type="monotone" 
                  dataKey="apy" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                  name="APY"
                  yAxisId="right"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-400">Yield Earned</span>
            </div>
            {chartType === 'daily' && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-400">APY Rate</span>
              </div>
            )}
          </div>
          <div className="text-gray-400">
            Auto-updated every block
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldChart;