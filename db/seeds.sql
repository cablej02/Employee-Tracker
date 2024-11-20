INSERT INTO department (name) VALUES ('HR'), ('Finance'), ('Marketing'), ('Sales'), ('IT'), ('Customer Service');

INSERT INTO role (title, salary, department_id) VALUES ('HR Manager', 70000, 1), ('HR Specialist', 60000, 1), ('Finance Manager', 120000, 2), ('Finance Specialist', 80000, 2), ('Marketing Manager', 90000, 3), ('Marketing Specialist', 65000, 3), ('Sales Manager', 105000, 4), ('Sales Specialist', 62000, 4), ('IT Manager', 95000, 5), ('IT Specialist', 65000, 5), ('Customer Service Manager', 66000, 6), ('Customer Service Specialist', 58000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John', 'Doe', 1, NULL),
    ('Jane', 'Smith', 2, 1),
    ('Alice', 'Johnson', 3, NULL),
    ('Bob', 'Brown', 4, 3),
    ('Charlie', 'Chaplin', 5, NULL),
    ('David', 'Dover', 6, 5),
    ('Eve', 'Green', 7, NULL),
    ('Frank', 'Blue', 8, 7),
    ('Grace', 'Red', 9, NULL),
    ('Henry', 'Orange', 10, 9),
    ('Ivy', 'Yellow', 11, NULL),
    ('Jack', 'Purple', 12, 11);