-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE entry_type AS ENUM ('ENTRADA', 'SALIDA', 'DESCANSO_INICIO', 'DESCANSO_FIN', 'COMIDA_INICIO', 'COMIDA_FIN');
CREATE TYPE leave_type AS ENUM ('ENFERMEDAD', 'VACACIONES', 'PERSONAL');

-- Create employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    department TEXT NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    type entry_type NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_codes table
CREATE TABLE daily_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create leave_requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES employees(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX idx_time_entries_timestamp ON time_entries(timestamp);
CREATE INDEX idx_daily_codes_date ON daily_codes(date);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Create RLS policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Users can view their own data" ON employees
    FOR SELECT USING (auth.uid()::UUID = id);

CREATE POLICY "Admins can view all employees" ON employees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid()::UUID 
            AND role = 'ADMIN'
        )
    );

-- Time entries policies
CREATE POLICY "Users can view their own entries" ON time_entries
    FOR SELECT USING (employee_id = auth.uid()::UUID);

CREATE POLICY "Users can create their own entries" ON time_entries
    FOR INSERT WITH CHECK (employee_id = auth.uid()::UUID);

CREATE POLICY "Admins can view and manage all entries" ON time_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid()::UUID 
            AND role = 'ADMIN'
        )
    );

-- Daily codes policies
CREATE POLICY "Everyone can view daily codes" ON daily_codes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage daily codes" ON daily_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid()::UUID 
            AND role = 'ADMIN'
        )
    );

-- Leave requests policies
CREATE POLICY "Users can view and create their own leave requests" ON leave_requests
    FOR ALL USING (employee_id = auth.uid()::UUID);

CREATE POLICY "Admins can manage all leave requests" ON leave_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE id = auth.uid()::UUID 
            AND role = 'ADMIN'
        )
    );