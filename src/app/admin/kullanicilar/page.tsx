'use client';

import React, { useState, useEffect } from 'react';
import { initialData, fetchApplicationsFromSupabase } from '@/lib/supabase';
import { Users, Shield, Search, CheckCircle } from 'lucide-react';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const defaultAdmins = [
        { id: 'u-1', name: 'Muhammed Ali Kıtır', email: 'muhammed@konparlamento.org', role: 'SUPER_ADMIN', committee: 'Dışişleri Komisyonu' },
        { id: 'u-2', name: 'Ahmet Faruk Yılmaz', email: 'ahmet@konparlamento.org', role: 'YÖNETİCİ', committee: 'Dışişleri Komisyonu' },
        { id: 'u-3', name: 'Elif Nur Öztürk', email: 'elif@konparlamento.org', role: 'KOMİSYON_SORUMLUSU', committee: 'İnsan Hakları Komisyonu' },
        { id: 'u-4', name: 'Emre Can Sever', email: 'emre@konparlamento.org', role: 'İÇERİK_EDİTÖRÜ', committee: 'Medya Ekibi' },
      ];

      const apps = await fetchApplicationsFromSupabase();
      const approvedApps = apps.filter((a: any) => a.status === 'ONAYLANDI').map((a: any) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        role: 'KATILIMCI',
        committee: a.requestedRole
      }));

      // Combine admin team with approved applicants from Supabase
      setUsers([...defaultAdmins, ...approvedApps]);
    }

    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.committee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">
            YETKİLENDİRME & ROLLER
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Kullanıcı ve Rol Yönetimi ({users.length})
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kullanıcı ara..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-red-500"
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold border-b border-zinc-800">
              <tr>
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">E-Posta</th>
                <th className="p-4">Atanan Komisyon</th>
                <th className="p-4">Rol</th>
                <th className="p-4 text-right">Rol Değiştir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 text-xs">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-4 font-bold text-white">{u.name}</td>
                    <td className="p-4 text-zinc-400 font-mono">{u.email}</td>
                    <td className="p-4 font-medium text-red-400">{u.committee}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'SUPER_ADMIN' || u.role === 'YÖNETİCİ'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        defaultValue={u.role}
                        className="p-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white outline-none focus:border-red-500"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="YÖNETİCİ">YÖNETİCİ</option>
                        <option value="İÇERİK_EDİTÖRÜ">İÇERİK_EDİTÖRÜ</option>
                        <option value="KOMİSYON_SORUMLUSU">KOMİSYON_SORUMLUSU</option>
                        <option value="KATILIMCI">KATILIMCI</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
