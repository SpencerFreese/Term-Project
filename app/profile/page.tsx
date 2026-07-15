import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findUserProfileById } from "@/lib/repositories/userRepository";
import { findAddressByUserId } from "@/lib/repositories/addressRepository";
import { findCardsByUserId } from "@/lib/repositories/paymentCardRepository";
import { findFavoriteMoviesByUserId } from "@/lib/repositories/favoriteRepository";
import { lastFourDigits } from "@/lib/cardEncryption";
import LogoutButton from "../components/LogoutButton";
import Link from "next/link";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";
import AddressForm from "./components/AddressForm";
import PaymentCardsForm from "./components/PaymentCardsForm";
import FavoritesList from "./components/FavoritesList";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await findUserProfileById(session.userId);

  if (!user) {
    redirect("/login");
  }

  const [address, cards, favorites] = await Promise.all([
    findAddressByUserId(session.userId),
    findCardsByUserId(session.userId),
    findFavoriteMoviesByUserId(session.userId),
  ]);

  const maskedCards = cards.map((card) => ({
    cardId: card.cardId,
    cardholderName: card.cardholderName,
    cardType: card.cardType,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    lastFour: lastFourDigits(card.cardNumberEncrypted),
  }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
            Customer Profile
          </p>
          <h1 className="text-4xl font-bold">
            Welcome, {user.firstName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Home
          </Link>

          <LogoutButton />
        </div>
      </div>

      <ProfileForm
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
        phoneNumber={user.phoneNumber}
        promoSubscribed={Boolean(user.promoSubscribed)}
      />

      <PasswordForm />

      <AddressForm
        address={
          address
            ? {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country,
              }
            : null
        }
      />

      <PaymentCardsForm cards={maskedCards} />

      <FavoritesList favorites={favorites} />
    </main>
  );
}
