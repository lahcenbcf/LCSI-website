import Line from "./ui/Line";

const SectionTitle = ({
  title,
  lineColor,
  font = "integralCF",
  extraClass = "lg:text-[40px] font-semibold leading-none text-[28px] max-w-[300px] mb-4  mt-8 px-4",
}: {
  title: string;
  lineColor: string;
  font?: string;
  extraClass?: string;
}) => {
  return (
    <div className="flex lg:gap-4 lg:items-center w-full flex-col lg:flex-row items-start lg:pl-5">
      <h2 className={`font-${font}  text-black  lg:px-0 ${extraClass}`}>
        {title}
      </h2>
      <Line lineColor={lineColor} />
    </div>
  );
};

export default SectionTitle;
