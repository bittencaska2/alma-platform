import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Alma | Plataforma de Terapia Online',
    description: 'Conectando você aos melhores psicólogos. Powered by Meraki Psicologia.',
    keywords: ['terapia online', 'psicólogo', 'saúde mental', 'psicoterapia', 'Meraki'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className="min-h-screen gradient-soft" suppressHydrationWarning>
                {children}
            </body>
        </html>
    )
}
