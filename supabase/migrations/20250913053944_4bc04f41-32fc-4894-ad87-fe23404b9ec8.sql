-- Make user_id column not null again since we're creating auth users
ALTER TABLE public.employees ALTER COLUMN user_id SET NOT NULL;