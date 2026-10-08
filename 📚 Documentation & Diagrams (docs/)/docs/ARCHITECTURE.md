# 🏗️ Technical Architecture & Data System Specification

> **Project Name**: Scholarship & Fee Waiver Finder  
> **Target Platform**: Desktop, Tablet & Mobile Web  
> **Architecture Model**: Single Page Application (SPA) with Client-Side Smart Match Engine & Modular Component Rendering  

---

## 1. System High-Level Architecture

The **Scholarship & Fee Waiver Finder** application is engineered as a highly performant, client-side Single Page Application (SPA). All eligibility matching, document dependency resolution, financial calculations, and views are dynamically rendered without page reloads.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Navbar & Theme Engine | View Switching Engine | Modals      │ │
│ └──────────────────────────────┬──────────────────────────────┘ │
└────────────────────────────────┼────────────────────────────────┘
                                 │ Dynamic Rendering
┌────────────────────────────────▼────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                      │
│ ┌──────────────────────────────┬──────────────────────────────┐ │
│ │ 100-Pt Smart Match Engine    │ Reverse Document Mapper      │ │
│ ├──────────────────────────────┼──────────────────────────────┤ │
│ │ Financial Aid Calculator     │ Scheme Comparison Engine     │ │
│ └──────────────────────────────┴──────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Verified In-Memory Dataset
┌────────────────────────────────▼────────────────────────────────┐
│                        DATA ENGINE LAYER                        │
│ ┌──────────────────────────────┬──────────────────────────────┐ │
│ │ MOCK_SCHOLARSHIPS (Verified) │ MASTER REQUIRED DOCUMENTS    │ │
│ ├──────────────────────────────┼──────────────────────────────┤ │
│ │ MOCK_FEE_WAIVERS (Verified)  │ Student Profile State        │ │
│ └──────────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 100-Point Weighted Smart Match Engine

The engine calculates match scores between a student's profile ($P$) and scholarship eligibility rules ($S$) using a weighted multi-factor scoring formula:

$$\text{Match Score} = W_{\text{state}} + W_{\text{level}} + W_{\text{income}} + W_{\text{course}} + W_{\text{category}} + W_{\text{marks}} + W_{\text{gender}}$$

### Weighted Factor Allocation
1. **State / Domicile ($W_{\text{state}} = 20\%$)**:
   - Exact state match or scheme marked as `"All India"` $\rightarrow$ 20 Points.
2. **Education Level ($W_{\text{level}} = 20\%$)**:
   - Matches candidate's level (UG, PG, Diploma, School) $\rightarrow$ 20 Points.
3. **Annual Family Income Ceiling ($W_{\text{income}} = 20\%$)**:
   - Candidate income $\le$ Scholarship Income Limit $\rightarrow$ 20 Points.
   - Candidate income $> 1.5 \times$ Limit $\rightarrow$ 0 Points.
4. **Enrolled Course / Stream ($W_{\text{course}} = 15\%$)**:
   - Exact course match or unrestricted `"All"` $\rightarrow$ 15 Points.
5. **Caste Category ($W_{\text{category}} = 10\%$)**:
   - Category included in eligible array $\rightarrow$ 10 Points.
6. **Academic Percentage / Marks ($W_{\text{marks}} = 10\%$)**:
   - Candidate marks $\ge$ Minimum Percentage $\rightarrow$ 10 Points.
7. **Gender Specificity ($W_{\text{gender}} = 5\%$)**:
   - Gender match or unrestricted `"All"` $\rightarrow$ 5 Points.

---

## 3. Reverse Document-to-Scheme Mapping

Instead of presenting generic document lists, the platform maps each certificate in the student's document vault back to every eligible scheme requiring it:

$$\text{Reverse Mapping}(D_k) = \{ S_i \in \text{Matched Schemes} \mid D_k \in S_i.\text{requiredDocuments} \}$$

This gives students immediate clarity on *why* a particular document (e.g., *Income Certificate* or *Caste Validity*) is necessary.

---

## 4. Application Readiness Index (%)

The application readiness percentage is computed dynamically across three pillars:

$$\text{Readiness Score} = (\text{Profile Completeness} \times 0.40) + (\text{Document Verification} \times 0.40) + (\text{Eligibility Threshold} \times 0.20)$$

---

## 5. Future Backend Integration Roadmap

When transitioning from the current SPA client-side engine to a full Node.js / Express / MySQL stack:

1. **REST API endpoints**:
   - `GET /api/scholarships`
   - `POST /api/match`
   - `GET /api/documents/reverse-map`
   - `POST /api/applications`
2. **Authentication**: JWT-based session handling with bcrypt password hashing.
3. **Database Integration**: Connect `app.js` API calls to MySQL via `mysql2` or `Knex.js` ORM executing `database/schema.sql`.
