export default function Button({ name, state, width, onClick }) {
  const isActive = state === name.toLowerCase(); // Check if button is active

  const buttonStyle = isActive
    ? "bg-[#013946] text-white font-semibold outline outline-2 outline-[#013946]"
    : "bg-[#E6ECED] outline outline-2 outline-[#013946] text-[#013946] font-semibold hover:bg-[#436E95]";

  return (
    <button
      onClick={onClick} // Enable tab switching
      className={`mr-4 w-${width || "auto"} px-6 py-2 rounded ${buttonStyle}`}
    >
      {name}
    </button>
  );
}
