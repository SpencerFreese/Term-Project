import "server-only";

import { findAllGenres } from "@/lib/repositories/genreRepository";

export async function getAllGenres() {
  return findAllGenres();
}