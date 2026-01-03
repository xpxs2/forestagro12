
import { Inter } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/lib/FirebaseProvider";
import { UserProvider } from "@/app/context/UserContext";
import { ClientProviders } from "@/app/components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
            <UserProvider>
                <ClientProviders>{children}</ClientProviders>
            </UserProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
