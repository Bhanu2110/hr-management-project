// Supabase Edge Function: create-employee-user
// Creates a new auth user with the service role so the current admin session is not affected

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, first_name, last_name, role } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name ?? "",
        last_name: last_name ?? "",
        role: role ?? "employee",
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ user_id: data.user?.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: corsHeaders }
    );
  }
});