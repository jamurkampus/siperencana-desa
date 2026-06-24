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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY belum dikonfigurasi" }, { status: 500 });
    }

    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Gemini API error:", err);
      throw new Error(err.error?.message ?? "Gemini API error");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

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
    latar_belakang: `Berdasarkan data kegiatan berikut:\n${base}\n
Buatkan latar belakang kegiatan yang komprehensif (3-4 paragraf) yang mencakup:
1. Kondisi existing / permasalahan yang ada
2. Dasar hukum dan kebijakan yang mendasari
3. Urgensi pelaksanaan kegiatan
${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,

    tujuan: `Berdasarkan data kegiatan berikut:\n${base}\n
Buatkan tujuan kegiatan yang SMART (Specific, Measurable, Achievable, Relevant, Time-bound) dalam format poin-poin yang jelas dan terukur (3-5 tujuan).
${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,

    manfaat: `Berdasarkan data kegiatan berikut:\n${base}\n
Buatkan uraian manfaat kegiatan yang mencakup:
1. Manfaat langsung bagi masyarakat sasaran
2. Manfaat jangka panjang bagi pembangunan desa
3. Dampak ekonomi / sosial yang diharapkan
Format dalam poin-poin (4-6 manfaat).
${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,

    uraian: `Berdasarkan data kegiatan berikut:\n${base}\n
Buatkan uraian lengkap kegiatan yang meliputi:
1. Ruang lingkup kegiatan
2. Metode pelaksanaan
3. Tahapan/proses pelaksanaan
4. Output yang diharapkan
Format paragraf yang mengalir dan informatif.
${extraPrompt ? `\nKonteks tambahan: ${extraPrompt}` : ""}`,

    default: extraPrompt || `Bantu saya menyusun konten untuk kegiatan:\n${base}`,
  };

  return prompts[tipe] ?? prompts.default;
}
