import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { simulateSendOTP, simulateAuthenticateOTP } from "../mockData";

const Modal = ({ modalType, setModalType, onClose, setIsDisabled }) => {
  const [guestDetails, setGuestDetails] = useState({ name: "", phoneNumber: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const handleGuestSubmit = () => {
    const { phoneNumber } = guestDetails;
    if (simulateSendOTP(phoneNumber)) {
      setOtpSent(true);
    }
  };

  const handleOtpVerification = () => {
    if (simulateAuthenticateOTP(otpInput)) {
      setIsDisabled(false); // Enable map interactivity
      onClose();
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {modalType === null && (
          <div>
            <h2 className="text-lg font-bold mb-4">Choose an Option</h2>
            <button className="btn btn-primary w-full mb-2" onClick={() => setModalType("guest")}>
              Login as Guest
            </button>
            <button className="btn btn-secondary w-full mb-2" onClick={() => setModalType("login")}>
              Login
            </button>
            <button className="btn btn-accent w-full" onClick={() => setModalType("register")}>
              Register
            </button>
          </div>
        )}

        {modalType === "guest" && (
          <div>
            <h2 className="text-lg font-bold mb-4">Guest Login</h2>
            {!otpSent ? (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full mb-2"
                  value={guestDetails.name}
                  onChange={(e) =>
                    setGuestDetails({ ...guestDetails, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="input input-bordered w-full mb-4"
                  value={guestDetails.phoneNumber}
                  onChange={(e) =>
                    setGuestDetails({ ...guestDetails, phoneNumber: e.target.value })
                  }
                />
                <button
                  className="btn btn-primary w-full"
                  onClick={handleGuestSubmit}
                >
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="input input-bordered w-full mb-4"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
                <button
                  className="btn btn-primary w-full"
                  onClick={handleOtpVerification}
                >
                  Verify OTP
                </button>
              </>
            )}
          </div>
        )}

        {modalType === "login" && (
          <Login onClose={onClose} setIsDisabled={setIsDisabled} />
        )}

        {modalType === "register" && (
          <Register onClose={onClose} setIsDisabled={setIsDisabled} />
        )}

        <button className="btn btn-outline w-full mt-4" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
