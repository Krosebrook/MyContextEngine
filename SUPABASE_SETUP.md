# Supabase Setup Instructions

This application uses Supabase for real-time updates and file storage. Follow these steps to set up your Supabase project:

## 1. Create Tables in Supabase

Go to your Supabase project's SQL Editor and run the SQL from `supabase-schema.sql`:

```sql
-- Copy and paste the contents of supabase-schema.sql here
```

This will create:
- `jobs` table with real-time enabled
- `files` table with real-time enabled  
- `kb_entries` table with real-time enabled
- `organized-files` storage bucket for file storage

## 2. Enable Realtime

Make sure Realtime is enabled for your tables:

1. Go to Database → Replication in your Supabase dashboard
2. Enable replication for tables: `jobs`, `files`, `kb_entries`

## 3. Configure Environment Variables

### Backend (Already set via Replit Secrets):
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your anonymous/public key

### Frontend (Need to add):
Create a `.env` file in the root with:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 4. Storage Bucket Policies

The schema automatically creates policies, but verify:
- Bucket name: `organized-files`
- Public: No (private files)
- Policies: Allow authenticated uploads and reads

## How Real-time Works

1. **File Upload** → Synced to both Neon (processing) and Supabase (real-time)
2. **Job Processing** → Status updates pushed to Supabase instantly
3. **Frontend Subscriptions** → Jobs page listens for changes and updates UI in real-time
4. **No Polling** → Jobs page doesn't refresh every 5 seconds anymore - updates are instant!

## Benefits

- ✅ Instant job status updates (no 5-second polling delay)
- ✅ Live dashboard metrics
- ✅ Real-time knowledge base updates
- ✅ File storage with signed URLs for secure downloads
- ✅ Scalable architecture with dual database strategy
