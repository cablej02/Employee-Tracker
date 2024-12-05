# Employee Tracker

## Description

This Node.js tool helps manage your employees, departments, and roles.  Users are able to add, delete, and update employees, departments, and roles.

## Installation

1. **Clone the Repository:**

```bash
git clone git@github.com:cablej02/Employee-Tracker.git
```

2. **Navigate to the Project Directory:**

```bash
cd Employee-Tracker
```

3. **Install Dependencies:** This project requires Node.js as well as the `inquirer` and `psql` packages.

```bash
npm install
```

4. **Create Database:** This project requires a PostreSQL database.  Connect to postgress and create the schema.

```
\i db/schema.sql
```

5. **Setup Environment Variables** Add your PostgreSQL credentials to the .env.example file and rename the file to `.env`

## Usage

Follow this [walkthrough video]() or the following instructions for usage:

1. **Run the Tool:** Start the Vehicle Builder by running the following command in your terminal:

```bash
npm start
```

2. **Interact with the Tool:** The tool will prompt you to walk you through all options including:
    - View All Departments
    - View All Roles
    - View All Employees
    - Add a Department
    - Add a Role
    - Add an Employee
    - Update an Employee's Role
    - Update an Employee's Manager
    - View Employees by Manager
    - View Employees by Department
    - Delete a Department
    - Delete a Role
    - Delete an Employee
    - View a Department's Total Utilized Budget

4. **Exit Program:** To exit the tool, select the Exit option in the prompt options.

## Questions

GitHub: [cablej02](https://github.com/cablej02)

If you have additional questions, please contact me by email at [cablej02@gmail.com](mailto:cablej02@gmail.com)