-- ResQ Seed Data
-- 10 sample needs across India + 5 volunteers

-- ============================================
-- SAMPLE NEEDS
-- ============================================
INSERT INTO needs (raw_text, location_name, lat, lng, need_type, urgency_score, affected_count, status, description) VALUES
(
  'Severe flooding in Andheri East, Mumbai. Over 200 families stranded on rooftops. Need immediate rescue boats and medical teams. Water level rising fast.',
  'Andheri East, Mumbai',
  19.1197, 72.8464, 'Rescue', 95, 200, 'pending',
  'Severe flooding with 200+ families stranded on rooftops. Urgent rescue and medical assistance needed.'
),
(
  'Medical camp urgently needed in Velachery, Chennai. Dengue outbreak affecting 150 residents. No hospital within 10km radius.',
  'Velachery, Chennai',
  12.9815, 80.2180, 'Medical', 88, 150, 'pending',
  'Dengue outbreak affecting 150 residents with no nearby hospital access.'
),
(
  'Food supplies exhausted at relief camp in Patna. 500 displaced persons have not eaten in 24 hours. Children and elderly at risk.',
  'Kankarbagh, Patna',
  25.5940, 85.1376, 'Food', 92, 500, 'pending',
  'Relief camp food supplies exhausted. 500 displaced persons including children and elderly without food for 24 hours.'
),
(
  'Clean drinking water shortage in Bhopal slum area. 300 families relying on contaminated well water. Multiple cholera cases reported.',
  'Jehangirabad, Bhopal',
  23.2599, 77.4126, 'Water', 85, 300, 'pending',
  'Water contamination in slum area with cholera cases. 300 families affected.'
),
(
  'School building partially collapsed in Guwahati earthquake. 80 students displaced, need temporary shelter and education materials.',
  'Dispur, Guwahati',
  26.1445, 91.7362, 'Shelter', 72, 80, 'assigned',
  'School collapse from earthquake. 80 students need shelter and education continuity.'
),
(
  'Clothing and blanket distribution needed in Shimla. Cold wave affecting 120 homeless persons. Temperatures dropping below -5°C tonight.',
  'Mall Road, Shimla',
  31.1048, 77.1734, 'Clothing', 68, 120, 'pending',
  'Cold wave emergency. 120 homeless persons need warm clothing and blankets.'
),
(
  'Sanitation facilities destroyed by cyclone in Puri. Open defecation risk for 400 residents. Need portable toilets and hygiene kits.',
  'Grand Road, Puri',
  19.8135, 85.8312, 'Sanitation', 65, 400, 'pending',
  'Cyclone-destroyed sanitation. 400 residents at health risk from open defecation.'
),
(
  'Bridge collapsed on NH-44 near Hyderabad. 50 vehicles stranded. Need heavy machinery and construction crew for emergency bypass.',
  'Shamshabad, Hyderabad',
  17.2403, 78.4294, 'Infrastructure', 78, 50, 'pending',
  'Bridge collapse on national highway. 50 vehicles stranded, emergency bypass needed.'
),
(
  'Tribal village in Kerala cut off after landslide. 60 families need food drops and medical supplies via helicopter.',
  'Wayanad, Kerala',
  11.6854, 76.1320, 'Food', 90, 60, 'pending',
  'Landslide-isolated tribal village. 60 families need aerial supply drops.'
),
(
  'Post-flood education support needed in Kolkata. 200 children out of school for 3 weeks. Need temporary classrooms and teachers.',
  'Salt Lake, Kolkata',
  22.5726, 88.4497, 'Education', 42, 200, 'resolved',
  'Post-flood education disruption. 200 children need temporary schooling arrangements.'
);

-- ============================================
-- SAMPLE VOLUNTEERS
-- ============================================
INSERT INTO volunteers (name, phone, skills, lat, lng, is_available, active_task_count) VALUES
(
  'Dr. Priya Sharma',
  '+919876543210',
  ARRAY['Medical', 'Education'],
  19.0760, 72.8777, true, 0
),
(
  'Rajesh Kumar',
  '+919876543211',
  ARRAY['Construction', 'Logistics'],
  28.6139, 77.2090, true, 0
),
(
  'Ananya Reddy',
  '+919876543212',
  ARRAY['Food Distribution', 'Logistics'],
  17.3850, 78.4867, true, 1
),
(
  'Mohammed Irfan',
  '+919876543213',
  ARRAY['Medical', 'Tech'],
  13.0827, 80.2707, true, 0
),
(
  'Sunita Devi',
  '+919876543214',
  ARRAY['Food Distribution', 'Education', 'Logistics'],
  25.6093, 85.1376, true, 0
);
