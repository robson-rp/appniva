-- Create tags table
CREATE TABLE public.tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage own tags"
ON public.tags
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create transaction_tags junction table
CREATE TABLE public.transaction_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(transaction_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for transaction_tags
CREATE POLICY "Users can manage own transaction tags"
ON public.transaction_tags
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.transactions t
        WHERE t.id = transaction_id AND t.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.transactions t
        WHERE t.id = transaction_id AND t.user_id = auth.uid()
    )
);