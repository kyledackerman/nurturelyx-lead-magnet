-- Make kyle@nurturely.io an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'kyle@nurturely.io'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.users.id AND role = 'admin'
);