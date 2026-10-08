-- ====================================================================
-- Scholarship & Fee Waiver Finder - MySQL Database Schema
-- Database Name: scholarship_db
-- Description: Relational database DDL for student profiles, verified
--              scholarships, fee waivers, document tracking, and applications.
-- ====================================================================

CREATE DATABASE IF NOT EXISTS scholarship_db;
USE scholarship_db;

-- 1. Users & Authentication Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Personal & Academic Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    gender ENUM('Boys', 'Girls', 'All', 'Other') DEFAULT 'Boys',
    state VARCHAR(100) DEFAULT 'Maharashtra',
    city VARCHAR(100) DEFAULT 'Pune',
    education_level ENUM('School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Ph.D.') NOT NULL,
    course VARCHAR(100) NOT NULL,
    branch VARCHAR(150),
    college VARCHAR(200),
    cgpa DECIMAL(3,2),
    percentage DECIMAL(5,2),
    current_year VARCHAR(50),
    family_income DECIMAL(12,2) NOT NULL,
    category ENUM('General', 'OBC', 'SC', 'ST', 'EWS', 'Other') NOT NULL,
    disability_status BOOLEAN DEFAULT FALSE,
    minority_status BOOLEAN DEFAULT FALSE,
    domicile_state VARCHAR(100) DEFAULT 'Maharashtra',
    admission_type VARCHAR(100) DEFAULT 'CAP Round Allotment',
    cap_info VARCHAR(150),
    hosteller_status ENUM('Day Scholar', 'Hosteller') DEFAULT 'Day Scholar',
    caste_validity_status BOOLEAN DEFAULT TRUE,
    special_achievements TEXT,
    previous_scholarship VARCHAR(200),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Scholarships Master Table
CREATE TABLE IF NOT EXISTS scholarships (
    scholarship_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(200) NOT NULL,
    provider_type ENUM('Government', 'Private', 'Institutional') DEFAULT 'Government',
    source_type ENUM('Official', 'Provider', 'Third-party', 'Demo') DEFAULT 'Official',
    type ENUM('scholarship', 'fee_waiver') DEFAULT 'scholarship',
    amount DECIMAL(10,2) NOT NULL,
    amount_display VARCHAR(150) NOT NULL,
    gender_restriction ENUM('All', 'Girls', 'Boys') DEFAULT 'All',
    max_income DECIMAL(12,2) NOT NULL,
    min_percentage DECIMAL(5,2) DEFAULT 0.00,
    disability_only BOOLEAN DEFAULT FALSE,
    minority_only BOOLEAN DEFAULT FALSE,
    is_maharashtra_scheme BOOLEAN DEFAULT FALSE,
    is_nsp_scheme BOOLEAN DEFAULT FALSE,
    cap_required BOOLEAN DEFAULT FALSE,
    deadline DATE NOT NULL,
    status ENUM('Open', 'Closing Soon', 'Closed') DEFAULT 'Open',
    is_real_data BOOLEAN DEFAULT TRUE,
    data_status ENUM('Verified', 'Sample') DEFAULT 'Verified',
    last_verified DATE,
    description TEXT,
    eligibility_summary TEXT,
    special_requirements TEXT,
    selection_process TEXT,
    terms TEXT,
    official_source_url VARCHAR(255),
    application_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fee Waivers Table
CREATE TABLE IF NOT EXISTS fee_waivers (
    waiver_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    benefit VARCHAR(255) NOT NULL,
    eligibility TEXT NOT NULL,
    description TEXT,
    is_real_data BOOLEAN DEFAULT TRUE,
    data_status ENUM('Verified', 'Sample') DEFAULT 'Verified'
);

-- 5. Standardized Document Matrix Table
CREATE TABLE IF NOT EXISTS required_documents (
    doc_id VARCHAR(50) PRIMARY KEY,
    doc_name VARCHAR(150) NOT NULL,
    category ENUM('Identity Proof', 'Financial Proof', 'Category Proof', 'Residence Proof', 'Academic Proof', 'Enrollment Proof', 'Special Category') NOT NULL,
    description TEXT,
    expiry_period VARCHAR(100) DEFAULT 'Lifetime'
);

-- 6. Scholarship-Document Mapping Junction Table
CREATE TABLE IF NOT EXISTS scholarship_documents (
    mapping_id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_id VARCHAR(50) NOT NULL,
    doc_id VARCHAR(50) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES required_documents(doc_id) ON DELETE CASCADE
);

-- 7. Student Document Submissions Table
CREATE TABLE IF NOT EXISTS student_documents (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    doc_id VARCHAR(50) NOT NULL,
    status ENUM('Uploaded', 'Required', 'Not Applicable') DEFAULT 'Required',
    file_path VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES required_documents(doc_id) ON DELETE CASCADE
);

-- 8. Applications Tracker Table
CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    scholarship_id VARCHAR(50) NOT NULL,
    status ENUM('Not Applied', 'Preparing', 'Applied', 'Under Verification', 'Approved', 'Rejected') DEFAULT 'Applied',
    applied_date DATE,
    notes TEXT,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id) ON DELETE CASCADE
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notif_id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('deadline', 'match', 'doc', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
