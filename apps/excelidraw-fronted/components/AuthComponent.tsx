"use client";

import { HTTP_BACKEND } from "@/config";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function Authentication({ auth_type }: { auth_type: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (auth_type === "signup") {
      try {
        const signup_res = await axios.post(`${HTTP_BACKEND}/signup`, {
          name,
          email,
          password,
        });
        toast.success(signup_res.data.message);
        router.push("/signin");
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          const data = err.response.data as { message: string };
          toast.error(data.message);
          console.log(data.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    } else {
      try {
        const signin_res = await axios.post(`${HTTP_BACKEND}/signin`, {
          email,
          password,
        });
        localStorage.setItem("token", signin_res.data.token);
        toast.success(signin_res.data.message);
        router.push("/dashboard");
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          const data = err.response.data as { message: string };
          toast.error(data.message);
          console.log(data.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center capitalize text-slate-900">
          {auth_type}
        </h2>

        <div className="space-y-4 text-black">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {auth_type === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition"
          >
            {auth_type === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* auth page switching */}
        {auth_type === "signup" ? (
          <div className=" flex justify-center pt-4 text-sm font-light pl-2 text-black">
            already have account{" "}
            <Link href="/signin">
              <span className="font-semibold pl-2 text-blue-600 cursor-pointer underline">
                Signin
              </span>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center pt-4 text-sm font-light pl-2 text-black">
            dont have account{" "}
            <Link href="/signup">
              <span className="font-semibold pl-2 text-blue-600 cursor-pointer underline">
                Signup
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
