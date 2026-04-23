# Download & Lead Magnet System

Complete file upload and lead magnet system for capturing leads with ebooks, PDFs, and digital products.

## 🎯 Features

- ✅ **File Upload** - Drag-and-drop or browse to upload
- ✅ **Multiple File Types** - PDF, EPUB, DOC, DOCX, images, ZIP
- ✅ **Email Capture** - Require email before download
- ✅ **Download Tracking** - Track who downloaded what
- ✅ **Lead Generation** - Auto-capture leads to database
- ✅ **Storage Management** - Files stored in Supabase Storage
- ✅ **Download Links** - Shareable tracked links
- ✅ **Analytics** - Download counts and engagement

## 📋 Setup Instructions

### 1. Run Database Migration

Run this SQL in your Supabase SQL Editor:

```bash
# Copy migration file contents
cat infra/migrations/add_downloads_tables.sql

# Or run via script
./run-migration.sh infra/migrations/add_downloads_tables.sql
```

This creates:

- `downloads` table - Store file metadata
- `download_logs` table - Track download activity
- `downloads` storage bucket - Store actual files
- Row Level Security policies
- Indexes for performance

### 2. Verify Storage Bucket

Go to your Supabase dashboard:

1. Navigate to **Storage**
2. Verify `downloads` bucket exists
3. Check that it's set to **Public** access
4. Policies should allow authenticated users to upload

## 📁 File Structure

```text
apps/web/src/
├── app/
│   ├── api/
│   │   ├── uploads/
│   │   │   └── route.ts          # Upload/list/delete files
│   │   └── downloads/
│   │       └── [id]/
│   │           └── route.ts      # Download tracking endpoint
│   ├── downloads/
│   │   └── page.tsx              # Downloads management page
│   └── example-download/
│       └── page.tsx              # Example funnel page
└── components/
    ├── UploadManager.tsx         # Drag-drop upload UI
    └── DownloadGate.tsx          # Email capture widget
```

## 🚀 Usage Guide

### For Admins: Upload Files

1. Go to `/downloads` page
2. Drag-drop or click to browse for file
3. Enter title and description
4. Click "Upload File"
5. Copy the generated download link

### For Funnels: Add Download Gate

Use the `DownloadGate` component in any funnel page:

```tsx
import DownloadGate from '@/components/DownloadGate';

export default function MyFunnelPage() {
  return (
    <div>
      <h1>Get Your Free Ebook</h1>
      
      <DownloadGate
        downloadId="YOUR_DOWNLOAD_ID_HERE"
        title="Download Your Free Ebook"
        description="Enter your email to get instant access"
        buttonText="Get Free Ebook"
        funnelId="my-funnel-id"
      />
    </div>
  );
}
```

### Get Download ID

After uploading a file:

1. Go to `/downloads` page
2. Find your file
3. Click the **Copy** button
4. The download URL contains the ID: `/api/downloads/{ID}`
5. Use that ID in the `DownloadGate` component

## 🔧 API Endpoints

### Upload File

```bash
POST /api/uploads
Content-Type: multipart/form-data

FormData:
- file: File (required)
- title: string (required)
- description: string (optional)

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Ebook",
    "file_name": "ebook.pdf",
    "storage_url": "https://...",
    "download_count": 0
  }
}
```

### List Downloads

```bash
GET /api/uploads

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "My Ebook",
      "file_name": "ebook.pdf",
      "file_size": 1048576,
      "download_count": 42
    }
  ]
}
```

### Delete File

```bash
DELETE /api/uploads?id={download_id}

Response:
{
  "success": true,
  "message": "Download deleted successfully"
}
```

### Track Download

```bash
GET /api/downloads/{id}?email={email}&funnelId={funnelId}

- Captures lead with email
- Logs download event
- Increments download counter
- Redirects to file

Response:
302 Redirect to storage_url
```

## 📊 Database Schema

### downloads table

```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES users(id)
title           text NOT NULL
description     text
file_name       text NOT NULL
file_path       text NOT NULL
file_size       bigint NOT NULL
file_type       text NOT NULL
storage_url     text NOT NULL
download_count  integer DEFAULT 0
is_active       boolean DEFAULT true
require_email   boolean DEFAULT true
created_at      timestamp
updated_at      timestamp
```

