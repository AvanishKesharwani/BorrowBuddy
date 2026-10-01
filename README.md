# BorrowBuddy 🤝

> **Student-to-Student Borrowing & Rental Platform for IIIT-Naya Raipur**  
> Physical equipment, lab kits, calculators, and books shared across Raman and Shabri hostels.

> 🎓 **Teacher Presentation & Code Architecture Guide:**  
> For the complete file directory cheat sheet, live evaluation script, and viva Q&A, check out **[PRESENTATION_GUIDE.md](./PRESENTATION_GUIDE.md)**!  
> Every source file across this codebase has been documented with teacher-ready explanation banners and step-by-step logic comments.

![BorrowBuddy Platform](public/logo.png)

---

## 🌟 Key Features

1. **Dual Borrowing & Rental Modes**:
   - **Free Borrowing**: For academic calculators, reference books, presentation adapters.
   - **Affordable Daily Rental**: For hardware development boards, monitors, cycles.
2. **Strict Institutional Authentication**:
   - Scoped to IIIT-NR student IDs and `@iiitnr.edu.in` accounts.
   - Hostels supported: **Raman Boys Hostel** & **Shabri Girls Hostel**.
3. **Two-Step Physical Handover & Return Protocol**:
   - Step 1: Borrower marks item as returned.
   - Step 2: Lender physically inspects and confirms receipt before status flips to Available.
4. **Automated Penalty & Reliability Score System**:
   - Calculates 5% daily penalties past deadlines (capped at 50% of declared value).
   - Dynamically updates student trust and reliability ratings.
5. **Interactive Time-Travel Simulation**:
   - Fast-forward campus time (+1 day, +3 days, overdue) directly from the Demo Bar to preview notifications and penalty flows.
6. **Campus Trust Index & Disputes Resolution**:
   - Peer reviews and star ratings after each successful return.
   - Institutional Disputes Center with admin dispute resolution powers.
7. **Apple-Grade Modern UI/UX**:
   - **Dark Mode & Light Mode** with persistent theme toggle and zero FOUC.
   - **Custom 3D Emblem Logo** optimized with high contrast and ambient glow.
   - **Automatic Navbar Hover Dropdowns** with a safe mouse-leave buffer.
   - **Fluid Morphing Tab Animations** powered by `framer-motion`.

---

## 📁 Repository Structure & What to Share

When sharing or cloning this repository, the project is organized as follows:

```
BorrowBuddy/
├── src/                  # All React & Next.js source code (Pages, Components, API Routes)
│   ├── app/              # Next.js 14 App Router (explore, borrowings, lent, admin, items, api)
│   ├── components/       # UI Components (Navbar, ItemCard, Modals, ThemeToggle, Logo)
│   └── lib/              # Shared utilities, Prisma client, demo data helpers
├── public/               # Public assets (logo.png, icon.png, favicon.ico, images)
├── prisma/               # Database schema & automated seed script
│   ├── schema.prisma     # Prisma ORM models
│   └── seed.ts           # Demo users & campus items seeder
├── package.json          # Project dependencies & scripts
├── tailwind.config.ts    # Tailwind styling & dark mode configuration
└── README.md             # Project documentation & setup instructions
```

> **Note on Ignored Folders**: The `node_modules/` and `.next/` folders are automatically excluded by `.gitignore`. Anyone who downloads or clones your repository simply runs `npm install` to get the dependencies.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17 or higher recommended)
- `npm` (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd BorrowBuddy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize & Seed Database
```bash
# Push Prisma schema to local SQLite database
npx prisma db push

# Populate with demo students, items, and transactions
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing & Simulation Suite

Run the full end-to-end automated simulation test:
```bash
npm run test:demo
```
This tests:
- User verification (Arjun, Priya, Rohan, Admin)
- Borrow request creation & physical handover confirmation
- Two-step return acceptance workflow
- 5-star rating submission
- Time travel (+72 hours) and overdue penalty calculations (5%/day)

---

## 👥 Demo Accounts

You can switch between any demo user with 1 click using the **BorrowBuddy Demo Bar** at the top of the screen:

| Name | Role | Student ID / Email | Default Password |
| :--- | :--- | :--- | :--- |
| **Arjun Mehta** | Student (1st Yr DSAI) | `IIITNR-2026-001` / `arjun@iiitnr.edu.in` | `password123` |
| **Priya Sharma** | Student (2nd Yr CSE) | `IIITNR-2025-014` / `priya@iiitnr.edu.in` | `password123` |
| **Rohan Verma** | Student (3rd Yr ECE) | `IIITNR-2024-032` / `rohan@iiitnr.edu.in` | `password123` |
| **Admin Authority** | Institutional Admin | `admin@iiitnr.edu.in` | `admin123` |

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Apple Liquid Glass UI
- **Database & ORM**: SQLite & [Prisma ORM](https://www.prisma.io/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: Lucide React
- **Authentication**: JWT & HTTP-only cookies
