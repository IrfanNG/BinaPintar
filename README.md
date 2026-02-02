# BinaPintar (Smart Construction CMS)

A simplified MVP for a construction management system that tracks site progress and document expiries.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

## Features

- **Dashboard**: Overview of active projects and expiring permits
- **Project Management**: View all projects with status tracking
- **Site Logs**: Timeline view of site progress with photo uploads
- **Permit Tracking**: Color-coded expiry date management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Storage)
- **Icons**: Lucide React

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works)

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Go to your Supabase project's **SQL Editor** and run the following SQL files in order:

1. **Schema** (`database/schema.sql`) - Creates tables and policies
2. **Storage** (`database/storage-setup.sql`) - Creates storage bucket for photos
3. **Sample Data** (`database/sample-data.sql`) - (Optional) Adds test data

### 4. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Dashboard page
│   ├── projects/
│   │   ├── page.tsx            # Projects list
│   │   └── [id]/
│   │       └── page.tsx        # Project detail with site logs
│   └── permits/
│       └── page.tsx            # Permits table
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   └── BottomNav.tsx       # Mobile bottom navigation
│   ├── site-logs/
│   │   ├── SiteLogTimeline.tsx # Timeline component
│   │   └── AddSiteLogDialog.tsx # Add site log modal
│   └── ui/                     # Shadcn UI components
└── lib/
    ├── supabase.ts             # Supabase client
    └── services/
        ├── projects.ts         # Project CRUD
        ├── site-logs.ts        # Site log CRUD + photo upload
        └── permits.ts          # Permits CRUD
```

## Design

- **Theme**: Professional Industrial (Dark)
- **Primary**: Slate-900 (#0f172a)
- **Accent**: Blue-600 (#2563eb)
- **Status Colors**:
  - 🟢 Active/Valid: Emerald-500
  - 🟡 Expiring Soon: Amber-500
  - 🔴 Expired: Red-500

## Mobile Responsiveness

- Sidebar navigation on desktop (≥1024px)
- Bottom navigation bar on mobile
- Responsive card layouts
- Touch-friendly upload interface with camera capture support

## License

MIT
