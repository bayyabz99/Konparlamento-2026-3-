'use client';

import React, { useState, useEffect, useRef } from 'react';
import { initialData, fetchApplicationsFromSupabase, markAttendanceInSupabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  UserCheck,
  UserX,
  Users,
  Camera,
  RefreshCw,
  Clock,
  Flag,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export default function AttendanceAdminPage() {
  const { addNotification } = useNotifications();
  const [applications, setApplications] = useState<any[]>(initialData.applications);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Scan feedback state: { type: 'success' | 'warning' | 'error', title, message, app }
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    app?: any;
    scannedAt?: string;
  } | null>(null);

  const html5QrCodeRef = useRef<any>(null);
  const isScanningRef = useRef<boolean>(false);

  // Fetch applications from Supabase
  const loadApplications = async () => {
    setIsLoading(true);
    const data = await fetchApplicationsFromSupabase();
    if (data && data.length > 0) {
      setApplications(data);
      initialData.applications = data;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (isScanningRef.current) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore stop errors
      } finally {
        html5QrCodeRef.current = null;
        isScanningRef.current = false;
      }
    }
  };

  // Enumerate cameras when component mounts or mode switches to 'camera'
  useEffect(() => {
    if (mode !== 'camera') return;

    let isMounted = true;
    async function loadCameraDevices() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const devices = await Html5Qrcode.getCameras();
        if (isMounted && devices && devices.length > 0) {
          setCameras(devices);
          // If no camera selected yet, find rear camera by label or fallback to last device
          if (!selectedCameraId) {
            const rearCam = devices.find((d) => {
              const lbl = (d.label || '').toLowerCase();
              return (
                lbl.includes('back') ||
                lbl.includes('rear') ||
                lbl.includes('environment') ||
                lbl.includes('arka') ||
                lbl.includes('0')
              );
            });
            const defaultCam = rearCam || devices[devices.length - 1] || devices[0];
            setSelectedCameraId(defaultCam.id);
          }
        }
      } catch (e) {
        console.warn('Could not enumerate cameras:', e);
      }
    }

    loadCameraDevices();

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // Initialize camera scanner using explicit selectedCameraId or environment facingMode constraint
  useEffect(() => {
    if (mode !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function initScanner() {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (!isMounted) return;

      await stopCamera();

      try {
        const qrCode = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = qrCode;

        // Target exact device ID if selected, otherwise environment facingMode
        const cameraTarget = selectedCameraId
          ? selectedCameraId
          : { facingMode: { exact: 'environment' } };

        await qrCode.start(
          cameraTarget,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (isMounted) onScanSuccess(decodedText);
          },
          () => {} // Silent scan failure
        );
        isScanningRef.current = true;
      } catch (err) {
        console.warn('Primary camera target failed, trying fallback camera constraint:', err);
        try {
          if (html5QrCodeRef.current && isMounted) {
            await html5QrCodeRef.current.start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (decodedText: string) => {
                if (isMounted) onScanSuccess(decodedText);
              },
              () => {}
            );
            isScanningRef.current = true;
          }
        } catch (fallbackErr) {
          console.error('Camera fallback failed:', fallbackErr);
        }
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [mode, selectedCameraId]);

  // Handle successful QR code scan
  const onScanSuccess = async (decodedText: string) => {
    let targetApp: any = null;

    // Try parsing decodedText as JSON payload
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && parsed.id) {
        targetApp = applications.find((a) => a.id === parsed.id || a.email === parsed.email);
      }
    } catch (e) {
      // Fallback string matching by ID, email, or phone
      targetApp = applications.find(
        (a) =>
          decodedText.includes(a.id) ||
          (a.email && decodedText.includes(a.email)) ||
          (a.pin && decodedText.includes(a.pin))
      );
    }

    if (!targetApp) {
      setScanResult({
        type: 'error',
        title: 'Geçersiz QR Bilet!',
        message: 'Okutulan QR kod sistemdeki kayıtlı bir delege bileti ile eşleşmedi.',
        scannedAt: new Date().toLocaleTimeString('tr-TR'),
      });
      return;
    }

    // Check if user is already attended
    if (targetApp.attended) {
      setScanResult({
        type: 'warning',
        title: 'Zaten Yoklama Yapıldı!',
        message: `Sayın ${targetApp.firstName} ${targetApp.lastName} daha önce saat ${
          targetApp.attendedAt ? new Date(targetApp.attendedAt).toLocaleTimeString('tr-TR') : ''
        } yoklamada katıldı olarak işaretlenmiş.`,
        app: targetApp,
        scannedAt: new Date().toLocaleTimeString('tr-TR'),
      });
      return;
    }

    // Mark attendance
    const timestamp = await markAttendanceInSupabase(targetApp.id, true);

    const updatedApps = applications.map((a) =>
      a.id === targetApp.id ? { ...a, attended: true, attendedAt: timestamp } : a
    );

    setApplications(updatedApps);
    initialData.applications = updatedApps;

    setScanResult({
      type: 'success',
      title: 'Yoklama Kaydı Başarılı!',
      message: `Sayın ${targetApp.firstName} ${targetApp.lastName} (${targetApp.requestedRole}) yoklamaya alındı.`,
      app: targetApp,
      scannedAt: new Date(timestamp).toLocaleTimeString('tr-TR'),
    });

    addNotification(
      'Yoklama Kaydı Yapıldı',
      `${targetApp.firstName} ${targetApp.lastName} etkinliğe katıldı olarak kaydedildi.`,
      'SISTEM'
    );
  };

  const onScanFailure = (error: any) => {
    // Silent background scanner errors
  };

  // Manual Check-in toggle
  const handleToggleAttendance = async (id: string, currentAttended: boolean) => {
    const targetApp = applications.find((a) => a.id === id);
    if (!targetApp) return;

    const newStatus = !currentAttended;
    const timestamp = await markAttendanceInSupabase(id, newStatus);

    const updatedApps = applications.map((a) =>
      a.id === id ? { ...a, attended: newStatus, attendedAt: newStatus ? timestamp : null } : a
    );

    setApplications(updatedApps);
    initialData.applications = updatedApps;

    if (newStatus) {
      setScanResult({
        type: 'success',
        title: 'Manuel Yoklama Alındı',
        message: `${targetApp.firstName} ${targetApp.lastName} katıldı olarak işaretlendi.`,
        app: targetApp,
        scannedAt: new Date(timestamp).toLocaleTimeString('tr-TR'),
      });
    }
  };

  const approvedApps = applications.filter((a) => a.status === 'ONAYLANDI' || a.status === 'approved');
  const attendedCount = approvedApps.filter((a) => a.attended).length;
  const pendingAttendanceCount = approvedApps.length - attendedCount;

  const filteredApps = approvedApps.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.firstName.toLowerCase().includes(term) ||
      app.lastName.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.phone.includes(term) ||
      (app.requestedRole && app.requestedRole.toLowerCase().includes(term)) ||
      (app.requestedParty && app.requestedParty.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            ETKİNLİK KATILIM MODÜLÜ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <QrCode className="w-8 h-8 text-red-500" /> QR Kameralı Yoklama Sistemi
          </h1>
        </div>

        <button
          onClick={loadApplications}
          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-xs flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Verileri Yenile</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Onaylı Toplam Delege</span>
            <span className="text-3xl font-extrabold text-white block">{approvedApps.length}</span>
          </div>
          <Users className="w-8 h-8 text-zinc-500" />
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Salonda / Katıldı</span>
            <span className="text-3xl font-extrabold text-emerald-400 block">{attendedCount}</span>
          </div>
          <UserCheck className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block">Giriş Yapması Beklenen</span>
            <span className="text-3xl font-extrabold text-amber-400 block">{pendingAttendanceCount}</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setMode('camera')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            mode === 'camera'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Kamera QR Okuyucu</span>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            mode === 'manual'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Manuel Arama & Liste ({approvedApps.length})</span>
        </button>
      </div>

      {/* SCANNER / FEEDBACK SECTION */}
      {mode === 'camera' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Real-time HTML5 Camera Scanner */}
          <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  CANLI KAMERA TARAYICI
                </span>
                <h3 className="text-sm font-bold text-white">Yaka Kartı QR Kodunu Gösteriniz</h3>
              </div>

              {cameras.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-xl text-xs font-bold outline-none focus:border-red-500 w-full sm:w-auto"
                  >
                    {cameras.map((cam, idx) => (
                      <option key={cam.id} value={cam.id}>
                        📷 {cam.label || `Kamera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Html5Qrcode Mount Target */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 overflow-hidden min-h-[300px]">
              <div id="qr-reader" className="w-full text-zinc-100 rounded-xl overflow-hidden" />
            </div>

            <p className="text-[11px] text-zinc-500">
              Cihaz kameranıza fiziksel yaka kartını yaklaştırdığınızda yoklama otomatik kaydedilir. Telefonunuzda birden fazla kamera varsa yukarıdaki menüden seçebilirsiniz.
            </p>
          </div>

          {/* Real-time Visual Scan Feedback Banner */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
              <h3 className="font-bold text-white text-sm border-b border-zinc-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" /> Yoklama Sonuç Ekranı
              </h3>

              {!scanResult ? (
                <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
                  <QrCode className="w-12 h-12 text-zinc-700 mx-auto animate-pulse" />
                  <p>QR Kod Okunması Bekleniyor...</p>
                </div>
              ) : (
                <div
                  className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${
                    scanResult.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                      : scanResult.type === 'warning'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-100'
                      : 'bg-red-950/60 border-red-500 text-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scanResult.type === 'success' && <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />}
                    {scanResult.type === 'warning' && <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />}
                    {scanResult.type === 'error' && <XCircle className="w-8 h-8 text-red-400 shrink-0" />}
                    <div>
                      <h4 className="font-extrabold text-base">{scanResult.title}</h4>
                      <span className="text-[10px] font-mono opacity-80">Saat: {scanResult.scannedAt}</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed font-medium">{scanResult.message}</p>

                  {scanResult.app && (
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 flex items-center gap-4 text-xs">
                      <div className="w-12 h-12 rounded-full bg-red-600/30 text-white font-bold flex items-center justify-center text-base shrink-0">
                        {scanResult.app.firstName?.[0] || 'D'}
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-white block truncate text-sm">
                          {scanResult.app.firstName} {scanResult.app.lastName}
                        </span>
                        <span className="text-red-400 block font-semibold">{scanResult.app.requestedRole}</span>
                        <span className="text-zinc-400 text-[11px] block">{scanResult.app.requestedParty}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Recent Checks Table */}
            <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-white block">Son Giriş Yapan Delegeler</span>
              <div className="space-y-2">
                {approvedApps
                  .filter((a) => a.attended)
                  .slice(0, 5)
                  .map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">{app.firstName} {app.lastName}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {app.attendedAt ? new Date(app.attendedAt).toLocaleTimeString('tr-TR') : 'Katıldı'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SEARCH & BACKUP LIST SECTION */}
      {mode === 'manual' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-bold text-white text-base">Manuel Katılım Listesi ve Arama</h3>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İsim, komisyon veya parti ara..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
                <tr>
                  <th className="p-4">Katılımcı Delege</th>
                  <th className="p-4">İletişim</th>
                  <th className="p-4">Parti & Komisyon</th>
                  <th className="p-4">Yoklama Durumu</th>
                  <th className="p-4 text-right">Manuel İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 text-xs">
                      Aramaya uygun onaylı delege kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-900/60 transition">
                      <td className="p-4 font-bold text-white">
                        {app.firstName} {app.lastName}
                        <span className="block text-[10px] text-zinc-500 font-normal">{app.email}</span>
                      </td>
                      <td className="p-4 text-zinc-400">{app.phone}</td>
                      <td className="p-4">
                        <span className="text-red-400 font-semibold block">{app.requestedRole}</span>
                        <span className="text-[10px] text-zinc-400">{app.requestedParty}</span>
                      </td>
                      <td className="p-4">
                        {app.attended ? (
                          <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[10px] rounded-full flex items-center gap-1 w-fit">
                            <UserCheck className="w-3 h-3" /> Katıldı (
                            {app.attendedAt ? new Date(app.attendedAt).toLocaleTimeString('tr-TR') : ''})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 font-bold text-[10px] rounded-full flex items-center gap-1 w-fit">
                            <UserX className="w-3 h-3" /> Bekleniyor
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleAttendance(app.id, app.attended)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                            app.attended
                              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          }`}
                        >
                          {app.attended ? 'Yoklamayı İptal Et' : 'Katıldı İşaretle'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
