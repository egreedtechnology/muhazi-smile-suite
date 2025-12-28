-- Create role enum for clinic staff
CREATE TYPE public.app_role AS ENUM ('super_admin', 'receptionist', 'dentist', 'accountant');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table for user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT,
    date_of_birth DATE,
    address TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff table (links to auth.users for dentists/staff who can login)
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    bio TEXT,
    avatar_url TEXT,
    working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    working_hours_start TIME DEFAULT '08:00',
    working_hours_end TIME DEFAULT '20:00',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'cancelled')),
    due_date DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mtn_momo', 'airtel_money', 'card', 'bank_transfer')),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reference_number TEXT,
    notes TEXT,
    received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic_settings table
CREATE TABLE public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user has any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
    )
$$;

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
    RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles (only super_admin can manage)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for services (public read, staff can manage)
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can view all services" ON public.services FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for patients (staff only)
CREATE POLICY "Staff can view patients" ON public.patients FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update patients" ON public.patients FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for staff
CREATE POLICY "Anyone can view active staff" ON public.staff FOR SELECT USING (is_active = true);
CREATE POLICY "Staff can view all staff" ON public.staff FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can manage staff" ON public.staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- RLS Policies for invoice_items
CREATE POLICY "Staff can view invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert invoice items" ON public.invoice_items FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for activity_logs
CREATE POLICY "Staff can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for clinic_settings
CREATE POLICY "Staff can view settings" ON public.clinic_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Super admins can manage settings" ON public.clinic_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Insert default services
INSERT INTO public.services (name, description, category, duration_minutes, price) VALUES
('Dental Checkup', 'Comprehensive oral examination and cleaning', 'routine', 30, 15000),
('Teeth Cleaning', 'Professional dental cleaning and polishing', 'routine', 45, 20000),
('Tooth Extraction', 'Safe removal of damaged or problematic teeth', 'surgical', 60, 25000),
('Dental Filling', 'Restoration of cavities with quality materials', 'restorative', 45, 30000),
('Root Canal', 'Treatment for infected tooth pulp', 'surgical', 90, 80000),
('Teeth Whitening', 'Professional teeth brightening treatment', 'cosmetic', 60, 50000),
('Dental Crown', 'Custom-fitted crown for damaged teeth', 'restorative', 60, 100000),
('Braces Consultation', 'Orthodontic assessment and treatment planning', 'orthodontics', 45, 25000);

-- Insert default clinic settings
INSERT INTO public.clinic_settings (setting_key, setting_value) VALUES
('clinic_info', '{"name": "Muhazi Dental Clinic", "phone": "+250 787 630 399", "email": "info@muhazidental.rw", "address": "2nd Floor, Above MTN Branch, Rwamagana, Rwanda"}'),
('working_hours', '{"start": "08:00", "end": "20:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}'),
('notification_settings', '{"whatsapp_enabled": true, "sms_enabled": false, "email_enabled": true}');