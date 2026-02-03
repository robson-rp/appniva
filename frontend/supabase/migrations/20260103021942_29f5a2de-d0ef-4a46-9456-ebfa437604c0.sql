-- Create enum for priority levels
CREATE TYPE public.recommendation_priority AS ENUM ('low', 'medium', 'high');

-- Create daily_recommendations table
CREATE TABLE public.daily_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_label TEXT NOT NULL,
  action_route TEXT NOT NULL,
  priority recommendation_priority NOT NULL DEFAULT 'low',
  generated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.daily_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own recommendations
CREATE POLICY "Users can insert their own recommendations"
  ON public.daily_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own recommendations
CREATE POLICY "Users can delete their own recommendations"
  ON public.daily_recommendations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_daily_recommendations_user_date ON public.daily_recommendations (user_id, generated_at DESC);

-- Create unique constraint to ensure only one recommendation per user per day
CREATE UNIQUE INDEX idx_daily_recommendations_unique_per_day ON public.daily_recommendations (user_id, generated_at);