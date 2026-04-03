# PPOBID Admin Panel

A modern, responsive admin panel built with Next.js 14 for managing the PPOBID payment platform.

## 🚀 Features

- **Authentication**: JWT-based login system with mock credentials (development mode)
- **Dashboard**: Overview with key metrics, stats cards, and recent transactions
- **User Management**: View, search, and manage user accounts
- **Transaction Management**: Monitor all platform transactions
- **Deposit Management**: Handle deposit requests and approvals
- **QRIS Management**: Monitor QRIS payments and generate codes
- **Voucher Management**: Create and manage promotional vouchers
- **Settings**: Configure system and admin panel settings

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## 🛠️ Installation

The project is already set up in `/admin-panel`. To start working:

1. Navigate to the admin panel directory:
   ```bash
   cd d:\ppobid\admin-panel
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🔐 Login Credentials (Development)

Currently, the admin panel uses mock authentication for development:

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── app/
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Dashboard and all feature pages
│   │   │   ├── users/          # User management
│   │   │   ├── transactions/   # Transaction management
│   │   │   ├── deposits/       # Deposit management
│   │   │   ├── qris/           # QRIS management
│   │   │   ├── vouchers/       # Voucher management
│   │   │   └── settings/       # Settings
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   └── page.tsx            # Home/redirect page
│   ├── components/
│   │   └── layout/             # Layout components (Sidebar, Navbar)
│   └── lib/
│       ├── api/
│       │   ├── client.ts       # Axios API client
│       │   └── endpoints/      # API endpoint definitions
│       ├── auth/               # Authentication providers
│       ├── config.ts           # Configuration constants
│       └── utils.ts            # Utility functions
├── .env.local                   # Environment variables
└── package.json
```

## 🔧 Configuration

### Environment Variables

Edit `.env.local` to configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Your backend API URL
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Connecting to Your Backend

The admin panel is currently using mock data. To connect to your real API:

1. Update `NEXT_PUBLIC_API_URL` in `.env.local`
2. Edit `/src/lib/api/endpoints/auth.ts` to use real API calls
3. Create additional endpoint files in `/src/lib/api/endpoints/` for other features

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Query (ready to use)
- **Forms**: React Hook Form + Zod (installed, ready to use)
- **Charts**: Recharts (installed, ready to use)

## 📝 Development

### Adding New Pages

1. Create a new folder in `src/app/dashboard/`
2. Add a `page.tsx` file with your component
3. Add navigation link in `src/components/layout/Sidebar.tsx`

### Building for Production

```bash
npm run build
npm start
```

## 🚧 Current Status

**Implemented:**
- ✅ Authentication system with JWT
- ✅ Protected routes
- ✅ Dashboard with stats and recent transactions
- ✅ User management page with search functionality
- ✅ Responsive sidebar navigation
- ✅ Modern UI with Tailwind CSS

**In Progress (Placeholder Pages):**
- 🔄 Transaction management (basic page created)
- 🔄 Deposit management (basic page created)
- 🔄 QRIS management (basic page created)
- 🔄 Voucher management (basic page created)
- 🔄 Settings (basic page created)

**To Implement:**
- ⏳ Full CRUD operations for all entities
- ⏳ Real-time data fetching from backend
- ⏳ Advanced filtering and sorting
- ⏳ Data export functionality
- ⏳ Charts and analytics
- ⏳ Notification system

## 📚 Next Steps

1. **Connect Backend API**: Replace mock data with real API calls
2. **Implement Features**: Complete the placeholder pages with full functionality
3. **Add Validations**: Use React Hook Form and Zod for form validation
4. **Enhance UI**: Add more interactive components using shadcn/ui
5. **Testing**: Add unit and integration tests
6. **Deployment**: Deploy to production environment

## 🤝 Contributing

This is an internal admin panel. Contact the development team for contribution guidelines.

## 📄 License

Private - Internal use only

---

**Developed for PPOBID Payment Platform**
