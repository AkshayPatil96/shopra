import type { Metadata } from "next";
import { Josefin_Sans, Poppins, Rubik, Bebas_Neue } from "next/font/google";
import "./styles/globals.css";
import { ThemeProvider } from "next-themes";
// import Providers from "./Providers";
import { Toaster } from "sonner";
import Providers from "./Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rubik",
});

const geistJosefin = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
  weight: ["400"],
  // weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "E-Com Seller Service",
  description: "Seller service for E-Com platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${poppins.variable} ${rubik.variable} ${geistJosefin.variable}`}
      >
        <Providers>
          <ThemeProvider attribute="class">
            {children}
            <Toaster
              richColors
              closeButton
            />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
