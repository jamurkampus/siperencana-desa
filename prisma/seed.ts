// prisma/seed.ts
import { PrismaClient, BidangKegiatan, SumberDana, StatusKegiatan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Desa
  const desa = await prisma.desa.upsert({
    where: { id: "desa-susuk-dalam" },
    update: {},
    create: {
      id: "desa-susuk-dalam",
      namaDesaLengkap: "Desa Susuk Dalam",
      namaDesa: "Susuk Dalam",
      kecamatan: "Anggana",
      kabupaten: "Kutai Kartanegara",
      provinsi: "Kalimantan Timur",
      kodePos: "75394",
      kepalaDesaNama: "Nama Kepala Desa",
      kaurPerencNama: "Lamri, S.P.",
      alamatKantor: "Jl. Utama No. 1, Desa Susuk Dalam",
    },
  });

  // Seed Tahun Anggaran
  const tahun2024 = await prisma.tahunAnggaran.upsert({
    where: { tahun: 2024 },
    update: {},
    create: { tahun: 2024, isAktif: false },
  });

  const tahun2025 = await prisma.tahunAnggaran.upsert({
    where: { tahun: 2025 },
    update: {},
    create: { tahun: 2025, isAktif: true },
  });

  // Seed sample kegiatan
  const kegiatan1 = await prisma.kegiatan.create({
    data: {
      kodeKegiatan: "2025.02.001",
      namaKegiatan: "Pembangunan Jalan Rabat Beton RT 01",
      bidang: BidangKegiatan.PEMBANGUNAN_DESA,
      lokasi: "RT 01 Dusun Maju",
      volume: 200,
      satuan: "Meter",
      tahunAnggaranId: tahun2025.id,
      sumberDana: SumberDana.DD,
      pelaksana: "TPK Desa Susuk Dalam",
      sasaran: "Masyarakat RT 01 Dusun Maju sebanyak 150 KK",
      manfaat: "Memperlancar akses transportasi dan mobilitas warga",
      latarBelakang: "Kondisi jalan di RT 01 Dusun Maju masih berupa tanah dan sering tergenang air pada musim hujan, sehingga menghambat aktivitas masyarakat.",
      tujuan: "Meningkatkan kualitas infrastruktur jalan desa untuk mendukung mobilitas masyarakat",
      anggaran: 150000000,
      status: StatusKegiatan.DISETUJUI,
      desaId: desa.id,
      jadwal: {
        create: [
          { bulan: 3, keterangan: "Persiapan dan pengadaan material" },
          { bulan: 4, keterangan: "Pelaksanaan konstruksi" },
          { bulan: 5, keterangan: "Serah terima dan dokumentasi" },
        ],
      },
      panitia: {
        create: [
          { nama: "Budi Santoso", jabatan: "Ketua TPK" },
          { nama: "Siti Rahayu", jabatan: "Sekretaris" },
          { nama: "Agus Wijaya", jabatan: "Bendahara" },
        ],
      },
      rab: {
        create: [
          { uraian: "Semen Portland", satuan: "Sak", volume: 500, hargaSatuan: 65000, total: 32500000, urutan: 1 },
          { uraian: "Pasir Pasang", satuan: "M3", volume: 30, hargaSatuan: 250000, total: 7500000, urutan: 2 },
          { uraian: "Batu Kerikil", satuan: "M3", volume: 20, hargaSatuan: 300000, total: 6000000, urutan: 3 },
          { uraian: "Besi Beton 12mm", satuan: "Batang", volume: 200, hargaSatuan: 85000, total: 17000000, urutan: 4 },
          { uraian: "Upah Tenaga Kerja", satuan: "HOK", volume: 300, hargaSatuan: 150000, total: 45000000, urutan: 5 },
        ],
      },
    },
  });

  await prisma.kegiatan.create({
    data: {
      kodeKegiatan: "2025.03.001",
      namaKegiatan: "Pelatihan Keterampilan Menjahit bagi Perempuan",
      bidang: BidangKegiatan.PEMBERDAYAAN_MASYARAKAT,
      lokasi: "Balai Desa Susuk Dalam",
      volume: 30,
      satuan: "Peserta",
      tahunAnggaranId: tahun2025.id,
      sumberDana: SumberDana.ADD,
      pelaksana: "PKK Desa Susuk Dalam",
      sasaran: "Perempuan usia produktif 18-45 tahun",
      manfaat: "Meningkatkan keterampilan dan kemandirian ekonomi perempuan desa",
      anggaran: 25000000,
      status: StatusKegiatan.DRAFT,
      desaId: desa.id,
      jadwal: {
        create: [
          { bulan: 6, keterangan: "Pendaftaran dan seleksi peserta" },
          { bulan: 7, keterangan: "Pelaksanaan pelatihan" },
        ],
      },
    },
  });

  console.log("✅ Seed berhasil!");
  console.log(`   Desa: ${desa.namaDesa}`);
  console.log(`   Tahun anggaran aktif: ${tahun2025.tahun}`);
  console.log(`   Kegiatan sample dibuat`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
