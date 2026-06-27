"use client";
// src/app/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Map, Eye, EyeOff, MapPin, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "tamu">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lokasi, setLokasi] = useState<{ lat: number; lng: number } | null>(null);
  const [lokasiStatus, setLokasiStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [form, setForm] = useState({ username: "", password: "", nama: "", instansi: "", keperluan: "" });

  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let device = "PC";
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) device = "Mobile";
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";
    let os = "Unknown";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";
    return `${device} | ${browser} | ${os}`;
  }

  async function mintaLokasi() {
    setLokasiStatus("loading");
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolokasi");
      setLokasiStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLokasi({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLokasiStatus("ok");
        setError("");
      },
      () => {
        setLokasiStatus("denied");
        setError("Lokasi ditolak browser. Cek pengaturan izin lokasi di browser Anda.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        username: form.username,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        setError("Username atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleTamu(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama || !form.keperluan) {
      setError("Nama dan keperluan wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const deviceInfo = getDeviceInfo();
      const res = await fetch("/api/auth/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          instansi: form.instansi,
          keperluan: form.keperluan,
          lat: lokasi?.lat ?? null,
          lng: lokasi?.lng ?? null,
          device: deviceInfo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk");
      } else {
        await signIn("credentials", {
          username: data.username,
          password: data.password,
          redirect: false,
        });
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Map size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SiPerenDesa</h1>
          <p className="text-primary-300 text-sm mt-1">Sistem Informasi Perencanaan Desa</p>
          <p className="text-primary-400 text-xs mt-0.5">Desa Susuk Dalam</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-white shadow text-primary-700" : "text-gray-500"}`}
            >
              Admin
            </button>
            <button
              onClick={() => { setMode("tamu"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "tamu" ? "bg-white shadow text-primary-700" : "text-gray-500"}`}
            >
              Tamu
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="input-field" placeholder="Username admin" required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pr-10" placeholder="Password" required />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Memproses..." : "Masuk sebagai Admin"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTamu} className="space-y-4">
              <div className={`p-3 rounded-xl border-2 ${lokasiStatus === "ok" ? "border-emerald-300 bg-emerald-50" : lokasiStatus === "denied" ? "border-rose-200 bg-rose-50" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className={lokasiStatus === "ok" ? "text-emerald-600" : "text-gray-400"} />
                    <span className="text-sm font-medium text-gray-700">
                      {lokasiStatus === "ok" ? "✓ Lokasi terdeteksi" : lokasiStatus === "denied" ? "Lokasi ditolak" : lokasiStatus === "loading" ? "Mendeteksi..." : "Aktifkan lokasi (opsional)"}
                    </span>
                  </div>
                  {lokasiStatus !== "ok" && (
                    <button type="button" onClick={mintaLokasi} disabled={lokasiStatus === "loading"} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                      {lokasiStatus === "loading" ? <Loader2 size={12} className="animate-spin" /> : null}
                      {lokasiStatus === "loading" ? "..." : "Aktifkan"}
                    </button>
                  )}
                </div>
                {lokasi && (
                  <p className="text-xs text-emerald-600 mt-1">{lokasi.lat.toFixed(5)}, {lokasi.lng.toFixed(5)}</p>
                )}
              </div>

              <div>
                <label className="label">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} className="input-field" placeholder="Nama lengkap Anda" required />
              </div>
              <div>
                <label className="label">Instansi / Asal</label>
                <input value={form.instansi} onChange={e => setForm(p => ({ ...p, instansi: e.target.value }))} className="input-field" placeholder="Nama instansi atau asal daerah" />
              </div>
              <div>
                <label className="label">Keperluan <span className="text-rose-500">*</span></label>
                <textarea value={form.keperluan} onChange={e => setForm(p => ({ ...p, keperluan: e.target.value }))} className="input-field" rows={2} placeholder="Tujuan kunjungan Anda" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Memproses..." : "Masuk sebagai Tamu"}
              </button>
              <p className="text-xs text-gray-400 text-center">Lokasi bersifat opsional tapi sangat dianjurkan untuk keamanan.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
