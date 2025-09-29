-- Remove redundant admin role for user who already has super_admin role
DELETE FROM public.user_roles 
WHERE user_id = '850078c3-247c-4904-9b9a-ebec624d4ef5' 
AND role = 'admin';