
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Kiểm tra Backend
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Backend MERN đang hoạt động!",
    mongodb: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});

// Kiểm tra sức khỏe hệ thống
app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "UP" : "DEGRADED",
    database: connected ? "Connected" : "Disconnected",
    databaseName: mongoose.connection.name || null,
    timestamp: new Date().toISOString()
  });
});

// Kiểm tra MongoDB trước khi truy vấn
app.use("/api/students", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "MongoDB chưa kết nối. Vui lòng thử lại."
    });
  }
  next();
});

// GET danh sách sinh viên
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (error) {
    console.error("GET students:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// GET sinh viên theo MSSV
app.get("/api/students/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({
      studentId: req.params.studentId
    });

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST thêm sinh viên
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT cập nhật sinh viên theo MongoDB _id
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE sinh viên theo MongoDB _id
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên"
      });
    }

    res.json({
      message: "Xóa sinh viên thành công",
      student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Khởi động sau khi MongoDB kết nối thành công
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thiếu biến MONGODB_URI");
    }

    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.MONGODB_URI.trim(), {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    console.log("MongoDB Atlas connected successfully");
    console.log("Database:", mongoose.connection.name);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server đang chạy tại port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection error:");
    console.error(error.name + ": " + error.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected");
});

startServer();
