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
    `;

    const { rows } = await pool.query(query);

    console.table(rows);

    startInquirer();
}

const addEmployee = async () => {
    //get the manager ids from the database
    const managerQuery = `SELECT id, first_name, last_name FROM employee;`;
    const { rows: managers } = await pool.query(managerQuery);

    //get the role ids from the database
    const roleQuery = `SELECT id, title FROM "role";`;
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

    const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ($1, $2, $3, $4);
    `;

    await pool.query(query, [first_name, last_name, role_id, manager_id]);

    console.log("Employee added!");

    startInquirer();
}

const viewAllRoles = async () => {
    const query = `
        SELECT r.id, r.title, d."name" AS department, r.salary::FLOAT AS salary
        FROM "role" r 
            JOIN department d ON r.department_id = d.id 
    `;

    const { rows } = await pool.query(query);

    console.table(rows);

    startInquirer();
}

const addRole = async () => {
    //get the department ids from the database
    const departmentQuery = `SELECT id, name FROM department;`;
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

    const query = `
        INSERT INTO role (title, salary, department_id)
        VALUES ($1, $2, $3);
    `;

    await pool.query(query, [title, salary, department_id]);

    console.log("Role added!");

    startInquirer();
}

const viewAllDepartments = async () => {
    const query = `SELECT * FROM department;`;

    const { rows } = await pool.query(query);

    console.table(rows);

    startInquirer();
}

const addDepartment = async () => {
    const { name } = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Enter the department name:",
        },
    ]);

    const query = `
        INSERT INTO department (name)
        VALUES ($1);
    `;
    await pool.query(query, [name]);

    console.log("Department added!");

    startInquirer();
}

const updateEmployeeManager = async () => {
    //get the employee ids from the database
    const employeeQuery = `SELECT id, first_name, last_name FROM employee;`;
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

    const query = `
        UPDATE employee
        SET manager_id = $2
        WHERE id = $1;
    `;

    await pool.query(query, [employee_id, manager_id]);

    console.log("Employee manager updated!");

    startInquirer();
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
            "Update an employee's manager",
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
        case "Update an employee's manager":
            return updateEmployeeManager();
        case "Quit":
            return process.exit(0);
    }
}

startInquirer();