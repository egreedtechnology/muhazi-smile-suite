-- Create gallery_media table for clinic gallery
CREATE TABLE public.gallery_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'clinic_tour',
    media_type TEXT NOT NULL DEFAULT 'image',
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

-- Anyone can view active gallery media
CREATE POLICY "Anyone can view active gallery media"
ON public.gallery_media
FOR SELECT
USING (is_active = true);

-- Staff can view all gallery media
CREATE POLICY "Staff can view all gallery media"
ON public.gallery_media
FOR SELECT
USING (is_staff(auth.uid()));

-- Super admins can manage gallery media
CREATE POLICY "Super admins can manage gallery media"
ON public.gallery_media
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_gallery_media_updated_at
    BEFORE UPDATE ON public.gallery_media
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create patient_accounts table for patient portal
CREATE TABLE public.patient_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id),
    UNIQUE(patient_id)
);

-- Enable RLS
ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;

-- Patients can view their own account
CREATE POLICY "Patients can view their own account"
ON public.patient_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- Staff can view all patient accounts
CREATE POLICY "Staff can view all patient accounts"
ON public.patient_accounts
FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can manage patient accounts
CREATE POLICY "Staff can manage patient accounts"
ON public.patient_accounts
FOR ALL
USING (is_staff(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_patient_accounts_updated_at
    BEFORE UPDATE ON public.patient_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create appointment_requests table for rescheduling/cancellation requests
CREATE TABLE public.appointment_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
    patient_account_id UUID REFERENCES public.patient_accounts(id) ON DELETE CASCADE NOT NULL,
    request_type TEXT NOT NULL, -- 'reschedule' or 'cancel'
    requested_date DATE,
    requested_time TIME,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- Patients can view their own requests
CREATE POLICY "Patients can view their own requests"
ON public.appointment_requests
FOR SELECT
USING (
    patient_account_id IN (
        SELECT id FROM public.patient_accounts WHERE user_id = auth.uid()
    )
);

-- Patients can create requests
CREATE POLICY "Patients can create requests"
ON public.appointment_requests
FOR INSERT
WITH CHECK (
    patient_account_id IN (
        SELECT id FROM public.patient_accounts WHERE user_id = auth.uid()
    )
);

-- Staff can view all requests
CREATE POLICY "Staff can view all requests"
ON public.appointment_requests
FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can update requests
CREATE POLICY "Staff can update requests"
ON public.appointment_requests
FOR UPDATE
USING (is_staff(auth.uid()));

-- Create intake_forms table
CREATE TABLE public.intake_forms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    form_type TEXT NOT NULL DEFAULT 'initial',
    form_data JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

-- Patients can view their own forms
CREATE POLICY "Patients can view their own intake forms"
ON public.intake_forms
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM public.patient_accounts WHERE user_id = auth.uid()
    )
);

-- Patients can submit forms
CREATE POLICY "Patients can submit intake forms"
ON public.intake_forms
FOR INSERT
WITH CHECK (
    patient_id IN (
        SELECT patient_id FROM public.patient_accounts WHERE user_id = auth.uid()
    )
);

-- Staff can view all forms
CREATE POLICY "Staff can view all intake forms"
ON public.intake_forms
FOR SELECT
USING (is_staff(auth.uid()));

-- Staff can update forms
CREATE POLICY "Staff can update intake forms"
ON public.intake_forms
FOR UPDATE
USING (is_staff(auth.uid()));

-- Create treatment_records table for patient health records
CREATE TABLE public.treatment_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    treatment_notes TEXT,
    procedures_performed TEXT[],
    medications_prescribed TEXT[],
    follow_up_date DATE,
    treated_by UUID REFERENCES public.staff(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treatment_records ENABLE ROW LEVEL SECURITY;

-- Patients can view their own treatment records (read-only)
CREATE POLICY "Patients can view their own treatment records"
ON public.treatment_records
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM public.patient_accounts WHERE user_id = auth.uid()
    )
);

-- Staff can view all treatment records
CREATE POLICY "Staff can view all treatment records"
ON public.treatment_records
FOR SELECT
USING (is_staff(auth.uid()));

-- Dentists and super admins can manage treatment records
CREATE POLICY "Dentists can manage treatment records"
ON public.treatment_records
FOR ALL
USING (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_treatment_records_updated_at
    BEFORE UPDATE ON public.treatment_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for gallery media
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Create storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Super admins can upload gallery files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update gallery files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete gallery files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'super_admin'));