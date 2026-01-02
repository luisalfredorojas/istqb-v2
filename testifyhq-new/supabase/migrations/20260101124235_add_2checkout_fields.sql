-- Add 2Checkout specific fields to payment_history table
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS refno VARCHAR(255),
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(255);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_refno ON payment_history(refno);
CREATE INDEX IF NOT EXISTS idx_payment_external_ref ON payment_history(external_reference);

-- Comment for documentation
COMMENT ON COLUMN payment_history.refno IS '2Checkout reference number (REFNO)';
COMMENT ON COLUMN payment_history.external_reference IS '2Checkout order number (ORDERNO)';
