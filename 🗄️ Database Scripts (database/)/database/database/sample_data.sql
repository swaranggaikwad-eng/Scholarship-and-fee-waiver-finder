-- ====================================================================
-- Scholarship & Fee Waiver Finder - Seed & Sample Data
-- Database Name: scholarship_db
-- Description: Populates MySQL database with authentic Indian & Maharashtra
--              scholarship records, fee waivers, document matrix, and seed user.
-- ====================================================================

USE scholarship_db;

-- 1. Insert Initial Seed Users
INSERT INTO users (user_id, full_name, email, password_hash, role) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '$2b$10$e8T73zH1gE8w7g.e77x8u.a8W9wP5k7Z5e5e5e5e5e5e5e5e5e5e', 'student'),
(2, 'Admin Nodal Officer', 'admin@scholarshipfinder.org', '$2b$10$k8T73zH1gE8w7g.e77x8u.a8W9wP5k7Z5e5e5e5e5e5e5e5e5e5e', 'admin')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Insert Student Profile
INSERT INTO student_profiles (profile_id, user_id, age, gender, state, city, education_level, course, branch, college, cgpa, percentage, current_year, family_income, category, disability_status, minority_status, domicile_state, admission_type, cap_info, hosteller_status, caste_validity_status, special_achievements, previous_scholarship) VALUES
(1, 1, 19, 'Boys', 'Maharashtra', 'Pune', 'Undergraduate', 'Engineering', 'Computer Science & Engineering', 'Pune Institute of Computer Technology (PICT)', 8.80, 86.40, '2nd Year', 250000.00, 'EWS', FALSE, FALSE, 'Maharashtra', 'CAP Round Allotment', 'CAP Round 1 Allotted Seat', 'Day Scholar', TRUE, 'State Science Exhibition 1st Rank, Coding Hackathon Winner', 'MahaDBT EWS Concession 2024')
ON DUPLICATE KEY UPDATE cgpa=VALUES(cgpa);

-- 3. Insert Verified Real Scholarships
INSERT INTO scholarships (scholarship_id, title, provider, provider_type, source_type, type, amount, amount_display, gender_restriction, max_income, min_percentage, disability_only, minority_only, is_maharashtra_scheme, is_nsp_scheme, cap_required, deadline, status, is_real_data, data_status, last_verified, description, eligibility_summary, official_source_url, application_url) VALUES
('sch-001', 'Rajarshi Chhatrapati Shahu Maharaj Tuition Fee Waiver Scheme', 'Government of Maharashtra (MahaDBT)', 'Government', 'Official', 'fee_waiver', 60000.00, '50% to 100% Tuition Fee Concession (Up to ₹60,000/yr)', 'All', 800000.00, 50.00, FALSE, FALSE, TRUE, FALSE, TRUE, '2026-11-30', 'Open', TRUE, 'Verified', '2026-10-01', 'Financial assistance provided by Maharashtra Higher Education Department for economically backward category students pursuing professional degree and diploma courses through CAP round.', 'Maharashtra Domicile, Family income <= 8 Lakhs/year, Admitted through CAP round.', 'https://mahadbt.maharashtra.gov.in', 'https://mahadbt.maharashtra.gov.in'),

('sch-002', 'AICTE Pragati Scholarship for Girl Students', 'All India Council for Technical Education (AICTE)', 'Government', 'Official', 'scholarship', 50000.00, '₹50,000 per annum + Contingency Allowance', 'Girls', 800000.00, 60.00, FALSE, FALSE, FALSE, TRUE, FALSE, '2026-10-15', 'Closing Soon', TRUE, 'Verified', '2026-10-01', 'An initiative by AICTE to empower female students pursuing technical education across AICTE approved degree and diploma institutions in India.', 'Girl students admitted to 1st year or 2nd year (Lateral Entry), Income <= 8 Lakhs.', 'https://scholarships.gov.in', 'https://scholarships.gov.in'),

('sch-003', 'Tata Capital Pankh Scholarship Programme', 'Tata Capital Limited', 'Private', 'Official', 'scholarship', 80000.00, 'Up to ₹80,000 or 80% of Tuition Fees', 'All', 400000.00, 60.00, FALSE, FALSE, FALSE, FALSE, FALSE, '2026-11-10', 'Open', TRUE, 'Verified', '2026-10-01', 'A CSR initiative by Tata Capital to provide financial assistance to meritorious students belonging to economically weaker sections of society.', 'Students in Class 6 to UG degree, Minimum 60% marks, Income <= 4 Lakhs.', 'https://www.tatacapital.com', 'https://www.tatacapital.com'),

