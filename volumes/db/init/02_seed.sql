-- Insert admin user
INSERT INTO employees (email, name, dni, role, department, hourly_rate)
VALUES (
    'admin@einco.com',
    'Admin User',
    '12345678A',
    'ADMIN',
    'Management',
    25.00
);

-- Insert sample employees
INSERT INTO employees (email, name, dni, role, department, hourly_rate)
VALUES 
    ('juan.perez@einco.com', 'Juan Pérez', '87654321B', 'EMPLOYEE', 'Development', 20.00),
    ('maria.garcia@einco.com', 'María García', '11223344C', 'EMPLOYEE', 'HR', 18.50),
    ('carlos.lopez@einco.com', 'Carlos López', '44556677D', 'EMPLOYEE', 'Sales', 19.00);