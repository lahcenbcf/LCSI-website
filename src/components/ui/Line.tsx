import { Dot } from "lucide-react";

const Line = ({ lineColor }: { lineColor: string }) => {
  return (
    <div className="flex items-center gap-0  w-full lg:translate-y-3 -translate-y-9  -translate-x-15">
      <Dot
        className="w-[90px] h-[90px] translate-x-10"
        style={{ color: lineColor }}
      />
      <div
        className="flex-1 w-full h-[4px] max-w-[850px]"
        style={{ backgroundColor: lineColor }}
      ></div>
      <Dot
        className="w-[90px] h-[90px] -translate-x-10"
        style={{ color: lineColor }}
      />
    </div>
  );
};

export default Line;
