-- Schema for Stock Transfer PMN

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE,
    stock_total INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'unidades',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouses table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfers table
CREATE TABLE transfers (
    id TEXT PRIMARY KEY, -- Using the TRF-XXXX format
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    cantidad_recibida INTEGER,
    diferencia INTEGER,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    prioridad TEXT NOT NULL,
    estado TEXT NOT NULL,
    creada_por TEXT NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Events table
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transferencia_id TEXT REFERENCES transfers(id) ON DELETE CASCADE,
    actor TEXT NOT NULL,
    rol TEXT NOT NULL,
    accion TEXT NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    descripcion TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_adicionales JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Public policies (for PMN simplicity)
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on warehouses" ON warehouses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on transfers" ON transfers FOR SELECT USING (true);
CREATE POLICY "Allow public write access on transfers" ON transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on transfers" ON transfers FOR UPDATE USING (true);
CREATE POLICY "Allow public read access on audit_events" ON audit_events FOR SELECT USING (true);
CREATE POLICY "Allow public write access on audit_events" ON audit_events FOR INSERT WITH CHECK (true);

-- Insert mock data for products and warehouses
INSERT INTO products (name, sku, stock_total) VALUES
('Laptop DELL XPS 13', 'SKU-001', 15),
('Monitor LG 27"', 'SKU-002', 20),
('Teclado Mecánico RGB', 'SKU-003', 45),
('Mouse Logitech MX Master', 'SKU-004', 30),
('Monitor Samsung 32"', 'SKU-005', 10),
('Webcam Logitech HD', 'SKU-006', 25),
('Auriculares Sony WH-1000XM5', 'SKU-007', 12),
('Docking Station USB-C', 'SKU-008', 8),
('Cable HDMI 2.1', 'SKU-009', 100),
('Adaptador DisplayPort', 'SKU-010', 50);

INSERT INTO warehouses (name) VALUES
('Bodega Centro'),
('Bodega Norte'),
('Bodega Sur'),
('Bodega Este'),
('Bodega Oeste');
