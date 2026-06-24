// src/app/api/ai-assistant/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, konteks, tipe } = await req.json();

    const systemPrompt = `Kamu adalah asisten perencanaan desa yang ahli dalam administrasi pemerintahan desa Indonesia. 
Kamu membantu Kaur Perencanaan menyusun dokumen kegiatan desa yang sesuai dengan regulasi dan standar administrasi pemerintahan desa di Indonesia.
Format jawaban harus formal, menggunakan bahasa Indonesia yang baik dan benar sesuai EYD, dan sesuai standar dokumen pemerintah desa.
Jawab langsung tanpa pengantar berlebihan. Berikan konten yang siap pakai.`;

    const userPrompt = buildPrompt(tipe, konteks, prompt);

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY belum dikonfigurasi" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Groq API error:", err);
      return NextResponse.json({ error: err.error?.message ?? "Groq API error" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";

    if (!text) {
      return NextResponse.json({ error: "AI tidak menghasilkan respons. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghubungi AI Assistant" }, { status: 500 });
  }
}

function buildPrompt(tipe: string, konteks: Record<string, string>, extraPrompt: string): string {
  const base = `
Kegiatan: ${konteks?.namaKegiatan ?? "-"}
Bidang: ${konteks?.bidang ?? "-"}
Lokasi: ${konteks?.lokasi ?? "-"}
Volume: ${konteks?.volume ?? "-"} ${konteks?.satuan ?? "-"}
Pelaksana: ${konteks?.pelaksana ?? "-"}
Sasaran: ${konteks?.sasaran ?? "-"}
Anggaran: Rp ${Number(konteks?.anggaran ?? 0).toLocaleString("id-ID")}
`;

  const prompts: Record<string, string> = {
    latar_belakang: `Berdasarkan data kegiatan berikut:\n${base}\nBuatkan latar belakang kegiatan yang komprehensif (3-4 paragraf) yang mencakup:\n1. Kondisi existing / permasalahan yang ada\n2. Dasar hukum dan kebijakan yang mendasari\n3. Urgensi pelaksanaan kegiatan${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,
    tujuan: `Berdasarkan data kegiatan berikut:\n${base}\nBuatkan tujuan kegiatan yang SMART dalam format poin-poin (3-5 tujuan).${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,
    manfaat: `Berdasarkan data kegiatan berikut:\n${base}\nBuatkan uraian manfaat kegiatan dalam poin-poin (4-6 manfaat).${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,
    uraian: `Berdasarkan data kegiatan berikut:\n${base}\nBuatkan uraian lengkap kegiatan meliputi ruang lingkup, metode, tahapan, dan output.${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,
    default: extraPrompt || `Bantu saya menyusun konten untuk kegiatan:\n${base}`,
  };

  return prompts[tipe] ?? prompts.default;
}
