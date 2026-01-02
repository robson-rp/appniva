-- Create security_logs table for tracking user activity
CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  device_info TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own security logs
CREATE POLICY "Users can view their own security logs"
  ON public.security_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own security logs
CREATE POLICY "Users can insert their own security logs"
  ON public.security_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_security_logs_user_date ON public.security_logs (user_id, created_at DESC);