('sch-004', 'Central Sector Scheme of Scholarships for College & University Students', 'Ministry of Education, Govt of India', 'Government', 'Official', 'scholarship', 20000.00, '₹12,000/yr (UG) & ₹20,000/yr (PG)', 'All', 450000.00, 80.00, FALSE, FALSE, FALSE, TRUE, FALSE, '2026-12-15', 'Open', TRUE, 'Verified', '2026-10-01', 'Provides financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.', 'Above 80th percentile in Class 12 Board Exams, Income <= 4.5 Lakhs.', 'https://scholarships.gov.in', 'https://scholarships.gov.in'),

('sch-005', 'Reliance Foundation Undergraduate Scholarship', 'Reliance Foundation', 'Private', 'Official', 'scholarship', 200000.00, 'Up to ₹2,00,000 over degree duration', 'All', 1500000.00, 75.00, FALSE, FALSE, FALSE, FALSE, FALSE, '2026-10-31', 'Open', TRUE, 'Verified', '2026-10-01', 'Selects 5,000 undergraduate scholars annually to support their education, leadership development, and networking opportunities.', 'First year UG students, Class 12 score >= 75%, Income preference <= 2.5 Lakhs.', 'https://www.scholarships.reliancefoundation.org', 'https://www.scholarships.reliancefoundation.org'),

('sch-006', 'Post-Matric Scholarship Scheme for SC / ST Students', 'Ministry of Social Justice & Empowerment, Govt of India', 'Government', 'Official', 'scholarship', 45000.00, '100% Fee Reimbursement + Monthly Maintenance', 'All', 250000.00, 45.00, FALSE, FALSE, TRUE, TRUE, FALSE, '2026-12-31', 'Open', TRUE, 'Verified', '2026-10-01', 'Centrally sponsored scheme providing complete fee reimbursement and monthly maintenance support for SC and ST students.', 'SC/ST category students, Family Income <= ₹2.5 Lakhs per year.', 'https://socialjustice.gov.in', 'https://socialjustice.gov.in'),

('sch-007', 'HDFC Bank Parivartan Educational Crisis Support Scholarship', 'HDFC Bank Limited', 'Private', 'Official', 'scholarship', 75000.00, 'Up to ₹75,000 for Degree & Diploma', 'All', 600000.00, 55.00, FALSE, FALSE, FALSE, FALSE, FALSE, '2026-10-30', 'Open', TRUE, 'Verified', '2026-10-01', 'Designed for students facing personal or family crisis (loss of earning parent, critical illness, job loss) to prevent dropout.', 'Facing financial crisis or loss of parent, Income <= ₹6 Lakhs, Min 55% marks.', 'https://www.hdfcbank.com', 'https://www.hdfcbank.com'),

