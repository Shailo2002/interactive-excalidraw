"use client"
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  return (
    <div className="flex justify-end">
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition m-6"
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/signin");
        }}
      >
        Log out
      </button>
    </div>
  );
}
