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
    const { email, password, first_name, last_name, role, employee_id } = await req.json();

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

    // Check for duplicate employee_id BEFORE creating auth user
    if (employee_id) {
      const { data: existingEmployee, error: checkError } = await adminClient
        .from('employees')
        .select('employee_id')
        .eq('employee_id', employee_id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for duplicate employee_id:', checkError);
      }

      if (existingEmployee) {
        return new Response(
          JSON.stringify({ error: `Employee ID "${employee_id}" already exists` }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Check for duplicate email in employees table BEFORE creating auth user
    const { data: existingEmail, error: emailCheckError } = await adminClient
      .from('employees')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError) {
      console.error('Error checking for duplicate email:', emailCheckError);
    }

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: `Email "${email}" already exists in employees` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if auth user already exists
    const { data: existingAuthUsers, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (!listError && existingAuthUsers?.users) {
      const existingAuthUser = existingAuthUsers.users.find(u => u.email === email);
      if (existingAuthUser) {
        return new Response(
          JSON.stringify({ error: `User with email "${email}" already exists in authentication` }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Now create the auth user
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
