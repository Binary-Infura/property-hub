import BuilderLayoutWrapper from '@/app/components/builder/BuilderLayoutWrapper';

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <BuilderLayoutWrapper>{children}</BuilderLayoutWrapper>;
}
