import inquirer from "inquirer";
import { QueryResult } from "pg"; 
import { pool, connectToDb } from "./connection.js";

await connectToDb();
