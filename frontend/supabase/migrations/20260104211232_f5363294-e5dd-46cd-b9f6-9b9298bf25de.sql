-- Add OTNR (Obrigações do Tesouro Nacional Reajustáveis) to product types
ALTER TYPE financial_product_type ADD VALUE IF NOT EXISTS 'bond_otnr';