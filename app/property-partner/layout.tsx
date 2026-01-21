import PropertyPartnerLayoutWrapper from '@/app/components/property-partner/PropertyPartnerLayoutWrapper';

export default function PropertyPartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PropertyPartnerLayoutWrapper>{children}</PropertyPartnerLayoutWrapper>;
}
