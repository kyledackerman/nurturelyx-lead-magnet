# Admin Setup Guide

## Making Users Admin

To grant admin access to users, you have several options:

### Option 1: Using the Edge Function (Recommended)

Call the `make-admin` edge function with a user's email:

```bash
curl -X POST https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Option 2: Direct Database Query

Run this SQL query in the Supabase SQL Editor to make a user admin:

```sql
-- Replace 'user@example.com' with the actual user email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'user@example.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);
```

### Option 3: Making Yourself Admin

If you want to make yourself admin, first sign up for an account, then use either method above with your email address.

## Admin Access

Once a user has admin role:

1. They can access `/admin` route
2. They can view ALL reports (public and private) from all users
3. They can see comprehensive analytics and user data
4. Regular users can only see their own private reports and public reports

## Security Notes

- Admin access is now properly authenticated through Supabase
- RLS policies ensure data security
- Only authenticated users with admin role can access admin features
- The old hardcoded password system has been removed

## Admin Dashboard Features

- View all submitted reports
- See user analytics and statistics
- Search and filter reports
- View private reports from all users (admin only)
- Copy report URLs and user information