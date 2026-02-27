import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trading Simulator | ArthVeda AI',
    description: 'Artifical Intelligence that turns finance into wisdom.',
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
