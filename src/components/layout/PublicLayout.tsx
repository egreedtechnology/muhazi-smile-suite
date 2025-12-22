import Header from "./Header";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[104px] lg:pt-[120px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
