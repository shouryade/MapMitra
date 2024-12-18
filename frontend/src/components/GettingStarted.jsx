import { useState } from "react";
import MapComponent from "./MapComponent";
import Modal from "./Modal";

const GettingStarted = () => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const handleGetStarted = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  return (
    <div className="hero bg-base-200 h-screen w-screen relative">
      {/* Map Section */}
      <MapComponent isDisabled={isDisabled} />

      {/* Hero Section */}
      <div className="hero-content text-center relative z-50">
        <div className="w-full text-indigo-950">

          {isDisabled && (
            <div>
              <h1 className="text-5xl font-bold">MapMitra</h1>
              <p className="py-6">
                Navigate seamlessly within the campus premises
              </p>
              <button
                className={`btn btn-primary fixed bottom-2 left-2 right-2 ${
                  isDisabled ? "" : "btn-disabled border-green-500"
                }`}
                disabled={!isDisabled}
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Section */}
      {isModalOpen && (
        <Modal
          modalType={modalType}
          setModalType={setModalType}
          onClose={handleCloseModal}
          setIsDisabled={setIsDisabled}
        />
      )}
    </div>
  );
};

export default GettingStarted;
