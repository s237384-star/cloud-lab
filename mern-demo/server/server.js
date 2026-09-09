

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());

// Log các request từ Frontend
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// API kiểm tra Backend
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Backend MERN đang hoạt động!"
    });
});

// API GET danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// API lấy thông tin một sinh viên theo studentId
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
        res.status(500).json({
            message: error.message
        });
    }
});

// API cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// API POST thêm sinh viên

app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// API xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json({
            message: "Xóa sinh viên thành công",
            student: student
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Khởi động Server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});

