import dotenv from "dotenv";
import { connectDB } from "./src/database/db.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3000;

await connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error(`server error: `, err);
    });

    app.listen(PORT, () => {
      console.log(`server is listening on port: `, PORT);
    });
  })
  .catch((error) => {
    console.error(`failed to connect the database `, error);
    process.exit(1);
  });
