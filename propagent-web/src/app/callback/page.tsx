"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      console.log("Callback: Starting...");
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.auth.getUser();
      console.log("Callback: getUser result", data?.user?.email, error);
      
      if (data?.user) {
        localStorage.setItem('propagent-logged-in', 'true');
        console.log("Callback: User found, going to dashboard");
        router.push("/dashboard");
      } else {
        console.log("Callback: No user, going to login");
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-900">Signing you in...</p>
    </div>
  );
}
