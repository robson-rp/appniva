-- Add payment_proof_url column to school_fees table
ALTER TABLE public.school_fees 
ADD COLUMN payment_proof_url TEXT;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-fee-receipts', 'school-fee-receipts', false);

-- Create policies for storage bucket
CREATE POLICY "Users can view their own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'school-fee-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'school-fee-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'school-fee-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);