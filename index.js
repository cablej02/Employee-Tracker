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
    //get all employees whether or not they have a role, department or manager
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
        //get the rows from the query
        const { rows } = await pool.query(query);

        console.table(rows);

        //restart the inquirer prompt
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

    //query to insert the employee into the database
    const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ($1, $2, $3, $4);
    `;

    try {
        //get the rows from the manager query
        const { rows: managers } = await pool.query(managerQuery);
        //get the rows from the role query
        const { rows: roles } = await pool.query(roleQuery);

        //prompt the user for the employee's first name, last name, role and manager
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

        //insert the employee into the database
        await pool.query(query, [first_name, last_name, role_id, manager_id]);

        console.log(`Added new employee ${first_name} ${last_name}!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewAllRoles = async () => {
    //get all roles and their departments
    const query = `
        SELECT r.id, r.title, d."name" AS department, r.salary::FLOAT AS salary
        FROM "role" r 
            LEFT OUTER JOIN department d ON r.department_id = d.id;
    `;

    try {
        //get the rows from the query
        const { rows } = await pool.query(query);

        console.table(rows);

        //restart the inquirer prompt
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

        //get title name from user input
        const { title} = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the name of the role:",
            },
        ]);

        //check if the role already exists
        const roleExists = await pool.query(`SELECT * FROM "role" WHERE title = $1;`, [title]);
        if(roleExists.rows.length > 0) {
            console.log(`Role ${title} already exists!`);
            return startInquirer();
        }

        //if the role does not exist, prompt the user for the salary and department
        const {salary, department_id } = await inquirer.prompt([
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

        //insert the role into the database
        await pool.query(query, [title, salary, department_id]);

        console.log(`Added ${title} role!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewAllDepartments = async () => {
    //get all departments
    const query = `SELECT * FROM department;`;

    try {
        //get the rows from the query
        const { rows } = await pool.query(query);

        console.table(rows);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const addDepartment = async () => {
    //query to insert the department into the database
    const query = `
        INSERT INTO department (name)
        VALUES ($1);
    `;

    try {
        //prompt the user for the department name
        const { name } = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "Enter the department name:",
            },
        ]);

        //check if the department already exists
        const departmentExists = await pool.query(`SELECT * FROM department WHERE name = $1;`, [name]);
        if(departmentExists.rows.length > 0) {
            console.log(`Department ${name} already exists!`);
            return startInquirer();
        }

        //insert the department into the database
        await pool.query(query, [name]);

        console.log(`Added ${name} department!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const updateEmployeeRole = async () => {
    //get all employees and roles
    const employeeQuery = `SELECT id, first_name, last_name FROM employee;`;

    //get all roles
    const roleQuery = `SELECT id, title FROM "role";`;

    //query to update the employee's role
    const query = `
        UPDATE employee
        SET role_id = $2
        WHERE id = $1
    `;

    try {
        //get the rows from the employee query
        const { rows: employees } = await pool.query(employeeQuery);
        //get the rows from the role query
        const { rows: roles } = await pool.query(roleQuery);

        //prompt the user for the employee and role
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

        //update the employee's role in the database
        await pool.query(query, [employee_id, role_id]);

        // log the updated role
        const selectedEmployee = employees.find(employee => employee.id === employee_id);
        const selectedRole = roles.find(role => role.id === role_id);
        console.log(`Employee ${selectedEmployee.first_name} ${selectedEmployee.last_name}'s role updated to ${selectedRole.title}!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const updateEmployeeManager = async () => {
    //get all employees
    const employeeQuery = `SELECT id, first_name, last_name FROM employee;`;

    //query to update the employee's manager
    const query = `
        UPDATE employee
        SET manager_id = $2
        WHERE id = $1
    `;

    try {
        //get the rows from the employee query
        const { rows: employees } = await pool.query(employeeQuery);

        //prompt the user for the employee and manager
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

        //update the employee's manager in the database
        await pool.query(query, [employee_id, manager_id]);

        // log the updated manager
        const selectedEmployee = employees.find(employee => employee.id === employee_id);
        const selectedManager = employees.find(manager => manager.id === manager_id);
        console.log(`Employee ${selectedEmployee.first_name} ${selectedEmployee.last_name}'s manager updated to ${selectedManager.first_name} ${selectedManager.last_name}!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewEmployeesByManager = async () => {
    //get all managers
    const managerQuery = `
        SELECT DISTINCT e2.id, e2.first_name, e2.last_name 
        FROM employee e 
            JOIN employee e2 ON e.manager_id = e2.id;
    `;

    //query to get all employees by manager
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary::FLOAT AS salary
        FROM employee e 
            JOIN "role" r ON e.role_id = r.id
            JOIN department d ON d.id = r.department_id
        WHERE e.manager_id = $1;
    `;
    
    try {
        //get the rows from the manager query
        const { rows: managers } = await pool.query(managerQuery);

        //prompt the user for the manager
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

        //get the rows from the query
        const { rows } = await pool.query(query, [manager_id]);

        console.table(rows);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewEmployeesByDepartment = async () => {
    //get all departments
    const departmentQuery = `SELECT * FROM department;`;

    //query to get all employees by department
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
        //get the rows from the department query
        const { rows: departments } = await pool.query(departmentQuery);

        //prompt the user for the department
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

        //get the rows from the query
        const { rows } = await pool.query(query, [department_id]);

        console.table(rows);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const viewDepartmentBudget = async () => {
    //get all departments
    const departmentQuery = `SELECT * FROM department;`;

    //query to get the total utilized budget of a department
    const query = `
        SELECT d.name, SUM(r.salary::FLOAT) AS total_utilized_budget
        FROM department d 
            JOIN "role" r ON r.department_id = d.id
            JOIN employee e ON e.role_id = r.id
        WHERE d.id = $1
        GROUP BY d.name;
    `;

    try {
        //get the rows from the department query
        const { rows: departments } = await pool.query(departmentQuery);

        //prompt the user for the department
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

        //get the rows from the query
        const { rows } = await pool.query(query, [department_id]);

        //log the total utilized budget of the department
        console.log(`Total utilized budget for ${rows[0].name}: $${rows[0].total_utilized_budget}`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteDepartment = async () => {
    //get all departments
    const departmentQuery = `SELECT * FROM department;`;

    //query to delete the department
    const query = `
        DELETE FROM department
        WHERE id = $1;
    `;

    try {
        //get the rows from the department query
        const { rows: departments } = await pool.query(departmentQuery);

        //prompt the user for the department
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

        //Could add a check to see if the department is being used by any roles before deleting

        //delete the department from the database
        await pool.query(query, [department_id]);

        const selectedDepartment = departments.find(department => department.id === department_id);
        console.log(`Department ${selectedDepartment.name} deleted!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteRole = async () => {
    //get all roles
    const roleQuery = `SELECT * FROM "role";`;

    //query to delete the role
    const query = `
        DELETE FROM "role"
        WHERE id = $1;
    `;

    try {
        //get the rows from the role query
        const { rows: roles } = await pool.query(roleQuery);

        //prompt the user for the role
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

        //Could add a check to see if the role is being used by any employees before deleting

        //delete the role from the database
        await pool.query(query, [role_id]);

        // log the deleted role
        const selectedRole = roles.find(role => role.id === role_id);
        console.log(`Role ${selectedRole.title} deleted!`);

        //restart the inquirer prompt
        startInquirer();
    } catch (error) {
        console.error(error);
    }
}

const deleteEmployee = async () => {
    //get all employees
    const employeeQuery = `SELECT * FROM employee;`;

    //query to delete the employee
    const query = `
        DELETE FROM employee
        WHERE id = $1;
    `;

    try {
        //get the rows from the employee query
        const { rows: employees } = await pool.query(employeeQuery);

        //prompt the user for the employee
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

        //delete the employee from the database
        await pool.query(query, [employee_id]);

        // log the deleted employee
        const selectedEmployee = employees.find(employee => employee.id === employee_id);
        console.log(`Employee ${selectedEmployee.first_name} ${selectedEmployee.last_name} deleted!`);

        //restart the inquirer prompt
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
            "Exit",
        ],
    });

    //call the function based on the user's choice
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
        case "Exit":
            return process.exit(0);
    }
}

startInquirer();