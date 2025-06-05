CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

INSERT INTO users (username, email, hashed_password, role) VALUES 
('admin', 'admin@covid-app.com', '$2a$12$j18RBhI6Z8I7xW/B.N7aEuxVdo/6sSh/n4zanab5Sf5anwcbQx5N2', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);
