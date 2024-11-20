import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const connectToDb = async () => {
    try {
        await pool.connect();
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }
}

export { pool, connectToDb };
