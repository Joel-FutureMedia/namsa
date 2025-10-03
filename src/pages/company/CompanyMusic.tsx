import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { Play, Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyMusic: React.FC = () => {
  const [music, setMusic] = useState<ArtistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMusic = async () => {
      try {
        setLoading(true);
        const data = await companyAPI.getApprovedMusic();
        setMusic(data);
      } catch (error) {
        console.error('Failed to load music:', error);
        toast({
          title: "Error",
          description: "Failed to load music library",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMusic();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music') {
          loadMusic();
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [toast]);

  const columns: Column<ArtistWork>[] = [
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      className: 'font-medium',
    },
    {
      key: 'artist',
      header: 'Artist',
      accessor: 'artist',
    },
    {
      key: 'artistWorkType',
      header: 'Genre',
      accessor: (item) => item.artistWorkType?.workTypeName || '-',
    },
    {
      key: 'albumName',
      header: 'Album',
      accessor: 'albumName',
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: 'duration',
      render: (value) => value || 'N/A',
    },
    {
      key: 'uploadedDate',
      header: 'Release Date',
      accessor: 'uploadedDate',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'isrcCode',
      header: 'ISRC',
      accessor: 'isrcCode',
      render: (value) => value || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant="default" className="bg-namsa-success text-white">
          {value?.statusName || 'Approved'}
        </Badge>
      ),
    },
  ];

  const actions: Action<ArtistWork>[] = [
    {
      label: 'Play',
      icon: Play,
      onClick: (music) => {
        if (music.fileUrl) {
          const audio = new Audio(music.fileUrl);
          audio.play().catch(console.error);
        } else {
          toast({
            title: "Audio Not Available",
            description: "No audio file available for this track",
            variant: "destructive",
          });
        }
      },
    },
    {
      label: 'Download',
      icon: Download,
      onClick: (music) => {
        if (music.fileUrl) {
          const link = document.createElement('a');
          link.href = music.fileUrl;
          link.download = `${music.title}.${music.fileType || 'mp3'}`;
          link.click();
        } else {
          toast({
            title: "Download Not Available",
            description: "No audio file available for download",
            variant: "destructive",
          });
        }
      },
    },
  ];

  return (
    <DashboardLayout title="Music Library">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Music Library</h1>
            <p className="text-muted-foreground">
              Browse and manage approved music tracks
            </p>
          </div>
          <Button onClick={() => navigate('/company/logsheet/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Log Sheet
          </Button>
        </div>

        <DataTable
          data={music}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable={true}
          emptyMessage="No approved music available"
        />
      </div>
    </DashboardLayout>
  );
};

export default CompanyMusic;
