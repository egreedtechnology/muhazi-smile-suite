-- Allow public appointment booking (without authentication)
-- First, add a policy for public patient creation
CREATE POLICY "Anyone can create patient for booking" 
ON public.patients 
FOR INSERT 
WITH CHECK (true);

-- Add policy for public appointment creation
CREATE POLICY "Anyone can create appointment for booking" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

-- Allow reading patients by phone for duplicate check during booking
CREATE POLICY "Anyone can check existing patient by phone" 
ON public.patients 
FOR SELECT 
USING (true);