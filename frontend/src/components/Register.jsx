import { useState } from "react";
import { simulateRegister } from "../mockData";

const Register = ({ onClose }) => {
  const [role, setRole] = useState(null);
  const [details, setDetails] = useState({});

  const handleRegister = () => {
    const result = simulateRegister(details, role);
    alert(result);
    if (role === "student") {
      alert("Registration successful. Logged in as Student.");
      onClose();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Register</h2>
      {!role ? (
        <>
          <button
            className="btn btn-primary w-full mb-2"
            onClick={() => setRole("student")}
          >
            Register as Student
          </button>
          <button
            className="btn btn-secondary w-full"
            onClick={() => setRole("auto-driver")}
          >
            Register as Auto Driver
          </button>
        </>
      ) : (
        <>
          <h3 className="text-md font-bold mb-2">
            {role === "student" ? "Student Registration" : "Auto Driver Registration"}
          </h3>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full mb-2"
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
          />
          {role === "student" && (
            <>
              <input
                type="text"
                placeholder="Roll Number"
                className="input input-bordered w-full mb-2"
                onChange={(e) => setDetails({ ...details, rollNumber: e.target.value })}
              />
              <input
                type="email"
                placeholder="Thapar Email ID"
                className="input input-bordered w-full mb-2"
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Gender"
                className="input input-bordered w-full mb-2"
                onChange={(e) => setDetails({ ...details, gender: e.target.value })}
              />
            </>
          )}
          {role === "auto-driver" && (
            <input
              type="text"
              placeholder="Vehicle Number"
              className="input input-bordered w-full mb-2"
              onChange={(e) => setDetails({ ...details, vehicleNumber: e.target.value })}
            />
          )}
          <button className="btn btn-primary w-full" onClick={handleRegister}>
            Register
          </button>
        </>
      )}
    </div>
  );
};

export default Register;
