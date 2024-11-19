SELECT 'Database rebuild started...';
DROP DATABASE IF EXISTS temp;
CREATE DATABASE temp;

\c temp;

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'ee_tracker_db'
    AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS ee_tracker_db;
CREATE DATABASE ee_tracker_db;

\c ee_tracker_db;

CREATE TABLE department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    department_id INTEGER,

    FOREIGN KEY (department_id) REFERENCES department(id)
    ON DELETE SET NULL -- If department is deleted, set role's department to NULL
);

CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL,
    manager_id INTEGER,

    FOREIGN KEY (role_id) REFERENCES role(id)
    ON DELETE SET NULL, -- If role is deleted, set employee's role to NULL
    FOREIGN KEY (manager_id) REFERENCES employee(id)
    ON DELETE SET NULL -- If manager is deleted, set employee's manager to NULL
);

