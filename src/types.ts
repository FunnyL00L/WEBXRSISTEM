/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared TypeScript type definitions for the application

export type UserRole = "admin" | "user";

export interface User {
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  createdAt: string;
}

export type ProjectType = "aplikasi" | "web" | "dokumen" | "app" | "document";

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerUsername: string;
  status: "active" | "inactive" | "pending";
  isApproved?: boolean; // Validated / approved by Admin
  isProtected: boolean;
  passwordHash: string | null;
  passwordSalt: string | null;
  filesCount: number;
  createdAt: string;
  accessCount?: number;
  lastAccessedAt?: string;
  projectType?: ProjectType;
  coverImage?: string; // Base64 data URL or relative URL
  hasPublicLink?: boolean; // True if permitted
}

export interface Session {
  id: string;
  username: string;
  expiresAt: string;
}

export interface StorageConfig {
  customPath: string;
}

export interface ApiConfig {
  apiKey: string;
  allowApiFileUpload: boolean;
}

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  sessions: Session[];
  storageConfig?: StorageConfig;
  apiConfig?: ApiConfig;
}

export interface UploadFilePayload {
  path: string;
  content: string; // Base64 or Text representation
  isBinary: boolean;
}

export interface ProjectUploadRequest {
  name: string;
  files: UploadFilePayload[];
  projectType?: ProjectType;
  coverImage?: string;
}
