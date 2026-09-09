import { useEffect, useState } from "react";

function App() {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Lấy danh sách sinh viên
  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((response) => response.json())
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  }, []);

  // Thêm sinh viên
  const handleSubmit = (e) => {
    e.preventDefault();

    const newStudent = {
      studentId: studentId,
      name: name,
      email: email,
    };

    fetch("http://localhost:5000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Đã thêm sinh viên:", data);

        setStudents([...students, data]);

        setStudentId("");
        setName("");
        setEmail("");
      })
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  };

  // Cập nhật sinh viên
  const handleUpdate = (student) => {
    const newName = prompt("Nhập họ tên mới:", student.name);

    if (newName === null) {
      return;
    }

    const newEmail = prompt("Nhập email mới:", student.email);

    if (newEmail === null) {
      return;
    }

    fetch(`http://localhost:5000/api/students/${student._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: student.studentId,
        name: newName,
        email: newEmail,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Đã cập nhật sinh viên:", data);

        setStudents(
          students.map((item) =>
            item._id === data._id ? data : item
          )
        );
      })
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  };

  // Xóa sinh viên
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) {
      return;
    }

    fetch(`http://localhost:5000/api/students/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Đã xóa sinh viên:", data);

        setStudents(
          students.filter((student) => student._id !== id)
        );
      })
      .catch((error) => {
        console.error("Lỗi:", error);
      });
  };

  return (
    <div>
      <h1>Danh sách sinh viên</h1>

      <h2>Thêm sinh viên</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="MSSV"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Thêm sinh viên</button>
      </form>

      <br />

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.studentId}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>

              <td>
                <button onClick={() => handleUpdate(student)}>
                  Sửa
                </button>

                {" "}

                <button onClick={() => handleDelete(student._id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;