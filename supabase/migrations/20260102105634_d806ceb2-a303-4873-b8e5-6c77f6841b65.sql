-- Create messages table for contact form submissions
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    read_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages (public contact form)
CREATE POLICY "Anyone can submit messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- Staff can view all messages
CREATE POLICY "Staff can view messages"
ON public.messages
FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can update messages (mark as read)
CREATE POLICY "Staff can update messages"
ON public.messages
FOR UPDATE
USING (is_staff(auth.uid()));

-- Staff can delete messages
CREATE POLICY "Staff can delete messages"
ON public.messages
FOR DELETE
USING (is_staff(auth.uid()));