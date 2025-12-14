import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from 'crypto-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashEmail(email: string): string {
  return CryptoJS.SHA256(email.toLowerCase().trim()).toString()
}

export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function extractYouTubePlaylistId(url: string): string | null {
  const regex = /[?&]list=([^#\&\?]*)/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function isValidYouTubeUrl(url: string): boolean {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return regex.test(url)
}