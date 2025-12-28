-- Seed real Muhazi Dental Clinic team data
INSERT INTO staff (full_name, specialization, bio, is_active, working_days, working_hours_start, working_hours_end) VALUES
-- Dental Surgeons
('Dr. Evode Habineza', 'BDS - CEO & Dental Surgeon', 'CEO and Lead Dental Surgeon at Muhazi Dental Clinic. Committed to providing excellent dental care.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00'),
('Dr. Samuel Niyonkuru', 'BDS - Dental Surgeon', 'Experienced Dental Surgeon specializing in general and restorative dentistry.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00'),
('Dr. Alphonse Munyembabazi', 'BDS - Dental Surgeon', 'Skilled Dental Surgeon dedicated to patient comfort and dental health.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00'),
-- Dental Therapists
('Dahria Uwabera', 'BDT - Dental Therapist', 'Professional Dental Therapist providing preventive and basic restorative care.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00'),
('Uwishema Elite Olga', 'BDT - Dental Therapist', 'Dedicated Dental Therapist focused on patient education and preventive care.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00'),
-- Support Team
('Kalinijabo Lynda', 'Administrator', 'Clinic Administrator managing operations and ensuring smooth clinic workflow.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '18:00'),
('Eric Tuyisenge', 'Public Relations Officer', 'PRO handling communication, marketing, and community outreach.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '18:00'),
('Ndutira Divine', 'Receptionist', 'Front desk receptionist welcoming patients and managing appointments.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '08:00', '18:00'),
('Jeanette Uwamariya', 'Dental Assistant', 'Skilled Dental Assistant supporting clinical procedures and patient care.', true, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '08:00', '20:00')
ON CONFLICT DO NOTHING;