import Button from "./Button";

export default function TitleBox() {
  return (
    <div className="flex p-0 m-0 bg-[#F0B627] h-18 w-4/5 mx-auto mt-4 items-center justify-between">
      <p className="font-semibold text-xl ml-10">SunLite - Simulator</p>
      <div className="mr-5">
        <Button name="Qtrade Securities Inc. Account" state="fill" />
      </div>
    </div>
  );
}