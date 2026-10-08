# 🎓 Scholarship & Fee Waiver Finder

> **"One Profile → Multiple Financial Aid Matches"**  
> An EdTech + FinTech platform designed for school, diploma, undergraduate, and postgraduate students across India to discover eligible scholarships, tuition fee waivers, and financial aid opportunities using a **100-Point Weighted Smart Match Engine** and **Reverse Document Mapping**.

---

## 1. Project Overview

Finding financial assistance and tuition fee waivers is often a fragmented, complex, and time-consuming process for students in India. Information is scattered across numerous central portals (National Scholarship Portal - NSP), state government portals (MahaDBT, SSP Karnataka), and private CSR foundations (Tata Capital, HDFC Bank, Reliance Foundation). Due to complex eligibility criteria, income caps, and missing document requirements, thousands of eligible students miss critical scholarship deadlines every year.

**Scholarship & Fee Waiver Finder** solves this problem by allowing students to enter their academic, economic, and personal profile once. The system evaluates their profile against verified real-world scholarship criteria, calculates a dynamic eligibility match percentage, maps required documents in reverse, and estimates total potential financial relief.

---

## 2. Objectives

- **Reduce Search Effort**: Eliminate the need to manually browse dozens of disjointed scholarship portals.
- **Dynamic Eligibility Scoring**: Replace generic search with a **100-Point Weighted Match Engine** that evaluates Domicile, Income, Course, Category, Marks, and Gender.
- **Prevent Document Disqualifications**: Implement **Reverse Document Mapping** so students know *why* each certificate is needed and which matched schemes depend on it.
- **Promote Data Transparency**: Distinguish authentic government/CSR schemes with a prominent `🟢 OFFICIAL / VERIFIED` badge and direct links to official portals.
- **Financial Aid Estimation**: Provide students with a clear summary of total potential financial support (Scholarships + Fee Waivers + Living Allowances).

---

## 3. Implemented Features

### 🎯 Core Matching & Eligibility Features
- **100-Point Weighted Smart Match Engine**: Evaluates State/Domicile (20%), Education Level (20%), Family Income Ceiling (20%), Enrolled Course (15%), Category (10%), Academic Marks (10%), and Gender (5%).
- **Fair Penalty & Neutral Logic**: Unrestricted criteria award full points so candidates aren't penalized when a scheme has open criteria.
- **Dynamic Filtering**: Filter scholarships by State (Maharashtra, All India), Category (EWS, SC, ST, OBC, General), Education Level, Provider Type (Government, Private), and Data Authenticity.

### 📄 Document Vault & Reverse Dependency Mapping
- **17 Standardized Master Documents Matrix**: Tracks essential certificates (Aadhaar, Income Certificate, Domicile, Caste & Validity, CAP Allotment, Bonafide, Marksheets, etc.).
- **Reverse Document-to-Scheme Mapping**: Ticking or selecting a document reveals the exact list of eligible scholarships requiring that specific document.
- **Application Readiness Meter (%)**: Quantifies student application readiness based on profile completeness (40%), document verification (40%), and eligibility score (20%).

### ⚖️ Comparison & Detail Management
- **Side-by-Side Scheme Comparison Matrix**: Select up to 3 scholarships and compare financial benefits, income limits, deadline dates, and document requirements side-by-side.
- **Official Details Modal**: View comprehensive eligibility criteria, step-by-step application instructions, terms & conditions, and verified direct links to official government portals.
- **Report Incorrect Information**: Interactive modal allowing users to report outdated deadlines or criteria.

### 🎨 Startup-Grade Student UI & Experience
- **EdTech + FinTech Design System**: Built with Trust Blue (`#1E40AF`) and Emerald Green (`#059669`), responsive layout, and dark/light theme toggle.
- **Interactive Hero Demo Loop**: Step-by-step animated preview on the landing page simulating real-time profile matching.
- **Notification Popover**: Live notification center tracking upcoming scholarship deadlines and match alerts.
- **Student & Admin Portals**: Student dashboard for tracking saved applications and Admin portal for reviewing platform statistics.

---

## 4. Technology Stack

### Frontend
- **HTML5**: Semantic document markup and accessible layout.
- **CSS3**: Custom CSS Properties (Variables), Flexbox, CSS Grid, Glassmorphic components, animations, and Dark/Light Mode theme engine.
- **JavaScript (ES6+)**: Vanilla JavaScript DOM manipulation, state management, matching algorithms, and client-side SPA routing.

### Backend *(Current & Future)*
- **Current Architecture**: Client-side Single Page Application (SPA) where all matching algorithms, document filtering, and view state run in the browser via `app.js`.
- **Future Integration Path**: RESTful API using Node.js, Express.js, and MySQL.

