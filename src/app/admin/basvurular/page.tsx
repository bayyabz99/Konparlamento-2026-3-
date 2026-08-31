'use client';

import React, { useState, useEffect } from 'react';
import { initialData, fetchApplicationsFromSupabase, updateApplicationStatusInSupabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import { syncApplicationToGoogleSheets } from '@/lib/googleSheets';
import { generateQrCodeDataUrl, getUserQrPayload } from '@/lib/qrCode';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  X,
  Eye,
  Trash2,
  Filter,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  FileText,
  ShieldCheck,
  QrCode as QrIcon,
  Download,
  Printer,
  Flag,
} from 'lucide-react';

export default function ApplicationsAdminPage() {
  const { addNotification } = useNotifications();
  const [applications, setApplications] = useState(initialData.applications);
  const [filterStatus, setFilterStatus] = useState<string>('TÜMÜ');
  const [filterRole, setFilterRole] = useState<string>('TÜMÜ');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rejection reason modal state
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Detailed Applicant Inspection Modal state
  const [inspectingApp, setInspectingApp] = useState<any | null>(null);
  const [inspectingQrUrl, setInspectingQrUrl] = useState<string>('');

  useEffect(() => {
    if (inspectingApp) {
      const payload = getUserQrPayload(inspectingApp);
      generateQrCodeDataUrl(payload).then((url) => setInspectingQrUrl(url));
    } else {
      setInspectingQrUrl('');
    }
  }, [inspectingApp]);

  // Fetch applications from Supabase on mount
  useEffect(() => {
    async function loadApps() {
      setIsLoading(true);
      const data = await fetchApplicationsFromSupabase();
      if (data && data.length > 0) {
        setApplications(data);
        initialData.applications = data;
      }
      setIsLoading(false);
    }
    loadApps();
  }, []);

  const handleApprove = async (id: string) => {
    const targetApp = applications.find((a) => a.id === id);
    if (!targetApp) return;

    const updated = applications.map((a) => (a.id === id ? { ...a, status: 'ONAYLANDI' as const } : a));
    setApplications(updated);
    initialData.applications = updated;

    await updateApplicationStatusInSupabase(id, 'ONAYLANDI');

    addNotification(
      'Başvurunuz Onaylandı!',
      `Tebrikler Sayın ${targetApp.firstName} ${targetApp.lastName}! Konparlamento 2026 başvurunuz onaylanmıştır.`,
      'BASVURU_ONAY',
      targetApp.id
    );

    // Auto-sync to Google Sheets
    await syncApplicationToGoogleSheets({
      id: targetApp.id,
      first_name: targetApp.firstName,
      last_name: targetApp.lastName,
      email: targetApp.email,
      phone: targetApp.phone,
      age: targetApp.age,
      grade: targetApp.grade,
      gender: targetApp.gender,
      requested_role: targetApp.requestedRole,
      created_at: targetApp.createdAt,
    });
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId) return;

    const targetApp = applications.find((a) => a.id === rejectingAppId);
    if (!targetApp) return;

    const updated = applications.map((a) =>
      a.id === rejectingAppId ? { ...a, status: 'REDDEDILDI' as const, rejectionReason } : a
    );

    setApplications(updated);
    initialData.applications = updated;

    await updateApplicationStatusInSupabase(rejectingAppId, 'REDDEDILDI', rejectionReason);

    addNotification(
      'Başvuru Durumu Güncellendi',
      `Sayın ${targetApp.firstName} ${targetApp.lastName}, başvurunuz maalesef onaylanmamıştır. Neden: ${rejectionReason || 'Kontenjan doluluğu.'}`,
      'BASVURU_RED',
      rejectingAppId
    );

    setRejectingAppId(null);
    setRejectionReason('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu başvuru kaydını kalıcı olarak silmek istediğinizden emin misiniz?')) {
      const updated = applications.filter((a) => a.id !== id);
      setApplications(updated);
      initialData.applications = updated;
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'TÜMÜ' || app.status === filterStatus;
    const matchesRole = filterRole === 'TÜMÜ' || app.requestedRole === filterRole;
    const matchesSearch =
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);
    return matchesStatus && matchesRole && matchesSearch;
  });

  const countApproved = applications.filter((a) => a.status === 'ONAYLANDI').length;
  const countPending = applications.filter((a) => a.status === 'BEKLEMEDE').length;
  const countRejected = applications.filter((a) => a.status === 'REDDEDILDI').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            SUPABASE BAŞVURU YÖNETİMİ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Katılımcı Başvuruları ({applications.length})
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Bekleyen Başvurular</span>
            <span className="text-3xl font-extrabold text-amber-400 block">{countPending}</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Onaylanan Başvurular</span>
            <span className="text-3xl font-extrabold text-emerald-400 block">{countApproved}</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Reddedilen Başvurular</span>
            <span className="text-3xl font-extrabold text-red-400 block">{countRejected}</span>
          </div>
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['TÜMÜ', 'BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition ${
                filterStatus === st
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500"
          >
            <option value="TÜMÜ">Tüm Komisyonlar</option>
            {initialData.committees.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim, e-posta veya telefon ara..."
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Katılımcı</th>
                <th className="p-4">İletişim</th>
                <th className="p-4">Tercih Edilen Komisyon</th>
                <th className="p-4">Motivasyon Notu</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">
                    Kayıtlı başvuru bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-4">
                      <span className="font-bold text-white block text-sm">{app.firstName} {app.lastName}</span>
                      <span className="text-[10px] text-zinc-400">{app.age} Yaş / {app.grade}</span>
                    </td>
                    <td className="p-4">
                      <span className="block text-zinc-300 font-medium">{app.email}</span>
                      <span className="text-zinc-500 text-[11px]">{app.phone}</span>
                    </td>
                    <td className="p-4 font-semibold text-red-400">{app.requestedRole}</td>
                    <td className="p-4 max-w-xs text-zinc-400 truncate">{app.motivation}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        app.status === 'ONAYLANDI'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                          : app.status === 'REDDEDILDI'
                          ? 'bg-red-950 text-red-300 border border-red-500'
                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Detail View Button */}
                        <button
                          onClick={() => setInspectingApp(app)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 transition"
                          title="Detaylı İncele"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve */}
                        {app.status !== 'ONAYLANDI' && (
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs"
                          >
                            ONAYLA
                          </button>
                        )}

                        {/* Reject */}
                        {app.status !== 'REDDEDILDI' && (
                          <button
                            onClick={() => setRejectingAppId(app.id)}
                            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold rounded-xl transition text-xs"
                          >
                            REDDET
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED APPLICANT INSPECTION MODAL */}
      {inspectingApp && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  DETAYLI BAŞVURU İNCELEME
                </span>
                <h2 className="text-xl font-bold text-white">
                  {inspectingApp.firstName} {inspectingApp.lastName}
                </h2>
              </div>
              <button
                onClick={() => setInspectingApp(null)}
                className="p-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-500" /> Ad Soyad & Cinsiyet
                </span>
                <p className="text-white font-bold text-sm">
                  {inspectingApp.firstName} {inspectingApp.lastName} ({inspectingApp.gender})
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-red-500" /> Yaş & Eğitim Durumu
                </span>
                <p className="text-white font-bold text-sm">
                  {inspectingApp.age} Yaş — {inspectingApp.grade}
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-500" /> E-Posta Adresi
                </span>
                <p className="text-white font-mono">{inspectingApp.email}</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-500" /> Telefon Numarası
                </span>
                <p className="text-white font-mono">{inspectingApp.phone}</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 sm:col-span-2">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-red-500" /> Tercih Edilen Komisyon
                </span>
                <p className="text-red-400 font-bold text-sm">{inspectingApp.requestedRole}</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1 sm:col-span-2">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-500" /> Motivasyon Notu & Katılım Amacı
                </span>
                <p className="text-zinc-200 leading-relaxed pt-1">{inspectingApp.motivation}</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Giriş PIN Kodu
                </span>
                <p className="text-emerald-400 font-mono font-bold text-sm">{inspectingApp.pin || '******'}</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-zinc-400 block font-semibold">Başvuru Durumu</span>
                <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                  inspectingApp.status === 'ONAYLANDI'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : inspectingApp.status === 'REDDEDILDI'
                    ? 'bg-red-950 text-red-300 border border-red-500'
                    : 'bg-amber-950 text-amber-300 border border-amber-500'
                }`}>
                  {inspectingApp.status}
                </span>
              </div>
            </div>

            {/* QR Code & Badge Section */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <span className="text-zinc-400 font-semibold text-xs flex items-center gap-1.5">
                <QrIcon className="w-4 h-4 text-red-500" /> Katılımcı QR Yaka Kartı & Bilet Kodları
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {inspectingQrUrl ? (
                  <img src={inspectingQrUrl} alt="QR Kod" className="w-28 h-28 bg-white p-2 rounded-xl border border-zinc-700" />
                ) : (
                  <div className="w-28 h-28 bg-zinc-900 rounded-xl flex items-center justify-center text-[10px] text-zinc-500">
                    QR Hazırlanıyor...
                  </div>
                )}

                <div className="space-y-1 text-xs text-center sm:text-left flex-1">
                  <p className="font-bold text-white text-sm">{inspectingApp.firstName} {inspectingApp.lastName}</p>
                  <span className="text-zinc-400 block">{inspectingApp.requestedParty || 'Gelecek ve İnovasyon Partisi'}</span>
                  <span className="text-red-400 font-semibold block">{inspectingApp.requestedRole}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!inspectingQrUrl) return;
                      const a = document.createElement('a');
                      a.href = inspectingQrUrl;
                      a.download = `YakaKarti-${inspectingApp.firstName}-${inspectingApp.lastName}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="mt-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yaka Kartı QR Kodunu İndir (PNG)</span>
                  </button>
                </div>
              </div>
            </div>

            {inspectingApp.rejectionReason && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl space-y-1 text-xs">
                <span className="text-red-400 font-bold block">Reddedilme Nedeni:</span>
                <p className="text-zinc-300">{inspectingApp.rejectionReason}</p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              {inspectingApp.status !== 'ONAYLANDI' && (
                <button
                  onClick={() => {
                    handleApprove(inspectingApp.id);
                    setInspectingApp(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Başvuruyu Onayla
                </button>
              )}

              {inspectingApp.status !== 'REDDEDILDI' && (
                <button
                  onClick={() => {
                    setRejectingAppId(inspectingApp.id);
                    setInspectingApp(null);
                  }}
                  className="px-5 py-2.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs rounded-xl transition"
                >
                  Başvuruyu Reddet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Başvuru Reddetme Sebebi</h3>
              <button onClick={() => setRejectingAppId(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Neden / Açıklama</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Örn: Yaş sınırı uyumsuzluğu veya kontenjan doluluğu."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl shadow-lg shadow-red-900/40"
              >
                Reddi Onayla ve Bildirim Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
