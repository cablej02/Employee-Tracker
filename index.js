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
        SELECT e.id,e.first_name, e.last_name, r.title, r.salary,d.name, concat(e2.first_name, ' ', e2.last_name) as manager
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
    const managerQuery = `
        SELECT id, first_name, last_name FROM employee;
    `;
    const { rows: managers } = await pool.query(managerQuery);

    //get the role ids from the database
    const roleQuery = `
        SELECT id, title FROM "role";
    `;
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
        SELECT r.id, r.title, d."name" AS department, r.salary
        FROM "role" r 
            JOIN department d ON r.department_id = d.id 
    `;

    const { rows } = await pool.query(query);

    //TODO figure out how to print without the index column
    console.table(rows);

    startInquirer();
}

const addRole = async () => {
    //get the department ids from the database
    const departmentQuery = `
        SELECT id, name FROM department;
    `;
    const { rows: departments } = await pool.query(departmentQuery);

    const { title, salary, department_id } = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter the role title:",
        },
        {
            type: "input",
            name: "salary",
            message: "Enter the role salary:",
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
    const query = `
        SELECT * FROM department;
    `;

    const { rows } = await pool.query(query);

    //TODO figure out how to print without the index column
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
        case "Quit":
            return process.exit(0);
    }
}

startInquirer();