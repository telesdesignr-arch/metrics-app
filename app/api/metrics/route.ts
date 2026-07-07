import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { COOKIE_NAME, isValidSessionValue } from "@/lib/auth";

async function checkAuth(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return isValidSessionValue(session);
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("metrics")
      .select("*")
      .order("month", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ metrics: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("metrics")
      .upsert(
        {
          month: body.month,
          followers: body.followers,
          new_followers: body.new_followers,
          reach: body.reach,
          impressions: body.impressions,
          profile_visits: body.profile_visits,
          likes: body.likes,
          comments: body.comments,
          shares: body.shares,
          saves: body.saves,
          posts_count: body.posts_count,
          notes: body.notes || null,
        },
        { onConflict: "month" }
      )
      .select();

    if (error) throw error;

    return NextResponse.json({ metric: data?.[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "É necessário informar o id do registro a apagar." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("metrics").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
