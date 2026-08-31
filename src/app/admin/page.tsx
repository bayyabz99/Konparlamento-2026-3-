'use client';

import React, { useState, useEffect } from 'react';
import {
  initialData,
  fetchApplicationsFromSupabase,
  fetchCommitteesFromSupabase,
  fetchPartiesFromSupabase,
  supabase,
} from '@/lib/supabase';
import Link from 'next/link';
import {
  FileCheck2,
  Users,
  Layers,
  ImageIcon,
  Clock,
  HelpCircle,
  Vote,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Flag,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState(initialData.applications);
  const [committees, setCommittees] = useState(initialData.committees);
  const [parties, setParties] = useState(initialData.parties);
  const [dbStatus, setDbStatus] = useState<'CHECKING' | 'ONLINE' | 'OFFLINE'>('CHECKING');
  const [dbMessage, setDbMessage] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Function to test Supabase DB connection live
  const testDatabaseConnection = async () => {
    setIsTesting(true);
    setDbStatus('CHECKING');
    setDbMessage('Supabase veritabanı sorgulanıyor...');

    if (!supabase) {
      setDbStatus('OFFLINE');
      setDbMessage(
        'NEXT_PUBLIC_SUPABASE_URL veya KEY çevre değişkenleri istemciye henüz yüklenmedi. Lütfen terminalde çalışan "npm run dev" sunucusunu durdurup yeniden başlatın.'
      );
      setIsTesting(false);
      return;
    }

    try {
      const startMs = Date.now();
      const { error } = await supabase
        .from('applications')
        .select('id')
        .limit(1);

      const elapsed = Date.now() - startMs;

      if (error) {
        setDbStatus('OFFLINE');
        if (error.code === '42P01') {
          setDbMessage(
            'Supabase projesine bağlantı kuruldu fakat tablolar henüz veritabanında oluşturulmamış! Lütfen Supabase SQL Editor sekmesinde "schema.sql" ve "seed.sql" betiklerini çalıştırın.'
          );
        } else {
          setDbMessage(`Veritabanı Yanıtı: ${error.message} (Hata Kodu: ${error.code})`);
        }
      } else {
        setDbStatus('ONLINE');
        setDbMessage(`Supabase PostgreSQL Veritabanı Aktif ve %100 Bağlı! (${elapsed}ms canlı yanıt süresi)`);
      }
    } catch (err: any) {
      setDbStatus('OFFLINE');
      setDbMessage(`Bağlantı Hatası: ${err?.message || 'Bilinmeyen ağ hatası.'}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Load real data from Supabase / Initial state on mount
  useEffect(() => {
    async function loadDashboardData() {
      testDatabaseConnection();

      try {
        const [appData, commData, partyData] = await Promise.all([
          fetchApplicationsFromSupabase(),
          fetchCommitteesFromSupabase(),
          fetchPartiesFromSupabase(),
        ]);

        if (appData && appData.length > 0) {
          setApplications(appData);
        }
        if (commData && commData.length > 0) {
          setCommittees(commData);
        }
        if (partyData && partyData.length > 0) {
          setParties(partyData);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      }
    }

    loadDashboardData();
  }, []);

  const pendingAppsCount = applications.filter((a) => a.status === 'BEKLEMEDE').length;
  const approvedUsersCount = applications.filter((a) => a.status === 'ONAYLANDI').length;
  const pendingPhotosCount = initialData.participantUploads.filter((p) => p.status === 'BEKLEMEDE').length;

  const stats = [
    { label: 'Toplam Başvuru', val: applications.length, badge: `${pendingAppsCount} Bekleyen`, href: '/admin/basvurular', icon: FileCheck2 },
    { label: 'Onaylı Kullanıcı', val: approvedUsersCount, badge: 'Aktif Katılımcı', href: '/admin/basvurular', icon: Users },
    { label: 'Komisyon Sayısı', val: committees.length, badge: `${committees.length} Aktif Komisyon`, href: '/admin/komisyonlar', icon: Layers },
    { label: 'Siyasi Partiler', val: parties.length, badge: `${parties.length} Meclis Grubu`, href: '/admin/partiler', icon: Flag },
    { label: 'Galeri Fotoğrafı', val: initialData.officialGallery.length + initialData.participantUploads.length, badge: 'Yayında', href: '/admin/galeri', icon: ImageIcon },
    { label: 'Bekleyen Görsel', val: pendingPhotosCount, badge: 'Moderasyon Bekliyor', href: '/admin/galeri', icon: Clock },
    { label: 'Bilmece Yanıtı', val: initialData.riddleAnswers.length, badge: 'Yanıt Verildi', href: '/admin/bilmeceler', icon: HelpCircle },
    { label: 'Aktif Oylama', val: initialData.polls.filter((p) => p.isActive).length, badge: 'Canlı Oylama', href: '/admin/oylamalar', icon: Vote },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            GENEL BAKIŞ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Konparlamento Admin Dashboard
          </h1>
        </div>

        {/* Database Live Connection Status Card */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              dbStatus === 'ONLINE'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/40'
                : dbStatus === 'OFFLINE'
                ? 'bg-red-950/80 border-red-500/50 text-red-300 shadow-lg shadow-red-950/40'
                : 'bg-zinc-900 border-zinc-800 text-amber-400'
            }`}
          >
            <Database className="w-4 h-4" />
            {dbStatus === 'CHECKING' ? (
              <span>Veritabanı Kontrol Ediliyor...</span>
            ) : dbStatus === 'ONLINE' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Supabase Veritabanı: BAĞLI (Online)
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Supabase: Bağlantı Yok (Mock Veri Modu)
              </span>
            )}
          </div>

          <button
            onClick={testDatabaseConnection}
            disabled={isTesting}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            title="Veritabanı bağlantısını yeniden test et"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Et</span>
          </button>
        </div>
      </div>

      {/* Connection Info Banner if any details */}
      {dbMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 ${
            dbStatus === 'ONLINE'
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
              : dbStatus === 'OFFLINE'
              ? 'bg-red-950/30 border-red-800/40 text-red-300'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          {dbStatus === 'ONLINE' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <p className="flex-1">{dbMessage}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <Link
              key={idx}
              href={st.href}
              className="glass-panel p-5 rounded-2xl border border-zinc-800 hover:border-red-600/40 transition flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950/60 border border-red-800/40 text-red-400 rounded-full">
                  {st.badge}
                </span>
                <div className="p-2 rounded-xl bg-zinc-900 text-red-500 border border-zinc-800 group-hover:bg-red-600 group-hover:text-white transition">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight">{st.val}</span>
                <h3 className="text-xs font-semibold text-zinc-400 mt-1">{st.label}</h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Applications & Pending Moderation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-red-500" /> Gerçek Başvurular ({applications.length})
            </h2>
            <Link href="/admin/basvurular" className="text-xs text-red-400 font-semibold hover:text-red-300">
              Tümünü Gör →
            </Link>
          </div>

          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Henüz başvuru bulunmuyor.</p>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">
                      {app.firstName} {app.lastName}
                    </h4>
                    <span className="text-zinc-400 block">{app.requestedRole}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      app.status === 'ONAYLANDI'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : app.status === 'REDDEDILDI'
                        ? 'bg-red-950 text-red-300 border border-red-500'
                        : 'bg-amber-950 text-amber-300 border border-amber-500'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Photos Moderation Queue */}
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" /> Moderasyon Bekleyen Görseller
            </h2>
            <Link href="/admin/galeri" className="text-xs text-red-400 font-semibold hover:text-red-300">
              Moderasyon Paneli →
            </Link>
          </div>

          <div className="space-y-3">
            {initialData.participantUploads.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Yüklü katılımcı fotoğrafı yok.</p>
            ) : (
              initialData.participantUploads.map((photo) => (
                <div
                  key={photo.id}
                  className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={photo.url}
                      alt={photo.userName}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-800"
                    />
                    <div>
                      <h4 className="font-bold text-white">{photo.userName}</h4>
                      <span className="text-[10px] text-zinc-400 block">{photo.uploadedAt}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      photo.status === 'ONAYLANDI'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : 'bg-amber-950 text-amber-300 border border-amber-500'
                    }`}
                  >
                    {photo.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
