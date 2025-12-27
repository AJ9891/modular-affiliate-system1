import { useBrandColors } from "@/hooks/useBrandColors";

interface BrandSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const BrandSection = ({ children, className = "" }: BrandSectionProps) => {
  const colors = useBrandColors();

  return (
    <section 
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text 
      }}
      className={`py-20 px-6 ${className}`}
    >
      {children}
    </section>
  );
};
