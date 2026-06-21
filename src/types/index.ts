// src/types/index.ts
export type {
  Desa,
  TahunAnggaran,
  Kegiatan,
  JadwalKegiatan,
  Panitia,
  RabItem,
  Dokumen,
  BidangKegiatan,
  SumberDana,
  StatusKegiatan,
  JenisDokumen,
  StatusDokumen,
} from "@prisma/client";

export interface KegiatanWithRelations {
  id: string;
  kodeKegiatan: string | null;
  namaKegiatan: string;
  bidang: string;
  lokasi: string;
  volume: number;
  satuan: string;
  sumberDana: string;
  pelaksana: string;
  sasaran: string;
  manfaat: string;
  latarBelakang: string | null;
  tujuan: string | null;
  uraianKegiatan: string | null;
  anggaran: number | string;
  status: string;
  desaId: string;
  tahunAnggaranId: string;
  createdAt: Date;
  updatedAt: Date;
  tahunAnggaran: { tahun: number };
  desa: { namaDesa: string; kepalaDesaNama: string; kaurPerencNama: string };
  jadwal: { id: string; bulan: number; keterangan: string | null }[];
  panitia: { id: string; nama: string; jabatan: string; nip: string | null }[];
  dokumen: { id: string; jenis: string; nomor: string | null; status: string }[];
  rab: RabItemType[];
}

export interface RabItemType {
  id: string;
  uraian: string;
  satuan: string;
  volume: number;
  hargaSatuan: number | string;
  total: number | string;
  keterangan: string | null;
  urutan: number;
}

export interface DashboardStats {
  totalKegiatan: number;
  totalAnggaran: number;
  kegiatanBerjalan: number;
  kegiatanSelesai: number;
  kegiatanDraft: number;
  perBidang: { bidang: string; count: number; anggaran: number }[];
  perSumber: { sumber: string; count: number; anggaran: number }[];
}

export interface FormKegiatanData {
  namaKegiatan: string;
  bidang: string;
  lokasi: string;
  volume: number;
  satuan: string;
  tahunAnggaranId: string;
  sumberDana: string;
  pelaksana: string;
  sasaran: string;
  manfaat: string;
  latarBelakang?: string;
  tujuan?: string;
  uraianKegiatan?: string;
  anggaran: number;
  jadwal: { bulan: number; keterangan?: string }[];
  panitia: { nama: string; jabatan: string; nip?: string }[];
  rab: { uraian: string; satuan: string; volume: number; hargaSatuan: number; keterangan?: string }[];
}
