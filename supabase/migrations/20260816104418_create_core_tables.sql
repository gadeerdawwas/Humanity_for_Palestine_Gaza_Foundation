/*
# Create core tables for Humanity for Palestine – Gaza

1. New Tables
- `contact_messages`: stores messages submitted from the public contact form.
  - id (uuid pk), name, email, phone (nullable), message, created_at, status (new/read/replied)
- `newsletter_subscribers`: stores newsletter email sign-ups.
  - id (uuid pk), email (unique), created_at
- `projects`: stores project cards shown on the public site.
  - id (uuid pk), title_ar, title_en, description_ar, description_en, category (women_child/relief/education/health), status (ongoing/completed), cover_image_url, display_order, created_at
- `gallery_images`: stores gallery photos shown on the public site.
  - id (uuid pk), image_url, caption_ar (nullable), caption_en (nullable), display_order, created_at
- `services`: stores the four service cards shown on the public site.
  - id (uuid pk), number (int), title_ar, title_en, description_ar, description_en, accent_color, icon_name, display_order

2. Security (RLS)
- contact_messages: public INSERT only (anon + authenticated). No public read/update/delete.
- newsletter_subscribers: public INSERT only. No public read/update/delete.
- projects: public SELECT only. No public write.
- gallery_images: public SELECT only. No public write.
- services: public SELECT only. No public write.
All policies use `TO anon, authenticated` because the public site has no sign-in screen and the frontend talks to Supabase with the anon key.

3. Seed Data
- `services` table seeded with the 4 existing services in their current order:
  01 Women & Child (red, heart), 02 Relief (green, hands), 03 Education (gold, book), 04 Health (deep, plus).
*/

-- ============ contact_messages ============
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_contact_messages" ON contact_messages;
CREATE POLICY "public_insert_contact_messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============ newsletter_subscribers ============
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter_subscribers"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============ projects ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL,
  description_en text NOT NULL,
  category text NOT NULL CHECK (category IN ('women_child', 'relief', 'education', 'health')),
  status text NOT NULL CHECK (status IN ('ongoing', 'completed')),
  cover_image_url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_projects" ON projects;
CREATE POLICY "public_select_projects"
  ON projects FOR SELECT
  TO anon, authenticated USING (true);

-- ============ gallery_images ============
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption_ar text,
  caption_en text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_gallery_images" ON gallery_images;
CREATE POLICY "public_select_gallery_images"
  ON gallery_images FOR SELECT
  TO anon, authenticated USING (true);

-- ============ services ============
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  description_ar text NOT NULL,
  description_en text NOT NULL,
  accent_color text NOT NULL,
  icon_name text NOT NULL,
  display_order int NOT NULL DEFAULT 0
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_services" ON services;
CREATE POLICY "public_select_services"
  ON services FOR SELECT
  TO anon, authenticated USING (true);

-- ============ Seed services ============
INSERT INTO services (number, title_ar, title_en, description_ar, description_en, accent_color, icon_name, display_order)
VALUES
  (1, 'المرأة والطفل', 'Women & Child',
   'دعم المرأة، وخاصة النساء المعيلات والمتضررات، عبر برامج التدريب والتأهيل والتمكين الاقتصادي والاجتماعي، إلى جانب المساهمة في توفير بيئة أكثر أمانًا للأطفال ودعم احتياجاتهم التعليمية والاجتماعية والنفسية والترفيهية.',
   'Supporting women — especially female breadwinners and those affected — through training, rehabilitation, and economic and social empowerment programs, while contributing to a safer environment for children and supporting their educational, social, psychological, and recreational needs.',
   'red', 'heart', 1),
  (2, 'الإغاثة', 'Relief',
   'توفير المساعدات والاحتياجات الأساسية للأسر والفئات الأكثر تضررًا في حالات الطوارئ والأزمات — استجابة إنسانية عاجلة وميدانية لمن هم بأمسّ الحاجة.',
   'Providing aid and essential needs to families and the most affected groups during emergencies and crises — urgent, on-the-ground humanitarian response for those who need it most.',
   'green', 'hands', 2),
  (3, 'التعليم', 'Education',
   'دعم استمرار التعليم وتوفير الفرص والاحتياجات التعليمية للأطفال والطلبة المتضررين من الظروف الطارئة، حتى لا يتوقف التعلّم عندما يتوقف كل شيء آخر.',
   'Supporting continued education and providing educational opportunities and needs for children and students affected by emergency conditions, so learning does not stop when everything else does.',
   'gold', 'book', 3),
  (4, 'الصحة', 'Health',
   'تنفيذ ودعم المبادرات الصحية والتوعوية، والمساهمة في توفير الاحتياجات الصحية الأساسية للفئات الأكثر احتياجًا، من الرعاية الأساسية إلى التوعية الصحية.',
   'Implementing and supporting health and awareness initiatives, and contributing to essential health needs for the most vulnerable groups, from basic care to health education.',
   'deep', 'plus', 4)
