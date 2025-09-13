-- Delete employees with null user_id first
DELETE FROM public.employees WHERE user_id IS NULL;

-- Now make user_id not null
ALTER TABLE public.employees ALTER COLUMN user_id SET NOT NULL;