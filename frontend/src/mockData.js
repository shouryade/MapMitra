// Mock data for OTP and user authentication
export const mockData = {
  otp: "123456", // Mock OTP
  users: [
    { phoneNumber: "9876543210", name: "Guest User" },
    { email: "student@thapar.edu", name: "Student", role: "student" },
    { phoneNumber: "9998887776", name: "Driver", role: "auto-driver" },
  ],
};

export const simulateSendOTP = (phoneNumber) => {
  console.log(`Sending OTP to ${phoneNumber}`);
  return true; // Simulates OTP sent
};

export const simulateAuthenticateOTP = (inputOTP) => {
  return inputOTP === mockData.otp; // Validates the OTP
};

export const simulateRegister = (details, role) => {
  console.log(`Registering ${role}`, details);
  return role === "auto-driver"
    ? "Request sent to admin"
    : "Registration successful";
};
