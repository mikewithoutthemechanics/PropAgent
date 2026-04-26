import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sehweutpfftnrcbqshsn.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHdldXRwZmZ0bnJjYnFzaHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzIwODIsImV4cCI6MjA4OTgwODA4Mn0.ZcRNOJwApQvzCJP2hTQgLB0Qd-P2cJvIVKLmIHL0Yj8';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
