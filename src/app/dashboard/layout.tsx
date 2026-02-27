import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | ArthVeda AI',
    description: 'Artifical Intelligence that turns finance data into wisdom.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
