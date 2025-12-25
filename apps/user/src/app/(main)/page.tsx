"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const HomePage = () => {
  return (
    <div className={`container`}>
      <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] transition-colors py-10 space-y-10">
        {/* Hero Section */}
        <section className="space-y-4">
          <h1 className="font-josefin text-5xl">
            Josefin Sans – Display Heading
          </h1>
          <p className="font-rubik text-lg text-[rgb(var(--fg)/0.7)] max-w-2xl">
            Subheading using Rubik. Ideal for secondary titles, UI-focused
            headings, and sections.
          </p>
          <p className="font-poppins text-base text-[rgb(var(--fg)/0.6)] max-w-2xl">
            Body text using Poppins. Clean, modern, and highly readable for long
            content.
          </p>
          <Button className="font-poppins mt-4">Explore More</Button>
        </section>

        {/* Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-[rgb(var(--fg)/0.05)] border border-[rgb(var(--fg)/0.1)] shadow-xl rounded-2xl"
            >
              <CardContent className="p-6 space-y-3">
                <h3 className="font-rubik text-xl">Rubik Card Title {i}</h3>
                <p className="font-poppins text-sm text-[rgb(var(--fg)/0.6)]">
                  This card uses Poppins for readability and Rubik for balanced
                  headings.
                </p>
                <Button className="font-poppins w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-[rgb(var(--fg)/0.1)]">
          <p className="font-poppins text-[rgb(var(--fg)/0.5)] text-sm">
            © 2025 Demo Typography Layout
          </p>
        </footer>
      </div>

      <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))] transition-colors py-10 space-y-10">
        {/* Hero Section */}
        <section className="space-y-4">
          <h1 className="font-josefin text-5xl">
            Josefin Sans – Display Heading
          </h1>
          <p className="font-rubik text-lg text-[rgb(var(--fg)/0.7)] max-w-2xl">
            Subheading using Rubik. Ideal for secondary titles, UI-focused
            headings, and sections.
          </p>
          <p className="font-poppins text-base text-[rgb(var(--fg)/0.6)] max-w-2xl">
            Body text using Poppins. Clean, modern, and highly readable for long
            content.
          </p>
          <Button className="font-poppins mt-4">Explore More</Button>
        </section>

        {/* Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-[rgb(var(--fg)/0.05)] border border-[rgb(var(--fg)/0.1)] shadow-xl rounded-2xl"
            >
              <CardContent className="p-6 space-y-3">
                <h3 className="font-rubik text-xl">Rubik Card Title {i}</h3>
                <p className="font-poppins text-sm text-[rgb(var(--fg)/0.6)]">
                  This card uses Poppins for readability and Rubik for balanced
                  headings.
                </p>
                <Button className="font-poppins w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Footer */}
        <footer className="pt-10 border-t border-[rgb(var(--fg)/0.1)]">
          <p className="font-poppins text-[rgb(var(--fg)/0.5)] text-sm">
            © 2025 Demo Typography Layout
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
