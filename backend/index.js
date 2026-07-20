require("dotenv").config();

const express = require("express");
const cors = require("cors");
const createDefaultAdmin = require("./utils/defaultAdmin")

const connectDB = require("./config/db");
const userRoutes = require("./Routes/userRoute");
const adminRoutes = require("./Routes/adminRoute")

const app = express();

// Connect Database
connectDB().then(
    async()=>{
        await createDefaultAdmin();
    }
)



// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin",adminRoutes)

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT =  3300;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});