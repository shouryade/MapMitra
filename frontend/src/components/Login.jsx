import { useNavigate } from "react-router-dom";

const Login = ({ onClose, setIsDisabled }) => {
  const navigate = useNavigate(); // Hook for navigation

  const handleGoogleLogin = () => {
    alert("Logged in as Student via Google");
    setIsDisabled(false); // Enable map interactivity
    onClose(); // Close the modal
    navigate("/map"); // Redirect to /map
  };

  const handleDriverLogin = () => {
    alert("Logged in as Auto Driver via Phone/OTP");
    setIsDisabled(false); // Enable map interactivity
    onClose(); // Close the modal
    // Drivers are not redirected to /map; add logic here if needed
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Login</h2>
      <button
        className="btn btn-primary w-full mb-2"
        onClick={handleGoogleLogin}
      >
        Login as Student
      </button>
      <button className="btn btn-secondary w-full" onClick={handleDriverLogin}>
        Login as Auto Driver
      </button>
    </div>
  );
};

export default Login;
