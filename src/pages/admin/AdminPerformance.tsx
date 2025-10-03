import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/api';
import { LogSheet, ArtistWork } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff6b6b', '#4ecdc4'];

const AdminPerformance: React.FC = () => {
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const sheets = await adminAPI.getAllLogSheets().catch(() => []);
        setLogSheets(sheets);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load log sheets', variant: 'destructive' });
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

  // Aggregate data
  const { songCounts, artistCounts, companyCounts } = useMemo(() => {
    const songMap: Record<number, { title: string; count: number; track?: ArtistWork }> = {};
    const artistMap: Record<string, number> = {};
    const companyMap: Record<string, number> = {};

    for (const sheet of logSheets) {
      const companyName = sheet.company?.companyName || 'Unknown Company';
      for (const m of sheet.selectedMusic || []) {
        const id = (m as any).id;
        if (!id) continue;
        const title = (m as any).title || `Track ${id}`;
        const artistName = (m as any).user?.email || (m as any).artist || 'Unknown Artist';

        if (!songMap[id]) songMap[id] = { title, count: 0, track: m as any };
        songMap[id].count += 1;

        artistMap[artistName] = (artistMap[artistName] || 0) + 1;
        companyMap[companyName] = (companyMap[companyName] || 0) + 1;
      }
    }

    return {
      songCounts: Object.entries(songMap).map(([id, v]) => ({ id: parseInt(id), title: v.title, count: v.count })),
      artistCounts: Object.entries(artistMap).map(([artist, count]) => ({ artist, count })),
      companyCounts: Object.entries(companyMap).map(([company, count]) => ({ company, count })),
    } as any;
  }, [logSheets]);

  const topSongs = useMemo(() => songCounts.sort((a: any, b: any) => b.count - a.count).slice(0, 10), [songCounts]);
  const topArtists = useMemo(() => artistCounts.sort((a: any, b: any) => b.count - a.count).slice(0, 10), [artistCounts]);
  const topCompanies = useMemo(() => companyCounts.sort((a: any, b: any) => b.count - a.count).slice(0, 10), [companyCounts]);

  const pieDataSongs = useMemo(() => topSongs.map((s: any) => ({ name: s.title, value: s.count })), [topSongs]);
  const pieDataArtists = useMemo(() => topArtists.map((a: any) => ({ name: a.artist, value: a.count })), [topArtists]);
  const pieDataCompanies = useMemo(() => topCompanies.map((c: any) => ({ name: c.company, value: c.count })), [topCompanies]);

  const historicalData = useMemo(() => {
    const dataByMonth: Record<string, number> = {};

    for (const sheet of logSheets) {
      const date = new Date(sheet.createdDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const musicCount = sheet.selectedMusic?.length || 0;
      dataByMonth[monthKey] = (dataByMonth[monthKey] || 0) + musicCount;
    }

    return Object.entries(dataByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [logSheets]);

  return (
    <DashboardLayout title="Performance Overview">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance (Admin)</h1>
          <p className="text-muted-foreground">Aggregate track, artist and company performance across all log sheets</p>
        </div>

        {loading ? (
          <div className="h-48 bg-muted rounded animate-pulse" />
        ) : (
          <Tabs defaultValue="songs">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="songs">Top Songs</TabsTrigger>
              <TabsTrigger value="artists">Top Artists</TabsTrigger>
              <TabsTrigger value="companies">Top Companies</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Songs</CardTitle>
                </CardHeader>
                <CardContent>
                  {topSongs.length === 0 ? (
                    <p className="text-muted-foreground">No log sheet activity found.</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Top Songs by Selections</h4>
                          <div className="space-y-2">
                            {topSongs.map((s: any) => (
                              <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="text-sm">{s.title}</div>
                                <div className="font-semibold">{s.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold mb-2">Bar Chart</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topSongs.map((s: any) => ({ name: s.title, count: s.count }))} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#82ca9d" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-2">Distribution (Pie Chart)</h4>
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={pieDataSongs}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieDataSongs.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artists" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Artists (Bar Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topArtists.length === 0 ? (
                      <p className="text-muted-foreground">No artist activity</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topArtists.map((a: any) => ({ name: a.artist, count: a.count }))} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Artist Distribution (Pie Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topArtists.length === 0 ? (
                      <p className="text-muted-foreground">No artist activity</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieDataArtists}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieDataArtists.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="companies" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Companies (Bar Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topCompanies.length === 0 ? (
                      <p className="text-muted-foreground">No company activity</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCompanies.map((c: any) => ({ name: c.company, count: c.count }))} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Distribution (Pie Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topCompanies.length === 0 ? (
                      <p className="text-muted-foreground">No company activity</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieDataCompanies}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieDataCompanies.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalData.length === 0 ? (
                    <p className="text-muted-foreground">No historical data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={historicalData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Total Selections" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPerformance;
