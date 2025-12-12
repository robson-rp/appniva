-- Add is_suspended column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_suspended boolean NOT NULL DEFAULT false;

-- Add suspended_at timestamp to track when suspension occurred
ALTER TABLE public.profiles 
ADD COLUMN suspended_at timestamp with time zone DEFAULT NULL;

-- Add suspended_by to track which admin suspended the user
ALTER TABLE public.profiles 
ADD COLUMN suspended_by uuid DEFAULT NULL;