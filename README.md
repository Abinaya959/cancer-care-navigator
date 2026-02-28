# Cancer Care Navigator

Cancer Care Navigator is a role-based District Cancer Intelligence and Screening Management Platform designed to support data-driven healthcare decision-making at the district level.

The system enables administrators, clinicians, and health workers to monitor cancer burden, screening coverage, referral tracking, and treatment progress through structured dashboards and analytics.

---

## 🚀 Project Overview

Cancer Care Navigator addresses critical gaps in district-level cancer monitoring:

• Late-stage cancer detection  
• Low screening coverage  
• Unequal oncology infrastructure  
• Poor referral tracking  
• Lack of role-based healthcare governance systems  

This platform provides a scalable and secure solution for structured cancer intelligence and public health monitoring.

---

## 🏥 Core Features

### 🔐 Role-Based Access Control
• Admin Dashboard  
• Doctor Dashboard  
• Health Worker Dashboard  
• Public Awareness Interface  

### 📊 District Intelligence
• District risk score calculation  
• Screening coverage monitoring  
• Infrastructure gap analysis  
• Oncology center distribution tracking  

### 👩‍⚕️ Clinical Monitoring
• Patient registry management  
• Stage distribution analytics  
• Referral and treatment tracking  
• Follow-up monitoring  

### 🧾 Audit Logging
• Tracks create, update, and delete actions  
• Records timestamp and user role  
• Ensures transparency and accountability  

---

## 🧠 Risk Score Model

The district-level Risk Score is calculated based on:

• Late-stage cancer proportion  
• Screening coverage gap  
• Oncology center availability  

This enables ranking districts based on healthcare vulnerability and early detection gaps.

---

## 🛠 Technology Stack

Frontend:
• React  
• TypeScript  
• Tailwind CSS  

Backend:
• Supabase (PostgreSQL)  
• Row-Level Security (RLS)  

Data Handling:
• React Query  
• Structured district-level dataset  

Analytics:
• Chart-based visualizations (Bar, Line, Pie)

---

## 📁 Project Structure
src/
├── components/

├── dashboards/

├── hooks/

├── context/

├── lib/

├── integrations/

└── pages/


---

## 🔒 Security Model

• Role-based route protection  
• Supabase authentication  
• Row-Level Security policies  
• Controlled CRUD access per user role  
• Audit trail for all data modifications  

---

## 📈 Scalability

The system can be extended to:

• Other Indian states  
• National-level health governance  
• Additional diseases (TB, Diabetes, Maternal Health)  
• Integration with official cancer registries  

---

## ⚙️ Installation

Clone the repository:

git clone <repository-url>

Navigate to the project directory:

cd cancer-care-navigator

Install dependencies:


npm install


Run development server:


npm run dev


Build for production:


npm run build


---

## 🎯 Purpose

Cancer Care Navigator demonstrates a scalable, role-secure, data-driven digital health governance model that enhances transparency, improves early detection visibility, and supports informed decision-making in district-level healthcare systems.

---

## 👩‍💻 Developed For

TNWISE 2026 – Tamil Nadu Hackathon for Women in Science & Engineering  

SRM Madurai College for Engineering and Technology  
Department of Artificial Intelligence & Data Science
