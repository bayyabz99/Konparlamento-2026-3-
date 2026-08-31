-- ========================================================
-- KONPARLAMENTO 2026 DATABASE SEED DATA (SUPABASE POSTGRESQL)
-- ========================================================

-- 1. SITE SETTINGS SEED
INSERT INTO site_settings (key, value) VALUES
  ('contactEmail', 'info@konparlamento.org'),
  ('contactPhone', '+90 555 123 4567'),
  ('instagramUrl', 'https://instagram.com/konparlamento'),
  ('location', 'Ahmet Keleşeoğlu Kültür Merkezi'),
  ('googleMapsEmbed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.9634914041285!2d32.4833!3d37.9167!2m2!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU1JzAwLjEiTiAzMsKwMjknMDAuMCJF!5e0!3m2!1str!2str!4v1600000000000!5m2!1str!2str'),
  ('previousEventUrl', 'https://2025.konparlamento.org'),
  ('countdownDate', '2026-04-15T09:00:00')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. COMMITTEES SEED
INSERT INTO committees (id, title, slug, short_description, detailed_description, purpose, workflow, duties, rules, chair_person, vice_chair_person, images, order_num) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Dışişleri ve Uluslararası İlişkiler Komisyonu',
  'disisleri-komisyonu',
  'Küresel krizler, uluslararası anlaşmalar ve diplomatik stratejilerin ele alındığı prestijli komisyon.',
  'Dışişleri Komisyonu, katılımcıların küresel diplomasi ilkelerini deneyimlemelerini sağlayan dinamik bir platformdur. Uluslararası kriz yönetimi, ikili ilişkiler ve küresel barış tasarıları detaylıca işlenir.',
  'Katılımcılara yüksek seviyede müzakere, kriz yönetimi ve diplomatik yazışma yetkinliği kazandırmak.',
  'Haftalık tasarı oturumları, kriz bildirimleri ve oy birliği arayışı ile ilerleyen parlamenter yapı.',
  'Uluslararası tasarı hazırlamak, yabancı delegasyon temsilcileri ile ikili görüşmeler yapmak ve karar taslağı sunmak.',
  'Parlamento iç tüzüğü geçerlidir. Söz almadan konuşmak ve kişisel itirazlarda bulunmak yasaktır.',
  'Ahmet Faruk Yılmaz',
  'Zeynep Sude Demir',
  '["https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  1
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'İnsan Hakları ve Hukuk Komisyonu',
  'insan-haklari-komisyonu',
  'Temel hak ve hürriyetlerin korunması, adalet mekanizmaları ve anayasal ilkelerin tartışıldığı alan.',
  'İnsan Hakları ve Hukuk Komisyonu, toplumsal adalet ve bireysel özgürlüklerin parlamenter çerçevede masaya yatırıldığı ana komisyonlardan biridir.',
  'Hukuk bilincini artırmak ve evrensel insan hakları standartlarını mevzuata yansıtma becerisi kazandırmak.',
  'Taslak madde incelemeleri, muhalefet ve iktidar şerhleri ile ilerleyen madde bazlı oylamalar.',
  'Hak ihlali raporları hazırlamak, yasa tasarılarının anayasaya uygunluğunu denetlemek.',
  'Saygılı dil kullanımı zorunludur. Hukuki terimlerin doğru kullanımı esastır.',
  'Elif Nur Öztürk',
  'Burak Can Arslan',
  '["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  2
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'Ekonomi, Sanayi ve Kalkınma Komisyonu',
  'ekonomi-komisyonu',
  'Sürdürülebilir büyüme, dijital finans, girişimcilik ve makroekonomik politikaların üretildiği merkez.',
  'Küresel ekonomik dalgalanmalar, yeşil dönüşüm ve teknolojik sanayi hamleleri bu komisyonda değerlendirilir.',
  'Katılımcılara bütçe yönetimi, stratejik yatırım ve kaynak tahsisi analiz yeteneği kazandırmak.',
  'Bütçe müzakereleri ve ekonomi paketlerinin parlamentoya sunulması.',
  'Ekonomik eylem planı tasarlamak ve teşvik paketlerini oylamak.',
  'Veri odaklı argüman sunumu zorunludur.',
  'Mustafa Kemal Şahin',
  'Seda Aksoy',
  '["https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  3
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'Çevre, İklim ve Yenilenebilir Enerji Komisyonu',
  'cevre-komisyonu',
  'Sıfır atık, karbonsuzlaşma ve temiz enerji dönüşümü konularında gelecek vizyonu oluşturan komisyon.',
  'Dünyamızın en kritik meselesi olan iklim değişikliği ve ekolojik denge Politikaları tartışılır.',
  'Sürdürülebilirlik bilincini yasama süreçlerine dahil etmek.',
  'Çevresel etki değerlendirme raporları ve yeşil yasa tasarıları.',
  'İklim eylem kanunu hazırlamak.',
  'Bilimsel verilere dayalı müzakere yürütülmesi esastır.',
  'Ceren Yılmaz',
  'Kaan Tekin',
  '["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  4
)
ON CONFLICT (slug) DO NOTHING;

