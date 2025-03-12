import { useState, useEffect } from "react";
import Sun from "./assets/sunlogo.png";
import api from "./services/api";

export default function Popup({ isOpen, onClose, title, message, onCardFlip }) {
  const [flipped, setFlipped] = useState([false, false, false]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [amounts, setAmounts] = useState([]);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const initialAmounts = ["100", "200", "300"];
    setAmounts(initialAmounts.sort(() => Math.random() - 0.5));
  }, [isOpen]); // Reset amounts when popup opens

  if (!isOpen) return null;

  const handleFlip = (index) => {
    if (isFrozen) return;

    setIsFrozen(true);
    setFlipped((prevState) =>
      prevState.map((isFlipped, i) => (i === index ? true : isFlipped)),
    );

    // Get the selected amount
    const selectedAmount = Number(amounts[index]);

    // Update portfolio data in Overview
    onCardFlip(selectedAmount);

    // Show all cards after a delay
    setTimeout(() => {
      setFlipped([true, true, true]);
    }, 500);

    // Close popup after showing all cards
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const renderCard = (index) => (
    <div
      className={`relative w-40 h-64 cursor-pointer transition-transform duration-500 transform ${
        flipped[index] ? "rotate-y-180" : ""
      }`}
      onClick={() => handleFlip(index)}
    >
      <div className="absolute inset-0 backface-hidden bg-[#013946] p-4 rounded-xl shadow-md flex justify-center items-center">
        {flipped[index] ? (
          <h3
            className={`font-bold text-lg rotate-y-180 ${
              flipped[index] ? "text-yellow-400" : "text-white"
            }`}
          >
            ${amounts[index]}
          </h3>
        ) : (
          <img
            src={Sun}
            className="w-24 h-20 object-contain rounded-lg"
            alt={`Card ${index + 1} Logo`}
          />
        )}
      </div>

      <div className="absolute inset-0 backface-hidden bg-[#F0B627] p-6 rounded-xl shadow-md transform rotate-y-180 flex flex-col justify-center items-center text-center">
        <h3 className="text-[#013946] font-bold text-3xl">${amounts[index]}</h3>
        <p className="text-black font-medium mt-2">
          🎉 Congratulations! You got ${amounts[index]}.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div
        className={`bg-white rounded-lg shadow-xl ${showCards ? "w-[800px]" : "w-[400px]"}`}
      >
        <div className="bg-[#013946] text-[#F0B627] px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">
            {showCards ? "Flip a card for your daily claim!" : title}
          </h2>
        </div>

        <div className="p-6">
          {!showCards ? (
            <>
              <p className="text-gray-700 mb-6">{message}</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCards(true)}
                  className="px-4 py-2 bg-[#013946] text-white rounded hover:bg-[#436E95]"
                >
                  Claim Reward
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center gap-10">
              {renderCard(0)}
              {renderCard(1)}
              {renderCard(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
