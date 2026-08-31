'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLegalConsent } from '@/context/LegalConsentContext';
import { useNotifications } from '@/context/NotificationContext';
import { initialData, saveApplicationToSupabase } from '@/lib/supabase';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';

  const { hasConsented, setShowModal: openKvkkModal } = useLegalConsent();
  const { addNotification } = useNotifications();

  // Multi-step state: 1, 2, 3, 4, 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    grade: '',
    gender: 'Erkek',
    requestedRole: 'Dışişleri ve Uluslararası İlişkiler Komisyonu',
    requestedParty: 'Gelecek ve İnovasyon Partisi',
    motivation: '',
    pin: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.firstName.trim()) {
        setErrorMsg('Lütfen adınızı giriniz.');
        return false;
      }
      if (!formData.lastName.trim()) {
        setErrorMsg('Lütfen soyadınızı giriniz.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMsg('Lütfen geçerli bir e-posta adresi giriniz.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        setErrorMsg('Lütfen geçerli bir telefon numarası giriniz.');
        return false;
      }
    } else if (step === 3) {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 14 || ageNum > 35) {
        setErrorMsg('Lütfen 14-35 yaş aralığında geçerli bir yaş giriniz.');
        return false;
      }
      if (!formData.grade.trim()) {
        setErrorMsg('Lütfen okul/sınıf bilginizi belirtiniz.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.motivation.trim() || formData.motivation.length < 10) {
        setErrorMsg('Lütfen katılım amacınızı ve motivasyonunuzu en az birkaç cümle ile açıklayınız.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    if (!hasConsented) {
      openKvkkModal(true);
      setErrorMsg('Başvuru göndermek için önce KVKK Aydınlatma Metnini onaylamalısınız.');
      return;
    }

    if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
      setErrorMsg('Lütfen tam 6 haneli rakamlardan oluşan şifre/PIN belirleyiniz.');
      return;
    }

    setErrorMsg('');

    const newApp = {
      id: 'app-' + Date.now(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      age: parseInt(formData.age) || 18,
      grade: formData.grade.trim(),
      gender: formData.gender,
      motivation: formData.motivation.trim(),
      pin: formData.pin,
      requestedRole: formData.requestedRole,
      requestedParty: formData.requestedParty,
      status: 'BEKLEMEDE' as const,
      attended: false,
      attendedAt: null,
      createdAt: new Date().toISOString(),
    };

    // Save directly into Supabase database table applications
    await saveApplicationToSupabase(newApp);

    // Save to local applications state & localStorage
    initialData.applications.unshift(newApp);
    if (typeof window !== 'undefined') {
      try {
        const savedApps = JSON.parse(localStorage.getItem('kon_applications') || '[]');
        localStorage.setItem('kon_applications', JSON.stringify([newApp, ...savedApps]));
      } catch (e) {
        console.error(e);
      }
    }

    addNotification(
      'Başvurunuz Alındı!',
      'Başvurunuz başarıyla kayıt altına alınmıştır. Admin onayının ardından hesabınız aktifleşecektir.',
      'BASVURU_ONAY'
    );

    setSubmitted(true);
  };

  const stepTitles = [
    { num: 1, title: 'Ad & Soyad', icon: User },
    { num: 2, title: 'İletişim Bilgileri', icon: Mail },
    { num: 3, title: 'Eğitim & Yaş', icon: GraduationCap },
    { num: 4, title: 'Komisyon & Motivasyon', icon: Briefcase },
    { num: 5, title: 'Parola & Onay', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest px-3 py-1 bg-red-950/40 border border-red-900/40 rounded-full inline-block">
          ÖZEL KATILIMCI BAŞVURUSU
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Katılımcı Kayıt Formu
        </h1>
        <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
          Konparlamento 2026'ya katılmak için adım adım bilgilerinizi eksiksiz doldurunuz.
        </p>
        {inviteToken && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Davet Kodu Doğrulandı: <span className="font-mono font-bold">{inviteToken}</span>
          </div>
        )}
      </div>

      {submitted ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-red-900/40 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto border border-red-500/40">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">Başvurunuz Başarıyla Gönderildi!</h2>
          <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            Başvurunuz Supabase veritabanına kaydedildi ve <span className="font-bold text-red-400">BEKLEMEDE</span> durumuna alındı. Yönetim ekibi inceledikten sonra sonucunuz profil sayfanıza iletilecektir.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => router.push('/profil')}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 transition"
            >
              Profil Sayfama Git
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-zinc-800 space-y-8">
          {/* STEP PROGRESS WIZARD BAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span className="text-red-400 uppercase tracking-wider">
                Adım {currentStep} / {totalSteps}: {stepTitles[currentStep - 1].title}
              </span>
              <span className="font-mono">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Pills */}
            <div className="hidden sm:grid grid-cols-5 gap-2 pt-2">
              {stepTitles.map((st) => {
                const IconComp = st.icon;
                const isActive = st.num === currentStep;
                const isCompleted = st.num < currentStep;
                return (
                  <div
                    key={st.num}
                    onClick={() => {
                      if (st.num < currentStep) setCurrentStep(st.num);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-[11px] font-semibold text-center transition cursor-pointer ${
                      isActive
                        ? 'bg-red-950/60 border-red-500 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-500'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 mb-1 ${isActive ? 'text-red-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span className="truncate w-full">{st.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP FORM CONTENT */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: FIRST NAME & LAST NAME */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" /> Kişisel Kimlik Bilgileri
                  </h3>
                  <p className="text-zinc-400">Lütfen kimlik belgenizde yer alan adınızı ve soyadınızı giriniz.</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Adınız *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Örn: Ahmet"
                    className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Soyadınız *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Örn: Yılmaz"
                    className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: EMAIL & PHONE */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-500" /> İletişim Bilgileri
                  </h3>
                  <p className="text-zinc-400">Etkinlik onayları ve bilgilendirmeler bu kanallardan yapılacaktır.</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">E-Posta Adresi *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ahmet.yilmaz@gmail.com"
                      className="w-full pl-10 pr-3.5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Telefon Numarası *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+90 555 123 4567"
                      className="w-full pl-10 pr-3.5 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AGE, GRADE, GENDER */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-red-500" /> Demografik ve Eğitim Durumu
                  </h3>
                  <p className="text-zinc-400">Komisyon oturumu dengeleri için okul ve yaş bilgisi gereklidir.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-zinc-300">Yaşınız *</label>
                    <input
                      type="number"
                      required
                      min={14}
                      max={35}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="19"
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-zinc-300">Cinsiyet *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                    >
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                      <option value="Belirtmek İstemiyorum">Belirtmek İstemiyorum</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Okul / Sınıf Bilgisi *</label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="Örn: Selçuk Üniversitesi Hukuk Fakültesi 2. Sınıf"
                    className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: COMMISSION & MOTIVATION */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-red-500" /> Komisyon Tercihi ve Motivasyon
                  </h3>
                  <p className="text-zinc-400">Katılmak istediğiniz komisyonu seçip katılım amacınızı açıklayınız.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-semibold text-zinc-300">Tercih Edilen Komisyon *</label>
                    <select
                      value={formData.requestedRole}
                      onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value })}
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm font-medium"
                    >
                      {initialData.committees.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-zinc-300">Tercih Edilen Siyasi Parti *</label>
                    <select
                      value={formData.requestedParty}
                      onChange={(e) => setFormData({ ...formData, requestedParty: e.target.value })}
                      className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 text-sm font-medium"
                    >
                      {initialData.parties.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.acronym})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-zinc-300">Etkinliğe Neden Katılmak İstiyorsunuz? *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Parlamenter deneyim beklentilerinizi, geliştirmek istediğiniz yönleri ve bu alandaki ilgilerinizi detaylandırınız..."
                    className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-red-500 resize-none text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: SECURITY PIN & KVKK */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-500" /> Güvenlik Parolası ve Onay
                  </h3>
                  <p className="text-zinc-400">Hesabınıza giriş yaparken kullanacağınız 6 haneli PIN kodunu belirleyiniz.</p>
                </div>

                <div className="space-y-2 p-5 bg-red-950/20 border border-red-900/30 rounded-2xl text-center">
                  <label className="block font-bold text-white text-sm">6 Haneli Hesap Parolası / PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="******"
                    className="w-48 mx-auto p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-center tracking-widest text-2xl outline-none focus:border-red-500"
                  />
                  <span className="text-[11px] text-zinc-400 block pt-1">
                    Giriş yaparken telefon numaranız veya e-postanız ile birlikte bu PIN kodunu kullanacaksınız.
                  </span>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kvkk-check"
                    checked={hasConsented}
                    onChange={(e) => openKvkkModal(e.target.checked)}
                    className="mt-1 w-4 h-4 text-red-600 rounded border-zinc-700 focus:ring-red-500"
                  />
                  <label htmlFor="kvkk-check" className="text-zinc-300 text-xs leading-relaxed cursor-pointer">
                    <span className="font-bold text-white">KVKK Aydınlatma Metnini</span> ve <span className="font-bold text-white">Kullanım Koşullarını</span> okudum, kabul ediyorum.
                  </label>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-bold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Önceki Adım</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition ml-auto"
                >
                  <span>Sonraki Adım</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-xl shadow-red-950/60 flex items-center gap-2 transition ml-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Başvuruyu Tamamla ve Gönder</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-zinc-400 text-xs">Form Yükleniyor...</div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
