import cron from "node-cron";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const runCommand = async (command: string) => {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stdout) {
            console.log("Output:", stdout);
        }
        if (stderr) {
            console.error("Error output:", stderr);
        }
        console.log("Command completed successfully");
    } catch (error) {
        console.error("Error running command:", command, error);
    }
};

// Каждую минуту
cron.schedule("* * * * *", async () => {
    console.log(new Date().toISOString(), ">");
});

// Запуск команды npm run wbFetchTariffs один раз в час
// каждый час на 5 минуте
cron.schedule("41 * * * *", async () => {
    await runCommand("npm run wbFetchTariffs");
});

// Запуск команды npm run wbUpdateTariffs один раз в час
// каждый час на 10 минуте
cron.schedule("42 * * * *", async () => {
    await runCommand("npm run wbUpdateTariffs");
});

// Запуск планировщика
console.log("Scheduler started at", new Date().toISOString());
console.log("Cron jobs scheduled:");
console.log("- Every minute: test job");
console.log("- At 5 minutes past every hour: wbFetchTariffs");
console.log("- At 10 minutes past every hour: wbUpdateTariffs");

// Держим процесс активным
process.on("SIGINT", () => {
    console.log("Scheduler stopped");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("Scheduler stopped");
    process.exit(0);
});
