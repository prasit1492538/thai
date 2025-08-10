import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "thai_tutoring_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return { data: results, error: null }
  } catch (error) {
    console.error("Database query error:", error)
    return { data: null, error }
  }
}

export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("✅ MySQL connection successful")
    return true
  } catch (error) {
    console.error("❌ MySQL connection failed:", error)
    return false
  }
}

export default pool
