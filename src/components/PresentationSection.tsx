import Image from "next/image";
import { StaticImageData } from "next/image";

interface PresentationSectionProps {
  title: string;
  description: string;
  image: StaticImageData | string;
  imageAlt: string;
  reverse?: boolean;
  className?: string;
}

export default function PresentationSection({
  title,
  description,
  image,
  imageAlt,
  reverse = false,
  className = "",
}: PresentationSectionProps) {
  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            reverse ? "lg:grid-flow-col-dense" : ""
          }`}
        >
          {/* Contenu texte - toujours en premier sur mobile */}
          <div
            className={`order-1 ${
              reverse ? "lg:col-start-2 lg:order-none" : "lg:order-none"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-integralCF">
              {title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Image - toujours en second sur mobile */}
          <div
            className={`order-2 ${
              reverse ? "lg:col-start-1 lg:order-none" : "lg:order-none"
            }`}
          >
            <div className="relative w-full h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg transition-shadow duration-300">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
