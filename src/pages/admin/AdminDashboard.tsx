import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/api';
import { DashboardStats } from '@/types';
import { BarChart3, Users, Music, FileText } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [users, music, companies, admins, logSheets, pendingProfiles, pendingMusic, allProfiles] = await Promise.all([
          adminAPI.getAllUsers().catch(() => []),
          adminAPI.getAllMusic().catch(() => []),
          adminAPI.getAllCompanies().catch(() => []),
          adminAPI.getAllAdmins().catch(() => []),
          adminAPI.getAllLogSheets().catch(() => []),
          adminAPI.getPendingProfiles().catch(() => []),
          adminAPI.getPendingMusic().catch(() => []),
          adminAPI.getAllProfiles().catch(() => []),
        ]);

        const computed: DashboardStats = {
          totalUsers: users.length,
          totalArtists: users.filter((u: any) => u.role === 'ARTIST').length,
          totalCompanies: users.filter((u: any) => u.role === 'COMPANY').length,
          totalMusic: music.length,
          approvedMusic: music.filter((m: any) => (m.status?.statusName || m.status?.status) === 'APPROVED').length,
          pendingMusic: pendingMusic.length,
          rejectedMusic: music.filter((m: any) => (m.status?.statusName || m.status?.status) === 'REJECTED').length,
          totalLogSheets: logSheets.length,
          pendingProfiles: pendingProfiles.length,
          approvedProfiles: allProfiles.filter((p: any) => (p.status?.statusName || p.status?.status) === 'APPROVED').length,
          rejectedProfiles: allProfiles.filter((p: any) => (p.status?.statusName || p.status?.status) === 'REJECTED').length,
          recentActivity: [],
        } as any;

        setStats(computed);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">System-wide analytics and pending approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Users" value={stats?.totalUsers || 0} description="All users" icon={Users} />
          <StatsCard title="Artists" value={stats?.totalArtists || 0} description="Registered artists" icon={Users} />
          <StatsCard title="Companies" value={stats?.totalCompanies || 0} description="Registered companies" icon={FileText} />
          <StatsCard title="Music" value={stats?.totalMusic || 0} description="Total tracks" icon={Music} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Approvals Summary
            </CardTitle>
            <CardDescription>Pending items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pending Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.pendingProfiles || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pending Music</p>
                <p className="text-2xl font-bold">{(stats as any)?.pendingMusic || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Approved Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.approvedProfiles || 0}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Rejected Profiles</p>
                <p className="text-2xl font-bold">{(stats as any)?.rejectedProfiles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
