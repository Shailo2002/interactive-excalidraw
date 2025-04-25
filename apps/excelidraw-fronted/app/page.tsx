"use client";

import { Button } from "@repo/ui/button";
import { Link, Pencil, Share2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Collaborate and Create <span className="text-blue-600">Together</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          A virtual whiteboard for sketching, collaboration, and bringing your
          ideas to life. Free, open-source, and built for your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            children={"Signin"}
            size="large"
            onClick={() => {
              router.push("/signin");
            }}
          />
          <Button
            size="large"
            onClick={() => {
              router.push("/signup");
            }}
            children={"Signup"}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[Pencil, Users, Share2].map((Icon, i) => {
            const titles = [
              "Intuitive Drawing",
              "Real-time Collaboration",
              "Easy Sharing",
            ];
            const descriptions = [
              "Create beautiful diagrams and sketches with easy-to-use tools.",
              "Work together with your team in real-time from anywhere.",
              "Share your boards with a simple link.",
            ];
            return (
              <div key={titles[i]}>
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{titles[i]}</h3>
                <p className="text-gray-600 text-sm">{descriptions[i]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to bring your ideas to life?
          </h2>
          <p className="text-base sm:text-xl mb-8 opacity-90">
            Join thousands of teams already using our platform.
          </p>
          <Button
            size="large"
            className="bg-blue-500 hover:bg-blue-600"
            children={"Get Started - It's Free"}
          />
        </div>
      </section>
    </main>
  );
}
