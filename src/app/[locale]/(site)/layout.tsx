import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
