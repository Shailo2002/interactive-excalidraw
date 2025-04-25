"use client";

import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export default function AuthPage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="w-[320px] p-6 bg-white rounded-2xl shadow-xl text-black">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isSignin ? "Welcome Back 👋" : "Create an Account"}
        </h2>
        <div className="flex flex-col gap-y-4">
          <input
            type="text"
            placeholder="Email"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-black"
          />
          <Button
          children={isSignin === true ? "Sign in" : "Sign up"}
            size="medium"
            onClick={() => router.push("/dashboard")}
          />
        </div>
      </div>
    </div>
  );
}
