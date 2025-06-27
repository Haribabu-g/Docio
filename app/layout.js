import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import {dark, neobrutalism } from "@clerk/themes";


const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "Docio - Doctor Appointment App",
  description: "Connect with Doctors Anytime , Anywhere",
  icons: {
    icon: "/favicon.png",
  },

};

export default function RootLayout({ children }) {
  return (
 <ClerkProvider appearance={{ baseTheme:  [neobrutalism]
 }}>

    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
        

          {/*header*/}
          <Header/>
          <main className="min-h-screen">{children}
          </main>

          

          {/*Footer*/}
          <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 💗 by Haribabu-g</p>
              </div>
            </footer>

        </ThemeProvider>
 
      </body>
    </html>
    </ClerkProvider>
  );
}