-- 3. TEAM MEMBERS SEED
INSERT INTO team_members (first_name, last_name, role_title, category, avatar_url, order_num) VALUES
  ('Muhammed Ali', 'Kıtır', 'Gençlik Koordinatörü & Lead Developer', 'Yönetim', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 1),
  ('Ayşe Betül', 'Yılmaz', 'Organizasyon Komitesi Başkanı', 'Organizasyon', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 2),
  ('Emre Can', 'Sever', 'Medya ve Basın Sorumlusu', 'Medya', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 3),
  ('Merve', 'Çelik', 'Lojistik ve Katılımcı İlişkileri', 'Teknik Ekip', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 4),
  ('Oğuzhan', 'Demirel', 'Komisyonlar Genel Direktörü', 'Komisyon Yönetimi', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 5)
ON CONFLICT DO NOTHING;

-- 4. SPONSORS SEED
INSERT INTO sponsors (name, logo_url, sponsor_type, website_url, order_num, is_supporter) VALUES
  ('Hostinger Turkey', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300', 'Ana Sponsor', 'https://hostinger.web.tr', 1, false),
  ('Supabase', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300', 'Platin Sponsor', 'https://supabase.com', 2, false),
  ('Konya Büyükşehir Belediyesi', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300', 'Kurumsal Destekçi', 'https://konya.bel.tr', 3, true),
  ('Ahmet Keleşeoğlu Kültür Merkezi', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300', 'Gençlik Partneri', 'https://selcuklugenc.com', 4, true)
ON CONFLICT DO NOTHING;

-- 5. PROGRAM DAYS & EVENTS SEED
INSERT INTO program_days (day_number, title) VALUES
  (1, '1. GÜN — Açılış ve Komisyon Kayıtları'),
  (2, '2. GÜN — Tasarı Oturumları ve Müzakereler'),
  (3, '3. GÜN — Oylamalar ve Karar Taslakları'),
  (4, '4. GÜN — Kapanış ve Ödül Töreni')
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO program_events (day_number, time_slot, title, description, location, order_num) VALUES
  (1, '09:00 - 10:00', 'Katılımcı Kayıt ve Karşılama', 'Ahmet Keleşeoğlu Kültür Merkezi ana salonda yaka kartı ve kit dağıtımı.', 'Ana Fuaye', 1),
  (1, '10:00 - 11:30', 'Resmi Açılış Seremonisi', 'Protokol konuşmaları, Konparlamento 2026 tanıtım filmi ve açılış duyuruları.', 'Ana Salon', 2),
  (1, '11:30 - 13:00', '1. Komisyon Oturumu', 'Komisyon içi tanışma, iç tüzük bilgilendirmesi ve gündem maddelerinin seçimi.', 'Komisyon Salonları', 3),
  (1, '13:00 - 14:00', 'Öğle Arası ve Ağ Kurma (Networking)', 'Ana yemek salonunda katılımcı ikramları.', 'Yemekhane', 4),
  (1, '14:00 - 17:30', '2. Komisyon Oturumu', 'Yasa tasarılarının ilk maddelerinin tartışılması.', 'Komisyon Salonları', 5),

  (2, '09:30 - 12:30', '3. Komisyon Oturumu', 'Komisyon değişiklik önergelerinin (amendments) verilmesi.', 'Komisyon Salonları', 1),
  (2, '12:30 - 13:30', 'Öğle Arası', 'Serbest zaman ve sergi alanı gezisi.', 'Yemekhane', 2),
  (2, '13:30 - 17:00', '4. Komisyon Oturumu & Kriz Senaryosu', 'Beklenmedik küresel kriz senaryosunun komisyonlara tebliğ edilmesi.', 'Komisyon Salonları', 3),

  (3, '09:30 - 12:30', '5. Komisyon Oturumu', 'Nihai karar metinlerinin kaleme alınması.', 'Komisyon Salonları', 1),
  (3, '12:30 - 13:30', 'Öğle Arası', 'İkram servisi ve sosyal aktivite.', 'Yemekhane', 2),
  (3, '13:30 - 17:00', 'Genel Kurul Oturumu', 'Tüm komisyon kararlarının Genel Kurul''a sunulması ve oylanması.', 'Ana Salon', 3),

  (4, '10:00 - 12:30', 'Genel Kurul Kapanış Oylamaları', 'Son bildirge metninin kabulü.', 'Ana Salon', 1),
  (4, '12:30 - 14:00', 'Kapanış Resepsiyonu', 'Katılımcı ve ekip yemeği.', 'Yemekhane', 2),
  (4, '14:00 - 16:30', 'Ödül Töreni ve Sertifika Dağıtımı', 'En iyi delege, mansiyon ve teşekkür belgelerinin takdimi.', 'Ana Salon', 3)
ON CONFLICT DO NOTHING;

-- 6. PARTIES SEED
INSERT INTO parties (name, acronym, color, logo_url, description, ideology, leader, member_count, seats, order_num) VALUES
  (
    'Gelecek ve İnovasyon Partisi',
    'GİP',
    '#dc2626',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
    'Dijital dönüşüm, yeşil kalkınma ve gençlik odaklı sosyal politikaları savunan merkez parlamenter grup.',
    'Sosyal İnovasyon & Dijital Demokrasi',
    'Eren Karaca',
    42,
    18,
    1
  ),
  (
    'Özgürlük ve Adalet Birliği',
    'ÖAB',
    '#2563eb',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
    'Hukukun üstünlüğü, bireysel haklar ve evrensel özgürlükler odaklı parlamenter siyasi grup.',
    'Liberal Demokrasi & İnsan Hakları',
    'Selin Yılmaz',
    35,
    14,
    2
  ),
  (
    'Birlik ve Reform Hareketi',
    'BRH',
    '#059669',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=300&q=80',
    'Ekonomik istikrar, sanayi hamleleri ve ulusal dayanışmayı öne çıkaran parlamenter parti.',
    'Ekonomik Reform & Kalkınma',
    'Alperen Şahin',
    38,
    15,
    3
  )
ON CONFLICT DO NOTHING;

-- 7. OFFICIAL GALLERY SEED
INSERT INTO gallery_official (title, image_url, category) VALUES
  ('Açılış Seremonisi', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 'Genel Kurul'),
  ('Komisyon Oturumu', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', 'Komisyonlar'),
  ('Müzakere Anı', 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80', 'Komisyonlar'),
  ('Grup Fotoğrafı', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80', 'Ekip')
ON CONFLICT DO NOTHING;

-- 8. RIDDLES & POLLS SEED
INSERT INTO riddles (id, question, is_active) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Bir parlamenter oturumda oylamaya sunulmadan önce komisyondan oy birliği ile geçen, ancak kanunlaşması için Genel Kurul onayına sunulan taslak metne ne ad verilir?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO polls (id, title, is_active) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Konparlamento 2026''nın en aktif komisyonu sizce hangisi?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO poll_options (id, poll_id, option_text, vote_count) VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Dışişleri ve Uluslararası İlişkiler Komisyonu', 45),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'İnsan Hakları ve Hukuk Komisyonu', 38),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Ekonomi, Sanayi ve Kalkınma Komisyonu', 29),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Çevre ve İklim Komisyonu', 32)
ON CONFLICT (id) DO NOTHING;

-- 9. LEGAL DOCUMENTS SEED
INSERT INTO legal_documents (id, title, content) VALUES
('kvkk', 'KVKK Aydınlatma Metni', '## KVKK AYDINLATMA METNİ\n\nKonparlamento 2026 Etkinliği kapsamında 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla işlenmektedir.\n\n### 1. İşlenen Kişisel Veriler\n* Ad, Soyad, T.C. Kimlik / Öğrenci No, Doğum Tarihi, Cinsiyet\n* E-posta adresi, Telefon numarası, Okul/Sınıf bilgisi\n* Etkinlik esnasında çekilen profil ve galeri fotoğrafları\n\n### 2. Veri İşleme Amaçları\nKişisel verileriniz başvuru değerlendirme, etkinlik akışının sağlanması, katılım belgesi düzenlenmesi ve güvenlik amaçlarıyla işlenmektedir.\n\n### 3. Haklarınız\nKVKK 11. maddesi uyarınca verilerinize erişme, düzeltme, silme ve itiraz etme haklarına sahipsiniz.'),
('gizlilik', 'Gizlilik Politikası', '## GİZLİLİK POLİTİKASI\n\nKonparlamento 2026 platformu olarak kullanıcılarımızın gizliliğine büyük önem vermekteyiz.\n\n* Platform üzerinde paylaşılan telefon numaraları ve e-posta adresleri kesinlikle 3. şahıslara satılmaz ve açıkça sergilenmez.\n* Katılımcı fotoğrafları yalnızca kullanıcının açık rızası ve admin onayı alındıktan sonra etkinlik galerisinde gösterilir.\n* Hesabınızı dilediğiniz zaman kapatma hakkınız saklıdır.'),
('cerez', 'Çerez Politikası', '## ÇEREZ POLİTİKASI\n\nSitemizde oturum güvenliğini ve kullanıcı deneyimini artırmak amacıyla zorunlu teknik çerezler kullanılmaktadır.\n\n* **Zorunlu Çerezler**: Giriş durumunuzu ve KVKK onay tercihlerinizi hatırlar.\n* Reklam ve takip çerezleri kesinlikle kullanılmamaktadır.'),
('kullanimKosullari', 'Kullanım Koşulları', '## KULLANIM KOŞULLARI\n\nKonparlamento 2026 platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:\n\n1. Etkinlik kurallarına ve genel ahlak ilkelerine uygun davranmak zorunludur.\n2. Galeriye yüklenen görsellerin telif haklarının yükleyen kişide olması şarttır.\n3. Yönetim paneli yetkisiz erişim girişimleri IP bazlı kaydedilerek hukuki işlem başlatılabilir.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
