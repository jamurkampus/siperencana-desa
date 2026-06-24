"use client";
// src/app/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Map, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "daftar">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "", password: "", nama: "", instansi: "", keperluan: "",
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        username: form.username,
        password: form.password,
        keperluan: form.keperluan,
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

  async function handleDaftar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          nama: form.nama,
          instansi: form.instansi,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar");
      } else {
        setMode("login");
        setError("");
        setForm({ ...form, nama: "", instansi: "" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Map size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SiPerenDesa</h1>
          <p className="text-primary-300 text-sm mt-1">Sistem Informasi Perencanaan Desa</p>
          <p className="text-primary-400 text-xs mt-0.5">Desa Susuk Dalam</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Tab */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "login" ? "bg-white shadow text-primary-700" : "text-gray-500"}`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setMode("daftar"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "daftar" ? "bg-white shadow text-primary-700" : "text-gray-500"}`}
            >
              Daftar Tamu
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="Masukkan password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Keperluan <span className="text-gray-400 font-normal">(khusus tamu)</span></label>
                <input
                  value={form.keperluan}
                  onChange={e => setForm(p => ({ ...p, keperluan: e.target.value }))}
                  className="input-field"
                  placeholder="Contoh: Studi banding, kunjungan kerja..."
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDaftar} className="space-y-4">
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  value={form.nama}
                  onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                  className="input-field"
                  placeholder="Nama lengkap Anda"
                  required
                />
              </div>
              <div>
                <label className="label">Instansi / Asal</label>
                <input
                  value={form.instansi}
                  onChange={e => setForm(p => ({ ...p, instansi: e.target.value }))}
                  className="input-field"
                  placeholder="Nama instansi atau asal daerah"
                />
              </div>
              <div>
                <label className="label">Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field"
                  placeholder="Buat username unik"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Mendaftar..." : "Daftar sebagai Tamu"}
              </button>
              <p className="text-xs text-gray-400 text-center">Akun tamu hanya bisa melihat data, tidak bisa mengedit.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
