import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalChecks: 0,
    averageSeverity: '',
    topSymptoms: [] as string[],
    hospitalBookings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [passwordError, setPasswordError] = useState('');

  const handleAdminLogin = () => {
    // Simple password check (in production, use proper authentication)
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      setPasswordError('');
      fetchDashboardData();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-sans">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground font-sans">
              Enter your credentials to continue
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border space-y-4">
            <div>
              <label className="text-sm text-muted-foreground font-sans mb-2 block">
                Admin Password
              </label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleAdminLogin()
                }
                placeholder="Enter password"
                className="font-sans"
              />
              {passwordError && (
                <p className="text-xs text-red-600 mt-1 font-sans">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleAdminLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white font-sans"
              >
                Login
              </Button>
              <Button onClick={onBack} variant="outline" className="w-full font-sans">
                Back
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center font-sans mt-4">
              Demo password: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <h1 className="text-3xl font-bold text-foreground font-sans">
            Admin Dashboard
          </h1>
          <Button
            onClick={onBack}
            variant="outline"
            className="font-sans"
          >
            Exit
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Total Checks */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2 font-sans">
              Total Symptom Checks
            </p>
            <h3 className="text-4xl font-bold text-primary font-sans">
              {stats.totalChecks}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Users who completed assessment
            </p>
          </div>

          {/* Average Severity */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2 font-sans">
              Average Severity
            </p>
            <h3 className="text-4xl font-bold text-primary font-sans">
              {stats.averageSeverity}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Based on all assessments
            </p>
          </div>

          {/* Hospital Bookings */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2 font-sans">
              Hospital Bookings
            </p>
            <h3 className="text-4xl font-bold text-primary font-sans">
              {stats.hospitalBookings}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Appointments booked
            </p>
          </div>

          {/* Top Symptom */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2 font-sans">
              Most Common Symptom
            </p>
            <h3 className="text-lg font-bold text-primary font-sans truncate">
              {stats.topSymptoms[0] || 'N/A'}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 font-sans">
              Reported most frequently
            </p>
          </div>
        </div>

        {/* Top Symptoms */}
        {stats.topSymptoms.length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 font-sans">
              Top Symptoms
            </h2>
            <ul className="space-y-2">
              {stats.topSymptoms.map((symptom, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted rounded font-sans"
                >
                  <span className="text-foreground">{symptom}</span>
                  <span className="text-xs text-muted-foreground">
                    #{idx + 1}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4 font-sans">
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-border rounded bg-muted/50 font-sans text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">
                      {activity.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
