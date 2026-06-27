import { HomeDataResult } from "../page"
import SearchInput from "./SearchInput";
import GenreSelect from "./GenreSelect";

export default function SearchBar({
    searchTerm,
    selectedGenres,
    showDate,
    result,
}: {
    searchTerm: string;
    selectedGenres: string[];
    showDate: string;
    result: Extract<HomeDataResult, { ok: true }>;
}) {
    return (
    <form
        key={`${searchTerm}-${selectedGenres.join("-")}-${showDate}`}
        action="/"
        className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
        <SearchInput searchTerm={searchTerm} selectedGenres={selectedGenres} showDate={showDate}/>

        <GenreSelect selectedGenres={selectedGenres} result={result}/>
    </form>
    )
}