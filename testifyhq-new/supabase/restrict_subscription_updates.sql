-- Update RLS policies to prevent client-side subscription_tier manipulation
-- Only Edge Functions (service_role) can update subscription_tier

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create a more restrictive policy that prevents updating subscription_tier from client
CREATE POLICY "Users can update own profile (limited)"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from changing their subscription tier
    (subscription_tier IS NULL OR subscription_tier = (SELECT subscription_tier FROM public.users WHERE id = auth.uid()))
  );

-- Note: Edge Functions use service_role which bypasses RLS, so they can still update subscription_tier
