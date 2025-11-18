import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FileVideo } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Thai Video Censor - เซนเซอร์คำหยาบในวิดีโอ',
  description: 'ระบบเซนเซอร์คำหยาบในวิดีโอภาษาไทยอัตโนมัติ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-lg">
                <FileVideo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Thai Video Censor
                </h1>
                <p className="text-xs text-gray-500">AI-Powered Content Filtering</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-50 to-cyan-50 border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-sm text-gray-600">
              © 2024 Thai Video Censor - ระบบเซนเซอร์คำหยาบอัตโนมัติด้วย AI
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Powered by Whisper AI & Next.js
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}