ON CONFLICT DO NOTHING;

-- ============ Seed projects ============
INSERT INTO projects (title_ar, title_en, description_ar, description_en, category, status, cover_image_url, display_order)
VALUES
  ('توزيع سلال غذائية طارئة', 'Emergency Food Basket Distribution',
   'توزيع مئات السلال الغذائية شهريًا على الأسر الأكثر احتياجًا في قطاع غزة.',
   'Distributing hundreds of food baskets monthly to the most vulnerable families in Gaza.',
   'relief', 'ongoing',
   'https://images.pexels.com/photos/30668435/pexels-photo-30668435.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('خيمة تعليمية للأطفال', 'Children''s Learning Tent',
   'مساحات تعليمية مؤقتة وآمنة تساعد الأطفال على استكمال تعلّمهم رغم الظروف الطارئة.',
   'Temporary, safe learning spaces helping children continue their education despite emergency conditions.',
   'education', 'ongoing',
   'https://images.pexels.com/photos/33720879/pexels-photo-33720879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
  ('دعم نفسي واجتماعي للنساء المعيلات', 'Psychosocial Support for Female Breadwinners',
   'برنامج تدريبي وتأهيلي ساهم في تمكين عدد من النساء المعيلات اقتصاديًا واجتماعيًا.',
   'A training and rehabilitation program that helped economically and socially empower a number of female breadwinners.',
   'women_child', 'completed',
   'https://images.pexels.com/photos/11795988/pexels-photo-11795988.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3)
ON CONFLICT DO NOTHING;

-- ============ Seed gallery_images ============
INSERT INTO gallery_images (image_url, caption_ar, caption_en, display_order)
VALUES
  ('https://images.pexels.com/photos/6646868/pexels-photo-6646868.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'توزيع المساعدات', 'Aid distribution', 1),
  ('https://images.pexels.com/photos/11596973/pexels-photo-11596973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'أطفال في المخيم', 'Children in the camp', 2),
  ('https://images.pexels.com/photos/38865329/pexels-photo-38865329.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'ورشة تدريبية للنساء', 'Women''s training workshop', 3),
  ('https://images.pexels.com/photos/14992078/pexels-photo-14992078.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'مساحة تعليمية للأطفال', 'Learning space for children', 4),
  ('https://images.pexels.com/photos/6646921/pexels-photo-6646921.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'تفريغ المساعدات', 'Unloading aid', 5),
  ('https://images.pexels.com/photos/11764946/pexels-photo-11764946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'وجه من وجوه الأمل', 'A face of hope', 6),
  ('https://images.pexels.com/photos/6647122/pexels-photo-6647122.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'تنظيم الطرود', 'Organizing packages', 7),
  ('https://images.pexels.com/photos/11596976/pexels-photo-11596976.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'ابتسامة وسط الظروف', 'A smile amid hardship', 8)
ON CONFLICT DO NOTHING;
