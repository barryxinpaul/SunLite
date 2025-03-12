import React from "react";

export default function StockDisplay({
  symbol,
  description,
  quantity,
  price,
  avgPrice,
  currentValue,
  portPercent
}) {
  return (
    <>
      <hr className="mt-4 border-t border-black w-full mx-auto " />
      <div className="mt-3 ml-5 inline-flex gap-32">
        <p className="text-lg">{symbol}</p>
        <p className="text-lg">{description}</p>
        <p className="text-lg">{quantity}</p>
        <p className="text-lg">{price}</p>
        <p className="text-lg">{avgPrice}</p>
        <p className="text-lg">{currentValue}</p>
        <p className="text-lg">{portPercent}%</p>
      </div>
    </>
  );
}
