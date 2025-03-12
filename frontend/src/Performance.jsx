import Chart from "./Chart";
export default function Performance() {
  return (
    <div className="ml-42 mt-0">
      <p style={{ color: "#013946" }} className="font-bold">
        Performance
      </p>
      <div className="p-5 w-200 h-100 bg-[#013946] mt-2">
        <Chart />
      </div>
    </div>
  );
}
