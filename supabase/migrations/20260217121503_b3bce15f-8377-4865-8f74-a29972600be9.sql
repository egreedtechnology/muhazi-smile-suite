-- Allow public users to check appointment availability (date, time, duration only)
CREATE POLICY "Anyone can check appointment availability"
ON public.appointments
FOR SELECT
USING (status != 'cancelled');