### download_logs table

```sql
id              uuid PRIMARY KEY
download_id     uuid REFERENCES downloads(id)
email           text NOT NULL
ip_address      text
user_agent      text
funnel_id       uuid REFERENCES funnels(funnel_id)
downloaded_at   timestamp
```

## 🎨 Customization

### Customize DownloadGate Appearance

The `DownloadGate` component accepts these props:

```tsx
interface DownloadGateProps {
  downloadId: string;      // Required: Download ID from uploads
  title?: string;          // Optional: Custom heading
  description?: string;    // Optional: Custom description
  buttonText?: string;     // Optional: Custom button text
  funnelId?: string;       // Optional: For tracking
}
```

### Change File Size Limit

Edit `/apps/web/src/app/api/uploads/route.ts`:

```typescript
// Change from 50MB to 100MB
const maxSize = 100 * 1024 * 1024;
```

### Add More File Types

Edit allowed types in `/apps/web/src/app/api/uploads/route.ts`:

```typescript
const allowedTypes = [
  'application/pdf',
  'application/epub+zip',
  // Add more types here
  'video/mp4',
  'audio/mpeg',
];
```

## 📈 Analytics

### View Download Stats

On the `/downloads` page, you can see:

- Total downloads per file
- File size and type
- Upload date
- Active/inactive status

### Query Download Logs

```sql
-- Get all downloads for a file
SELECT * FROM download_logs
WHERE download_id = 'your-download-id'
ORDER BY downloaded_at DESC;

-- Get download count by email
SELECT email, COUNT(*) as download_count
FROM download_logs
GROUP BY email
ORDER BY download_count DESC;

-- Get downloads by funnel
SELECT 
  d.title,
  COUNT(dl.id) as downloads
FROM downloads d
LEFT JOIN download_logs dl ON d.id = dl.download_id
WHERE dl.funnel_id = 'your-funnel-id'
GROUP BY d.id, d.title;
```

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only manage their own files
- ✅ File type validation
- ✅ File size limits
- ✅ Authenticated uploads only
- ✅ Public downloads (with tracking)

## 🎯 Best Practices

1. **Use Clear Titles** - Help users understand what they're downloading
2. **Add Descriptions** - Provide context about the download
3. **Track Funnels** - Always include `funnelId` for attribution
4. **Require Email** - Set `require_email: true` to capture leads
5. **Monitor Storage** - Check Supabase storage usage regularly
6. **Optimize Files** - Compress PDFs before uploading

## 🐛 Troubleshooting

### Upload Fails

1. Check file size (max 50MB)
2. Verify file type is allowed
3. Ensure user is authenticated
4. Check Supabase storage bucket exists

### Download Link Doesn't Work

1. Verify download is `is_active: true`
2. Check storage bucket is public
3. Ensure download ID is correct
4. Check RLS policies in Supabase

### Email Not Capturing

1. Verify `require_email: true` in downloads table
2. Check leads table exists
3. Verify email format is valid
4. Check API logs for errors

## 📝 Example Use Cases

1. **Free Ebook Funnel** - Give away ebook, capture email, upsell course
2. **Resource Library** - Members-only downloads section
3. **Lead Magnets** - PDF guides, checklists, templates
4. **Bonus Content** - Exclusive downloads for customers
5. **Templates** - Downloadable business templates

## 🔗 Integration with Funnels

### Visual Builder Integration

When building funnels, you can:

1. Upload lead magnet to `/downloads`
2. Copy the download link
3. Add `DownloadGate` component to funnel
4. Track conversions with `funnelId`

### Example Funnel Flow

```text
Landing Page
    ↓
Email Capture (DownloadGate)
    ↓
Download File (tracked)
    ↓
Thank You Page
    ↓
Email Sequence (Autoresponder)
```

## 📧 Email Integration

Downloads automatically:

- Add leads to `leads` table
- Can trigger email automations
- Include download info in metadata

```sql
-- Find leads from downloads
SELECT * FROM leads
WHERE source = 'download'
AND metadata->>'download_id' = 'your-download-id';
```

## 🚀 Next Steps

1. Upload your first lead magnet
2. Create a funnel page with `DownloadGate`
3. Share the link and start capturing leads
4. Monitor downloads in `/downloads` page
5. Set up email automation for new leads
