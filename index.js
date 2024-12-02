import "dotenv/config";
import inquirer from "inquirer";
import { pool, connectToDb } from "./src/connection.js";

await connectToDb();

console.log(`

╔══════════════════════════╗
║                          ║
║     Employee Tracker     ║
║                          ║
╚══════════════════════════╝

`);

const viewAllEmployees = async () => {
    const query = `
        SELECT e.id,e.first_name, e.last_name, r.title, d.name AS department, r.salary::FLOAT AS salary,
            CASE 
                WHEN e2.first_name IS NULL AND e2.last_name IS NULL THEN NULL
                ELSE CONCAT(e2.first_name, ' ', e2.last_name) 
            END AS manager
        FROM employee e 
            LEFT OUTER JOIN "role" r ON e.role_id = r.id
            LEFT OUTER JOIN department d ON d.id = r.department_id 
            LEFT OUTER JOIN employee e2 ON e2.id = e.manager_id
        ORDER BY e.id;
    `;

    try {
        const { rows } = await pool.query(query);
        console.table(rows);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const addEmployee = async () => {
    //get the manager ids from the database
    const managerQuery = `SELECT id, first_name, last_name FROM employee;`;
    //get the role ids from the database
    const roleQuery = `SELECT id, title FROM "role";`;

    const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ($1, $2, $3, $4);
    `;

    try {
        const { rows: managers } = await pool.query(managerQuery);
        const { rows: roles } = await pool.query(roleQuery);

        const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
            {
                type: "input",
                name: "first_name",
                message: "Enter the employee's first name:",
            },
            {
                type: "input",
                name: "last_name",
                message: "Enter the employee's last name:",
            },
            {
                type: "list",
                name: "role_id",
                message: "Choose the employee's role:",
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id,
                })),
            },
            {
                type: "list",
                name: "manager_id",
                message: "Choose the employee's manager:",
                choices: [
                    { name: "None", value: null },
                    ...managers.map(manager => ({
                        name: `${manager.first_name} ${manager.last_name}`,
                        value: manager.id,
                    })),
                ],
            },
        ]);

        await pool.query(query, [first_name, last_name, role_id, manager_id]);

        console.log("Employee added!");

        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewAllRoles = async () => {
    const query = `
        SELECT r.id, r.title, d."name" AS department, r.salary::FLOAT AS salary
        FROM "role" r 
            LEFT OUTER JOIN department d ON r.department_id = d.id;
    `;

    try {
        const { rows } = await pool.query(query);
        console.table(rows);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const addRole = async () => {
    const departmentQuery = `SELECT id, name FROM department;`;

    const query = `
        INSERT INTO role (title, salary, department_id)
        VALUES ($1, $2, $3);
    `;

    try {
        const { rows: departments } = await pool.query(departmentQuery);

        const { title, salary, department_id } = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the name of the role:",
            },
            {
                type: "input",
                name: "salary",
                message: "Enter the salary of the role:",
            },
            {
                type: "list",
                name: "department_id",
                message: "Choose the role's department:",
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);

        await pool.query(query, [title, salary, department_id]);
        console.log("Role added!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewAllDepartments = async () => {
    const query = `SELECT * FROM department;`;

    try {
        const { rows } = await pool.query(query);
        console.table(rows);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const addDepartment = async () => {
    const query = `
        INSERT INTO department (name)
        VALUES ($1);
    `;

    try {
        const { name } = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "Enter the department name:",
            },
        ]);


        await pool.query(query, [name]);
        console.log("Department added!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const updateEmployeeRole = async () => {
    const employeeQuery = `SELECT id, first_name, last_name FROM employee;`;
    const roleQuery = `SELECT id, title FROM "role";`;

    const query = `
        UPDATE employee
        SET role_id = $2
        WHERE id = $1
    `;

    try {
        const { rows: employees } = await pool.query(employeeQuery);
        const { rows: roles } = await pool.query(roleQuery);

        const { employee_id, role_id } = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Choose the employee to update:",
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
            {
                type: "list",
                name: "role_id",
                message: "Choose the employee's new role:",
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id,
                })),
            },
        ]);

        await pool.query(query, [employee_id, role_id]);
        console.log("Employee role updated!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const updateEmployeeManager = async () => {
    const employeeQuery = `SELECT id, first_name, last_name FROM employee;`;

    const query = `
        UPDATE employee
        SET manager_id = $2
        WHERE id = $1
    `;

    try {
        const { rows: employees } = await pool.query(employeeQuery);

        const { employee_id, manager_id } = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Choose the employee to update:",
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
            {
                type: "list",
                name: "manager_id",
                message: "Choose the employee's new manager:",
                choices: [
                    { name: "None", value: null },
                    ...employees.map(manager => ({
                        name: `${manager.first_name} ${manager.last_name}`,
                        value: manager.id,
                    })),
                ],
            },
        ]);

        await pool.query(query, [employee_id, manager_id]);
        console.log("Employee manager updated!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewEmployeesByManager = async () => {
    const managerQuery = `
        SELECT DISTINCT e2.id, e2.first_name, e2.last_name 
        FROM employee e 
            JOIN employee e2 ON e.manager_id = e2.id;
    `;

    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary::FLOAT AS salary
        FROM employee e 
            JOIN "role" r ON e.role_id = r.id
            JOIN department d ON d.id = r.department_id
        WHERE e.manager_id = $1;
    `;
    
    try {
        const { rows: managers } = await pool.query(managerQuery);

        const { manager_id } = await inquirer.prompt([
            {
                type: "list",
                name: "manager_id",
                message: "Choose the manager:",
                choices: managers.map(manager => ({
                    name: `${manager.first_name} ${manager.last_name}`,
                    value: manager.id,
                })),
            },
        ]);

        const { rows } = await pool.query(query, [manager_id]);
        console.table(rows);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewEmployeesByDepartment = async () => {
    const departmentQuery = `SELECT * FROM department;`;

    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary::FLOAT AS salary,
            CASE 
                WHEN e2.first_name IS NULL AND e2.last_name IS NULL THEN NULL
                ELSE CONCAT(e2.first_name, ' ', e2.last_name) 
            END AS manager
        FROM employee e
            JOIN "role" r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id 
            LEFT OUTER JOIN employee e2 ON e2.id = e.manager_id
        WHERE d.id = $1;
    `;

    try {
        const { rows: departments } = await pool.query(departmentQuery);

        const { department_id } = await inquirer.prompt([
            {
                type: "list",
                name: "department_id",
                message: "Choose the department:",
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);

        const { rows } = await pool.query(query, [department_id]);
        console.table(rows);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewDepartmentBudget = async () => {
    const departmentQuery = `SELECT * FROM department;`;

    const query = `
        SELECT d.name, SUM(r.salary::FLOAT) AS total_utilized_budget
        FROM department d 
            JOIN "role" r ON r.department_id = d.id
            JOIN employee e ON e.role_id = r.id
        WHERE d.id = $1
        GROUP BY d.name;
    `;

    try {
        const { rows: departments } = await pool.query(departmentQuery);

        const { department_id } = await inquirer.prompt([
            {
                type: "list",
                name: "department_id",
                message: "Choose the department:",
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);

        const { rows } = await pool.query(query, [department_id]);
        console.log(`Total utilized budget for ${rows[0].name}: $${rows[0].total_utilized_budget}`);
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteDepartment = async () => {
    const departmentQuery = `SELECT * FROM department;`;

    const query = `
        DELETE FROM department
        WHERE id = $1;
    `;

    try {
        const { rows: departments } = await pool.query(departmentQuery);

        const { department_id } = await inquirer.prompt([
            {
                type: "list",
                name: "department_id",
                message: "Choose the department to delete:",
                choices: departments.map(department => ({
                    name: department.name,
                    value: department.id,
                })),
            },
        ]);

        await pool.query(query, [department_id]);
        console.log("Department deleted!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteRole = async () => {
    const roleQuery = `SELECT * FROM "role";`;

    const query = `
        DELETE FROM "role"
        WHERE id = $1;
    `;

    try {
        const { rows: roles } = await pool.query(roleQuery);

        const { role_id } = await inquirer.prompt([
            {
                type: "list",
                name: "role_id",
                message: "Choose the role to delete:",
                choices: roles.map(role => ({
                    name: role.title,
                    value: role.id,
                })),
            },
        ]);

        await pool.query(query, [role_id]);
        console.log("Role deleted!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteEmployee = async () => {
    const employeeQuery = `SELECT * FROM employee;`;

    const query = `
        DELETE FROM employee
        WHERE id = $1;
    `;

    try {
        const { rows: employees } = await pool.query(employeeQuery);

        const { employee_id } = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Choose the employee to delete:",
                choices: employees.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                })),
            },
        ]);

        await pool.query(query, [employee_id]);
        console.log("Employee deleted!");
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const startInquirer = async () => {
    const { action } = await inquirer.prompt({
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
            "View all employees",
            "Add an employee",
            "View all roles",
            "Add a role",
            "View all departments",
            "Add a department",
            "Update an employee's role",
            "Update an employee's manager",
            "View employees by manager",
            "View employees by department",
            "Delete a department",
            "Delete a role",
            "Delete an employee",
            "View the total utilized budget of a department",
            "Quit",
        ],
    });

    switch (action) {
        case "View all departments":
            return viewAllDepartments();
        case "View all roles":
            return viewAllRoles();
        case "View all employees":
            return viewAllEmployees();
        case "Add a department":
            return addDepartment();
        case "Add a role":
            return addRole();
        case "Add an employee":
            return addEmployee();
        case "Update an employee's role":
            return updateEmployeeRole();
        case "Update an employee's manager":
            return updateEmployeeManager();
        case "View employees by manager":
            return viewEmployeesByManager();
        case "View employees by department":
            return viewEmployeesByDepartment();
        case "Delete a department":
            return deleteDepartment();
        case "Delete a role":
            return deleteRole();
        case "Delete an employee":
            return deleteEmployee();
        case "View the total utilized budget of a department":
            return viewDepartmentBudget();
        case "Quit":
            return process.exit(0);
    }
}

startInquirer();