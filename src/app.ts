import express from "express";
import { migrate, seed } from "#postgres/knex.js";
import env from "#config/env/env.js";

console.log("Starting database migrations and seeds...");

try {
    await migrate.latest();
    console.log("Migrations completed successfully");

    await seed.run();
    console.log("Seeds completed successfully");

    console.log("All migrations and seeds have been run");
} catch (error) {
    console.error("Error running migrations or seeds:", error);
    process.exit(1);
}

const app = express();
const port = env.APP_PORT || 3000;

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.get("/health", (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Please use a different port.`);
    } else {
        console.error("Server error:", err);
    }
    process.exit(1);
});
