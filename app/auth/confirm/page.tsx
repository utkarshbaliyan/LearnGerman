"use client";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/app/lib/supabase-client";
export default function AuthConfirmPage() {
  useEffect(() => { void supabase.auth.getSession().then(({ data }) => window.location.replace(data.session ? "/account" : "/account?auth=confirmed")); }, []);
  return <main className="auth-callback"><LoaderCircle className="is-spinning" /><p>Confirming your account…</p></main>;
}
