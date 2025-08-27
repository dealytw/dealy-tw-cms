import React, { useState, useEffect } from 'react';

interface SearchAnalytics {
  totalSearches: number;
  avgResults: number;
  searchTypes: Record<string, number>;
  markets: Record<string, number>;
  topQueries: Array<{ query: string; count: number }>;
  period: string;
}

const SearchAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/search/analytics?days=${period}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to fetch search analytics');
      console.error('Search analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div>Loading...</div>
        <div>Loading search analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ color: 'red', marginBottom: '16px' }}>
          {error}
        </div>
        <button onClick={handleRefresh} style={{ marginTop: '16px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>Search Analytics</h1>
        <p>Monitor search performance and user behavior</p>
        {lastUpdated && (
          <small>
            Last updated: {lastUpdated.toLocaleString()}
          </small>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label>
          Period:
          <select value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
        <button onClick={handleRefresh} style={{ marginLeft: '16px' }}>
          Refresh
        </button>
      </div>

      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
            <div>Total Searches</div>
            <h2>{analytics.totalSearches}</h2>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
            <div>Average Results</div>
            <h2>{analytics.avgResults.toFixed(1)}</h2>
          </div>
        </div>
      )}

      {/* Rest of the component would continue here with similar HTML structure */}
    </div>
  );
};

export default SearchAnalytics;
