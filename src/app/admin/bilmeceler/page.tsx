'use client';

import React, { useState, useEffect } from 'react';
import { initialData, saveRiddleToSupabase, fetchRiddlesFromSupabase, updateRiddleAnswerStatusInSupabase } from '@/lib/supabase';
import { useNotifications } from '@/context/NotificationContext';
import { HelpCircle, CheckCircle, XCircle, Clock, Plus, Send, X, Save, Sparkles, Check } from 'lucide-react';

export default function RiddlesAdminPage() {
  const { addNotification } = useNotifications();
  const [riddles, setRiddles] = useState(initialData.riddles);
  const [answers, setAnswers] = useState(initialData.riddleAnswers);

  // New Riddle Form Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [startAt, setStartAt] = useState(new Date().toISOString().substring(0, 10) + ' 00:00');
  const [endAt, setEndAt] = useState(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().substring(0, 10) + ' 23:59'
  );
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadRiddles() {
      const data = await fetchRiddlesFromSupabase();
      if (data && data.length > 0) {
        setRiddles(data);
      }
    }
    loadRiddles();
  }, []);

  const activeRiddle = riddles.find((r) => r.isActive) || riddles[0];

  const handlePublishRiddle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    // Deactivate previous riddles
    const updatedRiddles = riddles.map((r) => ({ ...r, isActive: false }));

    const newRiddle = {
      id: 'rid-' + Date.now(),
      question: newQuestion.trim(),
      isActive: true,
      startAt: startAt,
      endAt: endAt,
    };

    const finalRiddles = [newRiddle, ...updatedRiddles];
    setRiddles(finalRiddles);
    initialData.riddles = finalRiddles;

    await saveRiddleToSupabase(newRiddle);

    // Global notification to all users
    addNotification(
      'Yeni Bilmece Yayınlandı!',
      `" ${newQuestion.substring(0, 60)}... " Sorusunu yanıtlamak için Bilmece sayfasına göz atınız!`,
      'BILMECE_SONUC'
    );

    setSuccessMsg('Yeni bilmece başarıyla yayınlandı!');
    setTimeout(() => setSuccessMsg(''), 3500);
    setNewQuestion('');
    setShowPublishModal(false);
  };

  const handleToggleActive = (id: string) => {
    const updated = riddles.map((r) => ({
      ...r,
      isActive: r.id === id,
    }));
    setRiddles(updated);
    initialData.riddles = updated;
  };

  const handleMarkCorrect = async (id: string) => {
    const targetAns = answers.find((a) => a.id === id);
    if (!targetAns) return;

    const updated = answers.map((a) => (a.id === id ? { ...a, status: 'DOGRU' as const } : a));
    setAnswers(updated);
    initialData.riddleAnswers = updated;

    await updateRiddleAnswerStatusInSupabase(id, 'DOGRU');

    // Targeted notification only to this user
    addNotification(
      'Bilmece Tebriği!',
      `Tebrikler ${targetAns.userName}! Gönderdiğiniz bilmece cevabı DOĞRU kabul edilmiştir.`,
      'BILMECE_SONUC',
      targetAns.userId
    );
  };

  const handleMarkIncorrect = async (id: string) => {
    const targetAns = answers.find((a) => a.id === id);
    if (!targetAns) return;

    const updated = answers.map((a) => (a.id === id ? { ...a, status: 'YANLIS' as const } : a));
    setAnswers(updated);
    initialData.riddleAnswers = updated;

    await updateRiddleAnswerStatusInSupabase(id, 'YANLIS');

    // Targeted notification only to this user
    addNotification(
      'Bilmece Değerlendirmesi',
      `Sayın ${targetAns.userName}, verdiğiniz yanıt maalesef doğru kabul edilmemiştir.`,
      'BILMECE_SONUC',
      targetAns.userId
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            ETKİLEŞİM YÖNETİMİ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Bilmeceler ve Yanıt Değerlendirme
          </h1>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Bilmece Yayınla</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Riddle Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
            YAYINDAKİ AKTİF BİLMECE
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-bold">
            CANLI YAYINDA
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{activeRiddle?.question || 'Kayıtlı aktif bilmece bulunmamaktadır.'}"
        </h3>
        <div className="text-xs text-zinc-500 flex items-center gap-4 pt-1">
          <span>Başlangıç: {activeRiddle?.startAt}</span>
          <span>Bitiş: {activeRiddle?.endAt}</span>
        </div>
      </div>

      {/* Past Riddles List */}
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-4">
        <h3 className="font-bold text-white text-sm">Tüm Bilmeceler Listesi ({riddles.length})</h3>
        <div className="space-y-2">
          {riddles.map((r) => (
            <div
              key={r.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition ${
                r.isActive
                  ? 'bg-red-950/20 border-red-500/40 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="space-y-0.5 max-w-xl">
                <p className="font-medium text-white line-clamp-1">{r.question}</p>
                <span className="text-[10px] text-zinc-500">{r.startAt} — {r.endAt}</span>
              </div>
              <button
                onClick={() => handleToggleActive(r.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                  r.isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                {r.isActive ? 'Yayında' : 'Yayına Al'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Answers Table */}
      <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-white text-sm">Gelen Katılımcı Yanıtları ({answers.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Katılımcı</th>
                <th className="p-4">Verilen Cevap</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">Değerlendirme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {answers.map((ans) => (
                <tr key={ans.id} className="hover:bg-zinc-900/60 transition">
                  <td className="p-4 font-bold text-white">{ans.userName}</td>
                  <td className="p-4 font-mono font-medium text-red-400">{ans.answerText}</td>
                  <td className="p-4 text-zinc-500">{ans.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      ans.status === 'DOGRU'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : ans.status === 'YANLIS'
                        ? 'bg-red-950 text-red-300 border border-red-500'
                        : 'bg-amber-950 text-amber-300 border border-amber-500'
                    }`}>
                      {ans.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMarkCorrect(ans.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                      >
                        DOĞRU
                      </button>
                      <button
                        onClick={() => handleMarkIncorrect(ans.id)}
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold rounded-xl transition"
                      >
                        YANLIŞ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PUBLISH NEW RIDDLE MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
                  YENİ BİLMECE YAYINLA
                </span>
                <h2 className="text-xl font-bold text-white">Günün Sorusunu Oluştur</h2>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishRiddle} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-zinc-300">Bilmece / Soru Metni *</label>
                <textarea
                  rows={4}
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Örn: Bir parlamenter oturumda oy birliği ile kabul edilen ilk tasarı maddesi..."
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Başlangıç Zamanı</label>
                  <input
                    type="text"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Bitiş Zamanı</label>
                  <input
                    type="text"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-bold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Yayınla ve Duyur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
