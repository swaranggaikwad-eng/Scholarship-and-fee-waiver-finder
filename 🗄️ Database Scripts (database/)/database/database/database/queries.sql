-- ====================================================================
-- Scholarship & Fee Waiver Finder - Useful SQL Queries
-- Database Name: scholarship_db
-- Description: Essential SQL queries for matching, document lookup,
--              application tracking, and admin statistics.
-- ====================================================================

USE scholarship_db;

-- QUERY 1: Find all scholarships matching a student's income and state
SELECT 
    scholarship_id,
    title,
    provider,
    amount_display,
    deadline,
    official_source_url
FROM scholarships
WHERE max_income >= 250000.00
  AND (is_maharashtra_scheme = TRUE OR states LIKE '%All India%')
  AND status != 'Closed'
ORDER BY amount DESC;

-- QUERY 2: Reverse Document Lookup
-- Find all scholarships that require a specific document (e.g., Income Certificate 'doc-2')
SELECT 
    s.scholarship_id,
    s.title,
    s.provider,
    s.amount_display,
    d.doc_name
FROM scholarships s
JOIN scholarship_documents sd ON s.scholarship_id = sd.scholarship_id
JOIN required_documents d ON sd.doc_id = d.doc_id
WHERE d.doc_id = 'doc-2';

-- QUERY 3: Get Student Application Tracker Status
SELECT 
    a.application_id,
    u.full_name AS student_name,
    s.title AS scholarship_name,
    a.status AS application_status,
    a.applied_date,
    a.deadline
FROM applications a
JOIN users u ON a.user_id = u.user_id
JOIN scholarships s ON a.scholarship_id = s.scholarship_id
WHERE u.user_id = 1;

-- QUERY 4: Admin Dashboard Summary Statistics
SELECT 
    (SELECT COUNT(*) FROM scholarships WHERE is_real_data = TRUE) AS total_verified_scholarships,
    (SELECT COUNT(*) FROM fee_waivers) AS total_fee_waivers,
    (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_registered_students,
    (SELECT COUNT(*) FROM applications WHERE status = 'Applied') AS total_submitted_applications;