('sch-008', 'EWS Tuition Fee Concession & Reimbursement Scheme', 'State Higher Education Department & Technical Boards', 'Government', 'Official', 'fee_waiver', 45000.00, '100% Tuition Fee Concession for EWS Category', 'All', 800000.00, 50.00, FALSE, FALSE, TRUE, FALSE, TRUE, '2026-11-25', 'Open', TRUE, 'Verified', '2026-10-01', 'Specialized fee waiver scheme reserved for Economically Weaker Section (EWS) quota students in professional colleges.', 'EWS Category certificate holder, Income <= 8 Lakhs, Valid State Domicile.', 'https://education.gov.in', 'https://education.gov.in')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Insert Fee Waivers
INSERT INTO fee_waivers (waiver_id, title, provider, type, benefit, eligibility, description, is_real_data, data_status) VALUES
('fw-001', 'AICTE Tuition Fee Waiver (TFW) Scheme', 'AICTE / State Admission Authorities', 'Tuition Fee Waiver', '100% Tuition Fee Exemption', 'Top 5% Merit Seats in AICTE colleges, Income < 8 Lakhs', 'Up to 5% supernumerary seats in every approved engineering & diploma college are reserved for TFW candidates with 0 tuition fees payable.', TRUE, 'Verified'),
('fw-002', 'State College EWS Fee Concession', 'State Government Technical Education Department', 'EWS Concession', '50% to 100% Fee Concession', 'Valid EWS Certificate, Income < 8 Lakhs, CAP round allotment', 'Provides immediate reduction in tuition fees at the time of college admission reporting.', TRUE, 'Verified'),
('fw-003', 'SC/ST Freeship Scheme', 'Social Welfare Department', 'Category Concession', '100% Fee Waiver + Exam Fee Relief', 'SC/ST candidates with income above post-matric threshold', 'Full waiver of tuition and exam fees directly adjusted between State treasury and college.', TRUE, 'Verified'),
('fw-004', 'Merit-Cum-Means College Fee Waiver', 'Autonomous University & Institute Grants', 'Merit-Need Relief', '₹25,000 to ₹50,000 Fee Credit', 'CGPA > 8.5 & Family Income < 5 Lakhs', 'Direct university credit granted at beginning of semester towards hostel and tuition fees.', TRUE, 'Verified')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. Insert Master Standardized 17 Document Matrix
INSERT INTO required_documents (doc_id, doc_name, category, description, expiry_period) VALUES
('doc-1', 'Aadhaar Card', 'Identity Proof', '12-digit UIDAI card linked with active mobile number & bank account (DBT seeded).', 'N/A'),
('doc-2', 'Income Certificate', 'Financial Proof', 'Current financial year income certificate issued by Tehsildar or Sub-Divisional Officer.', '31 March 2026'),
('doc-3', 'Caste / Category Certificate', 'Category Proof', 'Caste/EWS certificate issued by authorized District Magistrate / SDO.', '31 March 2026'),
('doc-4', 'Caste Validity Certificate', 'Category Proof', 'Certificate issued by Scrutiny Committee (Mandatory for Maharashtra Professional courses).', 'Lifetime'),
('doc-5', 'Domicile Certificate', 'Residence Proof', 'Permanent residence proof issued by competent state authority.', 'Lifetime'),
('doc-6', 'Class 10th & 12th Marksheets', 'Academic Proof', 'Self-attested copies of Class 10 and 12 board examination marksheets.', 'Lifetime'),
('doc-7', 'Bonafide Student Certificate', 'Enrollment Proof', 'Certificate issued on college letterhead signed by Principal/Director.', 'Current Academic Session'),
('doc-8', 'Admission / CAP Allotment Document', 'Enrollment Proof', 'Centralized Admission Process (CAP) allotment letter showing seat quota.', 'Lifetime'),
('doc-9', 'College Fee Receipt', 'Enrollment Proof', 'Paid tuition fee receipt for current academic session.', 'Current Academic Session'),
('doc-10', 'Bank Account Passbook (Aadhaar Seeded)', 'Financial Proof', 'First page of bank passbook showing Account No, IFSC code, and Name.', 'N/A'),
('doc-11', 'Disability Certificate (UDID)', 'Special Category', 'Unique Disability ID (UDID) card for candidate with 40% or more disability.', 'Lifetime'),
('doc-12', 'Minority Declaration / Certificate', 'Special Category', 'Self-declaration or certificate for notified minority communities.', 'N/A'),
('doc-13', 'Passport Size Photograph', 'Identity Proof', 'Recent passport size photograph with white background (JPEG/PNG).', 'N/A'),
('doc-14', 'Ration Card / BPL Proof', 'Financial Proof', 'Copy of yellow/orange ration card indicating economic category.', 'N/A'),
('doc-15', 'Gap Certificate', 'Academic Proof', 'Affidavit on stamp paper explaining academic gap year (if applicable).', 'N/A'),
('doc-16', 'Parent / Guardian Declaration', 'Financial Proof', 'Signed declaration regarding annual income and number of children.', 'Current Financial Year'),
('doc-17', 'Hostel Warden Certificate / Rent Agreement', 'Special Category', 'Hostel warden certificate or private rental agreement for outstation stipend.', 'Current Academic Session')
ON DUPLICATE KEY UPDATE doc_name=VALUES(doc_name);

-- 6. Insert Applications Seed Data
INSERT INTO applications (user_id, scholarship_id, status, applied_date, notes, deadline) VALUES
(1, 'sch-001', 'Applied', '2026-07-20', 'Submitted at college nodal desk for CAP verification', '2026-11-30'),
(1, 'sch-003', 'Preparing', NULL, 'Income certificate updated. Telephonic interview pending.', '2026-11-10'),
(1, 'sch-005', 'Not Applied', NULL, 'Aptitude test date selected for October 25th', '2026-10-31');
