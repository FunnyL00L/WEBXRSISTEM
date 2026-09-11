/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  Power, 
  Code, 
  Send, 
  ExternalLink, 
  ShieldAlert, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  Layers, 
  X, 
  AlertCircle,
  FileCode,
  Sparkles,
  Download
} from "lucide-react";
import { ProjectType } from "../types";

interface ApiDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHost: string;
  onProjectCreated?: () => void;
}

export default function ApiDashboardModal({ isOpen, onClose, currentHost, onProjectCreated }: ApiDashboardModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [allowApiFileUpload, setAllowApiFileUpload] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "endpoints" | "tester">("keys");

  // Interactive Tester state
  const [testName, setTestName] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testType, setTestType] = useState<ProjectType>("web");
  const [testCoverImage, setTestCoverImage] = useState("");
  const [testIncludeFiles, setTestIncludeFiles] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApiConfig();
    }
  }, [isOpen]);

  const loadApiConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/admin/api-config");
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        setAllowApiFileUpload(data.allowApiFileUpload !== false);
      }
    } catch (err) {
      console.error("Gagal memuat konfigurasi API", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleToggleFileUpload = async (newValue: boolean) => {
    setSavingToggle(true);
    try {
      const res = await fetch("/api/admin/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowApiFileUpload: newValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setAllowApiFileUpload(data.allowApiFileUpload);
      }
    } catch (err) {
      console.error("Gagal mengubah izin upload berkas API", err);
    } finally {
      setSavingToggle(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm("Apakah Anda yakin ingin membuat kunci API baru? Kunci lama tidak akan bisa digunakan lagi pada dashboard eksternal.")) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/admin/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateKey: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
      }
    } catch (err) {
      console.error("Gagal me-regenerate kunci API", err);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunApiTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;
    setTestRunning(true);
    setTestResponse(null);
    setTestError(null);

    const payload: any = {
      name: testName.trim(),
      description: testDesc.trim() || undefined,
      projectType: testType,
      coverImage: testCoverImage.trim() || undefined,
    };

    if (testIncludeFiles) {
      payload.files = [
        {
          path: "index.html",
          content: `<!DOCTYPE html><html><head><title>${testName}</title><style>body{font-family:sans-serif;background:#09090b;color:#f4f4f5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head><body><div style="text-align:center;"><h1>${testName}</h1><p>Uploaded via External API Gateway (${testType.toUpperCase()})</p></div></body></html>`,
          isBinary: false,
        },
      ];
    }

    try {
      const res = await fetch("/api/v1/external/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menjalankan request API.");
      }

      setTestResponse(data);
      if (onProjectCreated) {
        onProjectCreated();
      }
    } catch (err: any) {
      setTestError(err.message);
    } finally {
      setTestRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                API Gateway & Dashboard Integrasi Eksternal
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v1.0 REST
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Kelola kredensial API, kontrol izin upload berkas, dan sambungkan dashboard kustom Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-zinc-950 border-b border-zinc-800 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("keys")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === "keys"
                ? "border-cyan-400 text-cyan-400 bg-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Kunci & Kontrol Berkas
          </button>
          <button
            onClick={() => setActiveTab("endpoints")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 ${
              activeTab === "endpoints"
                ? "border-cyan-400 text-cyan-400 bg-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Dokumentasi Endpoint
          </button>
          <button
            onClick={() => setActiveTab("tester")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === "tester"
                ? "border-cyan-400 text-cyan-400 bg-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulator Dashboard API
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans text-xs">
          {/* TAB 1: KEYS & POLICY */}
          {activeTab === "keys" && (
            <div className="space-y-5">
              {/* API Key Box */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Admin API Secret Key
                  </label>
                  <button
                    onClick={handleRegenerateKey}
                    disabled={regenerating}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${regenerating ? "animate-spin" : ""}`} />
                    Buat Ulang Kunci
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 font-mono text-xs overflow-x-auto select-all">
                    {loadingConfig ? "Memuat kunci API..." : apiKey || "Tidak ada kunci API"}
                  </div>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey ? "Disalin!" : "Salin Kunci"}
                  </button>
                </div>
                <p className="text-[10.5px] text-zinc-500">
                  Gunakan kunci ini pada header HTTP <code className="text-cyan-400">X-API-Key: {apiKey ? apiKey.substring(0, 10) + "..." : ""}</code> atau <code className="text-cyan-400">Authorization: Bearer [KEY]</code> saat berkomunikasi dari dashboard eksternal Anda.
                </p>
              </div>

              {/* Master File Upload Toggle */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      Kontrol Upload Berkas File di API
                      <span
                        className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                          allowApiFileUpload
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {allowApiFileUpload ? "Diizinkan" : "Dinonaktifkan"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Sesuai instruksi Anda: sebagai Administrator, Anda dapat <strong>menonaktifkan file berkas supaya tidak bisa terupload di API</strong>. Jika dinonaktifkan, permintaan API yang menyertakan file berkas fisik akan otomatis ditolak dengan kode status HTTP 403 Forbidden.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFileUpload(!allowApiFileUpload)}
                    disabled={savingToggle}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      allowApiFileUpload
                        ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {savingToggle
                      ? "Menyimpan..."
                      : allowApiFileUpload
                      ? "Nonaktifkan Upload Berkas"
                      : "Aktifkan Upload Berkas"}
                  </button>
                </div>

                {!allowApiFileUpload && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-[11px] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Upload berkas via API saat ini diblokir. Panggilan API hanya diperbolehkan meregistrasi metadata projek tanpa payload file mentah.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ENDPOINTS DOCUMENTATION */}
          {activeTab === "endpoints" && (
            <div className="space-y-4">
              {/* Highlight Banner: Unified Permanent JSON Feed */}
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-[10px]">
                      JSON UTAMA (TETAP)
                    </span>
                    <span className="font-bold text-xs text-zinc-200">Endpoint Permanen Tunggal</span>
                  </div>
                  <a
                    href={`/api/v1/projects`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <span>Buka JSON di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Tautan API tunggal yang <strong>tetap dan tidak berubah-ubah</strong>. Saat diakses langsung melalui browser ataupun fetch, otomatis menampilkan struktur JSON murni yang rapi berisi metadata projek, link pratinjau, dan tautan unduh ZIP.
                </p>
                <div className="bg-zinc-950 p-3 rounded-lg font-mono text-[11px] space-y-1.5 border border-zinc-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-400 select-all font-semibold">GET /api/v1/projects</span>
                    <span className="text-zinc-500 text-[10px]">Semua projek aktif</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-400 select-all font-semibold">GET /api/v1/projects?type=web</span>
                    <span className="text-zinc-500 text-[10px]">Hanya projek tipe Web</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-400 select-all font-semibold">GET /api/v1/projects?type=app</span>
                    <span className="text-zinc-500 text-[10px]">Hanya projek tipe Aplikasi</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-cyan-400 select-all font-semibold">GET /api/v1/projects?type=document</span>
                    <span className="text-zinc-500 text-[10px]">Hanya projek tipe Dokumen</span>
                  </div>
                </div>
              </div>

              {/* Endpoint Download ZIP */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <code className="text-zinc-200 font-mono text-xs">/api/v1/projects/:projectId/download</code>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  <strong>Download File Projek (Format ZIP):</strong> Digunakan oleh tim pembuat web / app untuk langsung mendownload arsip file yang dibutuhkan (misal khusus web atau khusus app) dalam 1 paket ZIP siap pakai.
                </p>
              </div>

              {/* Endpoint Detail Berkas JSON */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <code className="text-zinc-200 font-mono text-xs">/api/v1/projects/:projectId/files</code>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Mengembalikan daftar struktur berkas file individual projek dalam format JSON beserta tautan unduhan masing-masing file.
                </p>
              </div>

              {/* Endpoint 1: GET Projects Admin/External */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[10px]">
                    GET
                  </span>
                  <code className="text-zinc-200 font-mono text-xs">/api/v1/external/projects</code>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Mengambil seluruh daftar projek untuk integrasi dashboard terotentikasi (memerlukan header X-API-Key).
                </p>
                <div className="bg-zinc-900 p-2.5 rounded-lg font-mono text-[10.5px] text-zinc-400 overflow-x-auto">
                  <span className="text-zinc-500">Headers:</span>
                  <br />
                  X-API-Key: {apiKey}
                </div>
              </div>

              {/* Endpoint 2: POST Project */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold text-[10px]">
                    POST
                  </span>
                  <code className="text-zinc-200 font-mono text-xs">/api/v1/external/projects</code>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Membuat atau mengunggah projek baru dari dashboard eksternal. Otomatis menghasilkan link publik aktif karena diinisiasi oleh Administrator via API.
                </p>
                <div className="bg-zinc-900 p-2.5 rounded-lg font-mono text-[10.5px] text-zinc-400 overflow-x-auto">
                  <span className="text-zinc-500">Payload JSON:</span>
                  <br />
                  {`{
  "name": "Nama Projek Anda",
  "projectType": "aplikasi" | "web" | "dokumen",
  "description": "Deskripsi projek...",
  "coverImage": "https://... atau data:image/png;base64,...",
  "files": [
    { "path": "index.html", "content": "<h1>Hello</h1>", "isBinary": false }
  ]
}`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERACTIVE DASHBOARD SIMULATOR / TESTER */}
          {activeTab === "tester" && (
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Uji Coba Upload Projek Eksternal via REST API
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Coba kirimkan projek langsung ke API dengan opsi tipe projek (aplikasi / web / dokumen) dan upload gambar.
                  </p>
                </div>

                <form onSubmit={handleRunApiTest} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-1">Nama Projek</label>
                      <input
                        type="text"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="e.g. Modul Simulasi VR 3D"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-1">Bentuk Projek</label>
                      <select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value as ProjectType)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                      >
                        <option value="aplikasi">📱 Aplikasi (App)</option>
                        <option value="web">🌐 Web (Website)</option>
                        <option value="dokumen">📄 Dokumen (Document)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono mb-1">Deskripsi Projek (Opsional)</label>
                    <input
                      type="text"
                      value={testDesc}
                      onChange={(e) => setTestDesc(e.target.value)}
                      placeholder="Ringkasan fungsi projek..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono mb-1 flex items-center justify-between">
                      <span>Cover Image (URL Gambar atau Data URI)</span>
                      {testCoverImage && <span className="text-cyan-400">Gambar Dipilih</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testCoverImage}
                        onChange={(e) => setTestCoverImage(e.target.value)}
                        placeholder="https://... atau data:image/..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500 font-mono text-[11px]"
                      />
                      <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs flex items-center gap-1 cursor-pointer">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Pilih File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setTestCoverImage(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Toggle Include Files in request to test allowApiFileUpload */}
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Sertakan File Berkas (index.html) dalam Request API</p>
                      <p className="text-[10px] text-zinc-500">
                        Gunakan opsi ini untuk menguji apakah pemblokiran upload berkas API bekerja dengan baik.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={testIncludeFiles}
                      onChange={(e) => setTestIncludeFiles(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={testRunning}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {testRunning ? "Mengirim Request API..." : "Kirim Request POST ke API"}
                  </button>
                </form>

                {/* Response Output Display */}
                {testError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error Response (HTTP Status):</p>
                      <p className="font-mono text-[11px] mt-0.5">{testError}</p>
                    </div>
                  </div>
                )}

                {testResponse && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span className="font-bold">API Response: 200 OK (Projek Berhasil Dibuat)</span>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
                      <p className="text-cyan-400 font-bold">Tautan Publik Projek:</p>
                      <a
                        href={testResponse.project?.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-cyan-300 flex items-center gap-1 mt-0.5 text-zinc-200"
                      >
                        {testResponse.project?.publicUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center text-xs text-zinc-500">
          <span>External API Gateway Hypermedia System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
