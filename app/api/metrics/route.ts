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
          followers_gained: body.followers_gained,
          followers_lost: body.followers_lost,
          gender_men_pct: body.gender_men_pct,
          gender_women_pct: body.gender_women_pct,

          views_total: body.views_total,
          views_reels_pct: body.views_reels_pct,
          views_stories_pct: body.views_stories_pct,
          views_posts_pct: body.views_posts_pct,
          accounts_reached_pct: body.accounts_reached_pct,

          interactions_total: body.interactions_total,
          interactions_followers_pct: body.interactions_followers_pct,
          interactions_non_followers_pct: body.interactions_non_followers_pct,
          interactions_reels_pct: body.interactions_reels_pct,
          interactions_stories_pct: body.interactions_stories_pct,
          interactions_posts_pct: body.interactions_posts_pct,

          reels: body.reels,
          stories: body.stories,
          posts: body.posts,

          profile_visits: body.profile_visits,
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
