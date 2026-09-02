-- Script para inicializar la base de datos MySQL

CREATE DATABASE IF NOT EXISTS votasena;
USE votasena;

CREATE TABLE IF NOT EXISTS candidatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    numero_tarjeton VARCHAR(10) NOT NULL,
    jornada ENUM('Mañana', 'Tarde') NOT NULL
);

-- Crear tabla de votos
CREATE TABLE votos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidato_id INT NOT NULL,
    jornada ENUM('Mañana', 'Tarde') NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE
);

-- Tabla para almacenar los códigos de acceso (Votante y Admin) hasheados
CREATE TABLE IF NOT EXISTS credenciales (
    rol VARCHAR(50) PRIMARY KEY,
    codigo_hash VARCHAR(255) NOT NULL
);

-- Tabla para almacenar configuraciones globales
CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(50) PRIMARY KEY,
    valor VARCHAR(255) NOT NULL
);

-- Insertar datos reales
INSERT INTO candidatos (nombre, color, imagen_url, numero_tarjeton, jornada) VALUES 
('Shirley Ariza', '#39A900', 'assets/avatares/shirley-ariza.png', '01', 'Mañana'),
('Jairo Moreno', '#FF6C00', 'assets/avatares/jairo-moreno.png', '02', 'Mañana'),
('Daniela Ustaris', '#00324D', 'assets/avatares/daniela-ustaris.png', '03', 'Mañana'),
('Voto en Blanco', '#6B7280', 'assets/avatares/voto-en-blanco.png', '00', 'Mañana'),
('Nataly Vanegas', '#39A900', 'assets/avatares/nataly-vanegas.png', '01', 'Tarde'),
('Voto en Blanco', '#6B7280', 'assets/avatares/voto-en-blanco.png', '00', 'Tarde');

INSERT IGNORE INTO configuracion (clave, valor) VALUES ('live_update', 'true');
