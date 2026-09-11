/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Lock, 
  UserPlus, 
  Info,
  ShieldAlert,
  Ban
} from "lucide-react";
import { UserRole } from "../types";

interface AdminUserItem {
  username: string;
  role: UserRole;
  createdAt: string;
  projectsCount: number;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
}

export default function UserManagementModal({ isOpen, onClose, currentUsername }: UserManagementModalProps) {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset password state
  const [targetResetUser, setTargetResetUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Add user state
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<UserRole>("user");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memuat daftar pengguna.");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (targetUsername: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(targetUsername);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUsername)}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah role pengguna.");

      setSuccessMsg(data.message);
      await loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResetUser) return;
    if (newPassword.length < 5) {
      setErrorMsg("Password baru minimal 5 karakter.");
      return;
    }

    setActionLoading(targetResetUser);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetResetUser)}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset password.");

      setSuccessMsg(data.message);
      setTargetResetUser(null);
      setNewPassword("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim() || addPassword.length < 5) {
      setErrorMsg("Username dan password minimal 5 karakter.");
      return;
    }

    setActionLoading("create-user");
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: addUsername.trim(), password: addPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat akun.");

      // If role should be admin, promote right away
      if (addRole === "admin") {
        await fetch(`/api/admin/users/${encodeURIComponent(addUsername.trim())}/role`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "admin" }),
        });
      }

      setSuccessMsg(`Akun @${addUsername.trim()} (${addRole.toUpperCase()}) berhasil dibuat.`);
      setShowAddUser(false);
      setAddUsername("");
      setAddPassword("");
      setAddRole("user");
      await loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Manajemen Pengguna & Otoritas
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Admin Panel
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Atur peran Administrator, ubah password pengguna, dan kelola akun terdaftar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Policy Notice Box */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-3 flex items-start gap-2.5 text-xs text-zinc-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-zinc-200">Kebijakan Keamanan Akun:</p>
              <p className="leading-relaxed text-[11px] text-zinc-400">
                • <strong className="text-zinc-300">Admin tidak dapat menghapus pengguna</strong> untuk mencegah penghapusan data sepihak dan menjaga riwayat kepemilikan projek.
                <br />
                • Admin dapat <strong className="text-cyan-400">menaikkan User menjadi Admin</strong> atau menurunkan kembali ke User.
                <br />
                • Jika pengguna lupa password, Admin dapat mereset kata sandi mereka langsung dari panel ini.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Total Pengguna Terdaftar ({users.length})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Muat Ulang
              </button>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Tambah Pengguna
              </button>
            </div>
          </div>

          {/* Form Add User */}
          <AnimatePresence>
            {showAddUser && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateUser}
                className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3"
              >
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Daftarkan Akun Pengguna / Admin Baru
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono mb-1">Username</label>
                    <input
                      type="text"
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      placeholder="Username baru..."
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono mb-1">Password</label>
                    <input
                      type="password"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="Min 5 karakter..."
                      required
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-mono mb-1">Peran (Role)</label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as UserRole)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                    >
                      <option value="user">User Biasa</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "create-user"}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 text-xs font-bold rounded-lg transition-all"
                  >
                    {actionLoading === "create-user" ? "Menyimpan..." : "Simpan Akun"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Reset Password Form Inline Modal */}
          <AnimatePresence>
            {targetResetUser && (
              <motion.form
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onSubmit={handleResetPassword}
                className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Reset Password Pengguna: @{targetResetUser}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setTargetResetUser(null)}
                    className="text-zinc-400 hover:text-zinc-200 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Masukkan kata sandi baru untuk akun ini. Sesi aktif pengguna akan otomatis di-reset.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru (min 5 karakter)..."
                    required
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === targetResetUser}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold rounded-lg transition-all"
                  >
                    {actionLoading === targetResetUser ? "Memperbarui..." : "Update Password"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* User Table / List */}
          <div className="space-y-2">
            {loading ? (
              <div className="py-8 text-center text-zinc-500 text-xs flex items-center justify-center gap-2 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                Memuat data pengguna...
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs font-mono">
                Belum ada pengguna terdaftar.
              </div>
            ) : (
              users.map((u) => {
                const isCurrent = u.username.toLowerCase() === currentUsername.toLowerCase();
                const isAdmin = u.role === "admin";
                const isRootAdmin = u.username.toLowerCase() === "bram@admin";

                return (
                  <div
                    key={u.username}
                    className="bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                          isAdmin
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {isAdmin ? "AD" : "US"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200 text-xs font-mono">
                            @{u.username}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              Anda
                            </span>
                          )}
                          <span
                            className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isAdmin
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
                            }`}
                          >
                            {isAdmin ? "Administrator" : "User"}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-3 mt-1 font-mono">
                          <span>Projek: {u.projectsCount}</span>
                          <span>•</span>
                          <span>Terdaftar: {new Date(u.createdAt).toLocaleDateString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Promote/Demote Role Button */}
                      {!isRootAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u.username, u.role)}
                          disabled={actionLoading === u.username}
                          title={isAdmin ? "Ubah jadi User biasa" : "Jadikan Administrator"}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isAdmin
                              ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700"
                              : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {isAdmin ? "Turunkan ke User" : "Jadikan Admin"}
                        </button>
                      )}

                      {/* Reset Password Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetResetUser(u.username);
                          setNewPassword("");
                        }}
                        title="Reset kata sandi pengguna ini jika lupa password"
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Reset Password
                      </button>

                      {/* Delete User Protected Badge */}
                      <div
                        title="Administrator tidak bisa menghapus user (Kebijakan sistem dilindungi)"
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-zinc-500 text-[10px] font-mono flex items-center gap-1 cursor-not-allowed select-none"
                      >
                        <Ban className="w-3 h-3 text-zinc-600" />
                        <span>Hapus Dikunci</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center text-xs text-zinc-500">
          <span>Hak istimewa Administrator dilindungi dengan PBKDF2-SHA512.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
