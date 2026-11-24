-- Inicializacion de la base de datos - TechFest Soluciones (Forma B)
--   mysql -h <ENDPOINT-RDS> -u admin -p < init_db.sql

CREATE DATABASE IF NOT EXISTS techfest;
USE techfest;

CREATE TABLE IF NOT EXISTS expositores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_empresa VARCHAR(120) NOT NULL,
  rubro VARCHAR(60) NOT NULL,
  costo_stand DECIMAL(10,2) NOT NULL,
  cupos_asignados INT NOT NULL DEFAULT 0,
  contacto VARCHAR(120),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO expositores (nombre_empresa, rubro, costo_stand, cupos_asignados, contacto) VALUES
  ('CloudTech SpA', 'Cloud Computing', 350000, 4, 'ventas@cloudtech.cl'),
  ('DataViz Analytics', 'Análisis de Datos', 280000, 3, 'contacto@dataviz.cl'),
  ('RoboLabs', 'Robótica', 420000, 6, 'info@robolabs.cl'),
  ('SeguriNet', 'Ciberseguridad', 300000, 3, 'hola@segurinet.cl'),
  ('AppMakers', 'Desarrollo Móvil', 250000, 2, 'team@appmakers.cl');
