Here are all the details of the 5 storage buckets in your VaultScout Supabase project:[1][2]

## Storage Buckets Overview

**Project:** VaultScout  
**Organization:** codAthon (Free tier)  
**Environment:** main (Production)

***

### 1. **vs-temp-private**
- **Bucket ID:** vs-temp-private
- **Access Type:** Public
- **Purpose:** Temporary file storage
- **Policies:** 0 (No RLS policies configured)
- **File Size Limit:** Unset (Default: 50 MB)
- **Allowed MIME Types:** Any
- **Description:** For temporary files that need public read access

---

### 2. **vs-exports-private**
- **Bucket ID:** vs-exports-private
- **Access Type:** Public
- **Purpose:** Export file storage
- **Policies:** 0 (No RLS policies configured)
- **File Size Limit:** Unset (Default: 50 MB)
- **Allowed MIME Types:** Any
- **Description:** For exported documents/data with public read access

***

### 3. **vs-previews-public**
- **Bucket ID:** vs-previews-public
- **Access Type:** Public
- **Purpose:** Preview/thumbnail storage
- **Policies:** 0 (No RLS policies configured)
- **File Size Limit:** Unset (Default: 50 MB)
- **Allowed MIME Types:** Any
- **Description:** For file previews and thumbnails accessible publicly

***

### 4. **vs-extracted-private**
- **Bucket ID:** vs-extracted-private
- **Access Type:** Public
- **Purpose:** Extracted content storage
- **Policies:** 0 (No RLS policies configured)
- **File Size Limit:** Unset (Default: 50 MB)
- **Allowed MIME Types:** Any
- **Description:** For extracted text/data from documents with public read access

***

### 5. **vs-raw-private**
- **Bucket ID:** vs-raw-private
- **Access Type:** Public
- **Purpose:** Raw file storage
- **Policies:** 0 (No RLS policies configured)
- **File Size Limit:** Unset (Default: 50 MB)
- **Allowed MIME Types:** Any
- **Description:** For original uploaded files with public read access

---

## Key Notes:
- ✅ All buckets are created and active
- ⚠️ All buckets are set to **Public** (anyone can read objects without authorization)
- ⚠️ **No RLS policies** are configured on any bucket (0 policies each)
- ⚠️ No file size restrictions (defaults to 50 MB per file)
- ⚠️ All MIME types are allowed (no restrictions on file types)

## Security Recommendations:
Given this is for your legal research chatbot (VaultScout), you may want to:
1. **Review the "Public" setting** - Consider if all buckets should truly be public
2. **Add RLS policies** - Implement Row Level Security policies for better access control
3. **Set file size limits** - Based on your expected document sizes
4. **Restrict MIME types** - Limit to PDF, DOCX, TXT, etc. for legal documents