-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create custom types
CREATE TYPE public.entry_type AS ENUM (
  'ENTRADA',
  'SALIDA',
  'DESCANSO_INICIO',
  'DESCANSO_FIN',
  'COMIDA_INICIO',
  'COMIDA_FIN'
);

CREATE TYPE public.user_role AS ENUM (
  'ADMIN',
  'EMPLOYEE'
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dni TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  type entry_type NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_codes table
CREATE TABLE public.daily_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX time_entries_employee_id_idx ON public.time_entries(employee_id);
CREATE INDEX time_entries_timestamp_idx ON public.time_entries(timestamp);
CREATE INDEX daily_codes_date_idx ON public.daily_codes(date);

-- Create RLS policies
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_codes ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Employees can view their own data"
  ON public.employees FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all employees"
  ON public.employees FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Time entries policies
CREATE POLICY "Employees can view their own entries"
  ON public.time_entries FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert their own entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins can view all entries"
  ON public.time_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Daily codes policies
CREATE POLICY "Everyone can view daily codes"
  ON public.daily_codes FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create daily codes"
  ON public.daily_codes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.employees WHERE id = auth.uid() AND role = 'ADMIN'
  ));