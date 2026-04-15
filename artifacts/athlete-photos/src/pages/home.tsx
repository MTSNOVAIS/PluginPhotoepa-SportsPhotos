import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Image, ExternalLink, ChevronDown } from "lucide-react";

interface Player {
  idPlayer: string;
  strPlayer: string;
  strSport: string;
  strTeam: string;
  strNationality: string;
  strPosition: string;
  strThumb: string | null;
  strRender: string | null;
  strCutout: string | null;
  strBanner: string | null;
  strFanart1: string | null;
  strDescriptionEN: string | null;
  dateBorn: string | null;
  strHeight: string | null;
  strWeight: string | null;
}

interface SportsDBResponse {
  player: Player[] | null;
}

const IMAGE_SIZES = [
  { label: "Pequeno", value: 200 },
  { label: "Médio", value: 320 },
  { label: "Grande", value: 480 },
  { label: "Extra Grande", value: 640 },
  { label: "Original", value: 0 },
];

const SPORT_FILTERS = [
  "Todos",
  "Soccer",
  "Basketball",
  "American Football",
  "Baseball",
  "Tennis",
  "MMA",
  "Boxing",
  "Rugby",
  "Cricket",
  "Hockey",
  "Formula 1",
];

const POPULAR_SEARCHES = [
  "Messi",
  "Ronaldo",
  "LeBron James",
  "Neymar",
  "Mbappé",
  "Haaland",
  "Curry",
  "Federer",
  "Djokovic",
  "Vinícius",
];

function buildImageUrl(url: string | null, size: number): string | null {
  if (!url) return null;
  if (size === 0) return url;
  return `${url}/preview`;
}

function PlayerCard({
  player,
  size,
  onClick,
}: {
  player: Player;
  size: number;
  onClick: () => void;
}) {
  const imageUrl =
    buildImageUrl(player.strThumb, size) ||
    buildImageUrl(player.strRender, size) ||
    buildImageUrl(player.strCutout, size);

  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      <div
        className="bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative"
        style={{ height: size === 0 ? 280 : Math.min(size, 280) }}
      >
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={player.strPlayer}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            style={{ maxWidth: size === 0 ? "100%" : size }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Image size={48} strokeWidth={1} />
            <span className="text-xs">Sem foto</span>
          </div>
        )}
        {player.strSport && (
          <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-slate-700 border border-slate-200">
            {player.strSport}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-900 text-sm truncate">
          {player.strPlayer}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-500 truncate">
            {player.strTeam || player.strNationality || "—"}
          </p>
          {player.strPosition && (
            <span className="text-xs text-slate-400 ml-2 shrink-0">
              {player.strPosition}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerModal({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const [selectedImageType, setSelectedImageType] = useState<
    "thumb" | "render" | "cutout" | "banner" | "fanart"
  >("thumb");

  const images: { type: typeof selectedImageType; label: string; url: string | null }[] = [
    { type: "thumb", label: "Retrato", url: player.strThumb },
    { type: "render", label: "Render", url: player.strRender },
    { type: "cutout", label: "Cutout", url: player.strCutout },
    { type: "banner", label: "Banner", url: player.strBanner },
    { type: "fanart", label: "Fan Art", url: player.strFanart1 },
  ].filter((i) => i.url);

  const currentImage =
    images.find((i) => i.type === selectedImageType)?.url || images[0]?.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {player.strPlayer}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {[player.strSport, player.strTeam, player.strNationality]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {currentImage && (
            <div className="bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl overflow-hidden mb-4 flex items-center justify-center" style={{ minHeight: 300 }}>
              <img
                src={currentImage}
                alt={player.strPlayer}
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {images.map((img) => (
                <button
                  key={img.type}
                  onClick={() => setSelectedImageType(img.type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedImageType === img.type
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          )}

          {currentImage && (
            <a
              href={currentImage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ExternalLink size={14} />
              Abrir imagem em tamanho original
            </a>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {player.strPosition && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Posição</p>
                <p className="font-medium text-slate-800">{player.strPosition}</p>
              </div>
            )}
            {player.dateBorn && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Nascimento</p>
                <p className="font-medium text-slate-800">{player.dateBorn}</p>
              </div>
            )}
            {player.strHeight && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Altura</p>
                <p className="font-medium text-slate-800">{player.strHeight}</p>
              </div>
            )}
            {player.strWeight && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Peso</p>
                <p className="font-medium text-slate-800">{player.strWeight}</p>
              </div>
            )}
            {player.strNationality && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Nacionalidade</p>
                <p className="font-medium text-slate-800">{player.strNationality}</p>
              </div>
            )}
            {player.strTeam && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-0.5">Time</p>
                <p className="font-medium text-slate-800">{player.strTeam}</p>
              </div>
            )}
          </div>

          {player.strDescriptionEN && (
            <div className="mt-3 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Sobre</p>
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                {player.strDescriptionEN}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [imageSize, setImageSize] = useState(320);
  const [sportFilter, setSportFilter] = useState("Todos");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const { data, isLoading, isError } = useQuery<SportsDBResponse>({
    queryKey: ["players", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { player: null };
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(searchTerm)}`
      );
      return res.json();
    },
    enabled: !!searchTerm.trim(),
  });

  const players = data?.player ?? [];
  const filtered =
    sportFilter === "Todos"
      ? players
      : players.filter((p) => p.strSport === sportFilter);

  const handleSearch = useCallback(() => {
    setSearchTerm(query);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Fotos de Atletas</h1>
              <p className="text-xs text-slate-500">Powered by TheSportsDB · Todos os esportes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:block">Tamanho:</span>
              <div className="relative">
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(Number(e.target.value))}
                  className="appearance-none bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 pr-7 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {IMAGE_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar atleta (ex: Messi, LeBron, Federer...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSearchTerm(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors shrink-0"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!searchTerm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏅</div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Busque qualquer atleta
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Futebol, basquete, tênis, MMA, F1 e muito mais
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
              {POPULAR_SEARCHES.map((name) => (
                <button
                  key={name}
                  onClick={() => { setQuery(name); setSearchTerm(name); }}
                  className="bg-white border border-slate-200 text-slate-600 text-sm px-3 py-1.5 rounded-full hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-slate-200" style={{ height: 200 }} />
                <div className="p-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-slate-500">
            <p>Erro ao buscar. Tente novamente.</p>
          </div>
        )}

        {!isLoading && searchTerm && players.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                {sportFilter !== "Todos" ? ` em ${sportFilter}` : ""}
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {SPORT_FILTERS.filter(
                  (s) => s === "Todos" || players.some((p) => p.strSport === s)
                ).map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSportFilter(sport)}
                    className={`shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      sportFilter === sport
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((player) => (
                <PlayerCard
                  key={player.idPlayer}
                  player={player}
                  size={imageSize}
                  onClick={() => setSelectedPlayer(player)}
                />
              ))}
            </div>
          </>
        )}

        {!isLoading && searchTerm && players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">
              Nenhum atleta encontrado para "{searchTerm}".
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Tente um nome diferente ou em inglês.
            </p>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
