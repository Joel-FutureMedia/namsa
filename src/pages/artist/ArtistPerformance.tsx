import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { artistAPI, companyAPI } from '@/services/api';
import { ArtistWork, LogSheet } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const ArtistPerformance: React.FC = () => {
  const [tracks, setTracks] = useState<ArtistWork[]>([]);
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [myTracks, sheets] = await Promise.all([
          artistAPI.getMyMusic().catch(() => []),
          companyAPI.getLogSheets().catch(() => []),
        ]);
        setTracks(myTracks);
        setLogSheets(sheets);
        if (myTracks.length > 0) setSelectedTrackId(myTracks[0].id);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load performance data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music' || payload?.type === 'profile') {
          load();
          toast({ title: 'Performance Data Updated' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [toast]);

  const performanceByTrack = useMemo(() => {
    // Map trackId -> { total: number, companies: Record<companyName, number> }
    const map: Record<number, { total: number; companies: Record<string, number>; track?: ArtistWork }> = {};
    for (const t of tracks) {
      map[t.id] = { total: 0, companies: {}, track: t };
    }

    for (const sheet of logSheets) {
      const companyName = sheet.company?.companyName || 'Unknown Company';
      for (const m of sheet.selectedMusic || []) {
        const mid = (m as any).id;
        if (!mid) continue;
        if (!map[mid]) {
          // If it's not in the artist's tracks, skip
          continue;
        }
        map[mid].total += 1;
        map[mid].companies[companyName] = (map[mid].companies[companyName] || 0) + 1;
      }
    }
    return map;
  }, [tracks, logSheets]);

  const selectedPerformance = selectedTrackId ? performanceByTrack[selectedTrackId] : null;

  const chartData = useMemo(() => {
    if (!selectedPerformance) return [] as { company: string; count: number }[];
    return Object.entries(selectedPerformance.companies).map(([company, count]) => ({ company, count }));
  }, [selectedPerformance]);

  return (
    <DashboardLayout title="Performance">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">How your tracks are being selected/played by companies (based on LogSheets)</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Track Selection Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 bg-muted rounded animate-pulse"></div>
            ) : tracks.length === 0 ? (
              <p className="text-muted-foreground">You have no uploaded tracks yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="w-64">
                  <Select value={selectedTrackId?.toString() || ''} onValueChange={(v) => setSelectedTrackId(v ? parseInt(v) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold">Overview</h3>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Selected Track: {selectedPerformance?.track?.title || 'N/A'}</p>
                      <p className="text-xl font-semibold mt-2">Total Selections: {selectedPerformance?.total || 0}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Companies</h4>
                      {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No companies have selected this track yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {chartData.map((c) => (
                            <div key={c.company} className="flex items-center justify-between p-2 border rounded">
                              <div className="text-sm">{c.company}</div>
                              <div className="font-semibold">{c.count}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Companies Chart</h3>
                    <div style={{ width: '100%', height: 300 }} className="mt-2">
                      {chartData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data to display</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="company" angle={-45} textAnchor="end" interval={0} height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArtistPerformance;
