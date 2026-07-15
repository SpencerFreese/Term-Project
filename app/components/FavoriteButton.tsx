"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FavoriteButtonProps = {
  movieId: number;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  className?: string;
};

export default function FavoriteButton({
  movieId,
  initialFavorited,
  isAuthenticated,
  className = "",
}: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (pending) {
      return;
    }

    const nextFavorited = !favorited;
    setFavorited(nextFavorited);
    setPending(true);

    try {
      const response = await fetch(
        nextFavorited
          ? "/api/profile/favorites"
          : `/api/profile/favorites/${movieId}`,
        {
          method: nextFavorited ? "POST" : "DELETE",
          headers: nextFavorited
            ? { "Content-Type": "application/json" }
            : undefined,
          body: nextFavorited ? JSON.stringify({ movieId }) : undefined,
        },
      );

      if (!response.ok) {
        setFavorited(!nextFavorited);
      } else {
        router.refresh();
      }
    } catch {
      setFavorited(!nextFavorited);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      disabled={pending}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg backdrop-blur transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    >
      <span
        className={favorited ? "text-red-500" : "text-white"}
        aria-hidden="true"
      >
        {favorited ? "♥" : "♡"}
      </span>
    </button>
  );
}
