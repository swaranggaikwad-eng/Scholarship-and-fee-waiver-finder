# 📊 UML & Entity-Relationship (ER) Diagrams

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENT_PROFILES : "has"
    USERS ||--o{ APPLICATIONS : "submits"
    USERS ||--o{ STUDENT_DOCUMENTS : "uploads"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    SCHOLARSHIPS ||--o{ APPLICATIONS : "receives"
    SCHOLARSHIPS ||--o{ SCHOLARSHIP_DOCUMENTS : "requires"
    REQUIRED_DOCUMENTS ||--o{ SCHOLARSHIP_DOCUMENTS : "mapped_in"
    REQUIRED_DOCUMENTS ||--o{ STUDENT_DOCUMENTS : "fulfilled_by"

    USERS {
        int user_id PK
        string full_name
        string email
        string password_hash
        string role
    }

    STUDENT_PROFILES {
        int profile_id PK
        int user_id FK
        string state
        string education_level
        string course
        decimal family_income
        string category
        decimal percentage
    }

    SCHOLARSHIPS {
        string scholarship_id PK
        string title
        string provider
        decimal amount
        decimal max_income
        string gender_restriction
        date deadline
        boolean is_real_data
    }

    REQUIRED_DOCUMENTS {
        string doc_id PK
        string doc_name
        string category
        string expiry_period
    }

    APPLICATIONS {
        int application_id PK
        int user_id FK
        string scholarship_id FK
        string status
        date applied_date
    }
```

---

## 2. System Sequence Diagram (Profile -> Smart Match -> Document Check)

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend SPA (index.html/app.js)
    participant Engine as 100-Pt Smart Match Engine
    participant DocMap as Reverse Document Mapper
    participant Data as Verified Dataset (mockData.js)

    Student->>UI: Enter Personal & Academic Details
    Student->>UI: Click "Find My Scholarships"
    UI->>Engine: Pass Student Profile Object
    Engine->>Data: Read Verified Scholarships Array
    Engine->>Engine: Calculate Weighted Multi-Factor Scores
    Engine-->>UI: Return Ranked Schemes List with Match %
    UI->>DocMap: Request Reverse Document Mapping for Matched Schemes
    DocMap-->>UI: Return Required Certificates & Scheme Dependencies
    UI-->>Student: Display Eligible Schemes, Match Badges & Readiness Meter
```

---

## 3. Component Architecture Diagram

```mermaid
graph TD
    A["User Browser"] --> B["Navbar & View Controller"]
    B --> C["Home Landing Page"]
    B --> D["Eligibility Checker View"]
    B --> E["Scholarship Finder Directory"]
    B --> F["Document Vault Tracker"]
    B --> G["Student Dashboard"]
    
    D --> H["100-Pt Weighted Match Engine"]
    H --> I["Verified Real Dataset (mockData.js)"]
    F --> J["Reverse Document Dependency Mapper"]
    J --> I
    E --> K["Comparison Matrix Engine"]
```