### Database
- **Current Data Store**: Verified in-memory JSON data structures in `mockData.js` (`MOCK_SCHOLARSHIPS`, `MOCK_FEE_WAIVERS`, `REQUIRED_DOCUMENTS_MASTER`).
- **SQL Relational Database (Prepared)**: Complete MySQL schema and seed scripts provided in `database/schema.sql` and `database/sample_data.sql`.

### Authentication
- Client-side simulated authentication state in `app.js` using `localStorage` for Student and Admin session toggling.

---

## 5. Project Structure

```
Scholarship-and-Fee-Waiver/
│
├── index.html               # Main HTML5 entry point containing navbar, views, modals & footer
├── styles.css               # EdTech & FinTech CSS design system, variables & dark mode styles
├── mockData.js              # Real verified scholarship dataset & 17-item master document matrix
├── app.js                   # Master application logic: Smart Match engine, router, state & UI handlers
├── package.json             # NPM package file with npm start / dev execution scripts
├── serve.ps1                # PowerShell helper script for local execution
├── .env.example             # Template for environment variables
├── .gitignore               # Excludes node_modules, .env, and log files
├── README.md                # Project documentation
│
├── database/                # Prepared MySQL Relational Database Scripts
│   ├── schema.sql           # Database DDL (Users, Profiles, Scholarships, Documents, Applications)
│   ├── sample_data.sql      # Database DML seed data matching verified dataset
│   └── queries.sql          # Sample SQL queries for analytics & verification
│
└── docs/                    # Technical & Architecture Documentation
    ├── ARCHITECTURE.md      # Detailed system architecture & 100-pt matching formula math
    └── UML_AND_ER_DIAGRAMS.md # Mermaid ER diagrams, sequence diagrams, and component diagrams
```

---

## 6. Database Setup (MySQL Integration)

While the web application currently runs in client-side mode using `mockData.js`, a production-ready MySQL database script is provided inside the `database/` folder.

To setup the database in MySQL Workbench or Command Line:

1. Open MySQL Command Line Client or MySQL Workbench.
2. Execute the schema script:
   ```sql
   SOURCE database/schema.sql;
   ```
3. Execute the seed data script:
   ```sql
   SOURCE database/sample_data.sql;
   ```
4. Verify database creation:
   ```sql
   USE scholarship_db;
   SHOW TABLES;
   SELECT * FROM scholarships;
   ```

---

## 7. Installation

Clone or download the project repository to your local machine:

```bash
git clone https://github.com/your-username/Scholarship-and-Fee-Waiver.git
cd Scholarship-and-Fee-Waiver
```

Optional: Install `serve` package if running via Node / npm:
```bash
npm install
```

---

## 8. Environment Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Default placeholder values in `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_NAME=scholarship_db
```

---

## 9. How to Run

### Method 1: Standard NPM Command (Recommended)
Run using the `npm start` script in `package.json`:
```bash
npm start
```
*App will be accessible at: `http://localhost:3000`*

### Method 2: Direct Local Web Server
You can serve the directory using any static HTTP server or Java `jwebserver`:
```bash
& "C:\Program Files\Java\jdk-26.0.1\bin\jwebserver.exe" -p 3000 -d .
```
or open `index.html` directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox).

---

## 10. API Documentation *(Planned Backend Integration)*

When connected to a Node.js/Express backend, the following REST API endpoints will be exposed:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/scholarships` | `GET` | Fetch list of all verified scholarships |
| `/api/scholarships/:id` | `GET` | Fetch detailed information for a specific scholarship |
| `/api/match` | `POST` | Process student profile and return weighted match scores |
| `/api/documents/reverse-map` | `GET` | Fetch reverse mapping of documents to schemes |
| `/api/applications` | `POST` | Submit or update student application tracking status |

---

## 11. Login / Admin Information

For evaluation and demonstration purposes, pre-configured demo credentials are supported in the frontend auth system:

- **Student Login**:
  - Email: `aarav.sharma@example.com`
  - Role: `Student`
- **Admin Login**:
  - Email: `admin@scholarshipfinder.org`
  - Role: `Admin / Nodal Officer`

---

## 12. Future Scope

- **DigiLocker Integration**: Direct API connection for instant verification of Income and Domicile certificates.
- **AI Document OCR Scanner**: Automatic parsing of marksheets and income certificates to auto-fill eligibility parameters.
- **Push & SMS Reminders**: Automated notifications sent 7 days prior to scholarship closing dates.
- **Institute Nodal Portal**: Dedicated dashboard for college student-section staff to bulk-verify fee waiver applications.

---

## 13. Project Team

- **Student Name**: [Your Name Here]
- **Roll Number / PRN**: [Your PRN / ID Here]
- **Branch / Department**: Computer Science & Engineering / Information Technology
- **Institute Name**: [Your College Name Here]
- **Guide / Mentor**: [Industry Mentor / Guide Name Here]
