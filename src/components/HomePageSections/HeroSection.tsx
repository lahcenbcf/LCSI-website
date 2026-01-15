import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { computerman, MatrixPoints } from "@/assets";

export default function HeroSection() {
  const t = useTranslations("HomePage");

  return (
    <div className="md:flex lg:mt-8 2xl:container mx-auto">
      <div className="px-4 py-8 lg:pl-32 bg-white lg:z-20 lg:mt-14">
        <h1 className=" font-integralCF font-bold text-2xl w-[350px] lg:text-[43px] lg:w-auto ">
          {t("heroSection.lab_name")}
        </h1>
        <p className="font-poppins font-medium text-[14px] lg:text-[16px] text-darkgrayTxt mt-3 px-2 max-w-[600px]">
          {t("heroSection.small_description")}
        </p>
        <Link
          href={"/presentation"}
          className="inline-block mt-4 px-4 py-2 bg-mainBlue text-white rounded-xl"
        >
          {t("heroSection.KnowMore")}
        </Link>
      </div>
      <div className="flex justify-end relative md:w-full">
        <div className="w-1/2 h-[350px] bg-grayRectangle lg:min-w-[370px] lg:h-[500px]"></div>
        <Image
          src={computerman}
          alt="Computerman"
          className="absolute right-0 top-[25px] w-full sm:max-w-[400px] h-[250px] object-cover lg:max-w-none lg:w-[800px] lg:h-[400px]"
          priority
        />
        <Image
          src={MatrixPoints}
          alt="Matrix Points"
          className="absolute right-[15px] bottom-[20px] w-[160px] h-[40px] lg:right-[110px]"
          priority
        />
      </div>
    </div>
  );
}
