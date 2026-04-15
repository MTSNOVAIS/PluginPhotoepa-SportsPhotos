import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Image, ExternalLink, ChevronDown, SlidersHorizontal } from "lucide-react";

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
  { label: "Pequeno (200px)", value: 200 },
  { label: "Médio (320px)", value: 320 },
  { label: "Grande (480px)", value: 480 },
  { label: "Extra Grande (640px)", value: 640 },
  { label: "Original", value: 0 },
];

const POPULAR_SEARCHES = [
  "Messi", "Ronaldo", "LeBron", "Neymar", "Mbappé",
  "Haaland", "Curry", "Federer", "Djokovic", "Vinícius",
];

function buildCutoutUrl(url: string, size: number): string {
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
  const [imgError, setImgError] = useState(false);
  const cutoutUrl = buildCutoutUrl(player.strCutout!, size);
  const cardHeight = size === 0 ? 300 : Math.min(size + 20, 300);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      <div
        className="relative flex items-end justify-center overflow-hidden"
        style={{
          height: cardHeight,
          background: "linear-gradient(160deg, #e8edf5 0%, #d1d9e6 100%)",
        }}
      >
        {!imgError ? (
          <img
            src={cutoutUrl}
            alt={player.strPlayer}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 pb-8">
            <Image size={40} strokeWidth={1} />
            <span className="text-xs">Sem cutout</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        {player.strSport && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-full text-slate-700 border border-white/60">
            {player.strSport}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-900 text-sm truncate">{player.strPlayer}</h3>
        <div className="flex items-center justify-between mt-0.5 gap-1">
          <p className="text-xs text-slate-500 truncate">
            {player.strTeam || player.strNationality || "—"}
          </p>
          {player.strPosition && (
            <span className="text-xs text-slate-400 shrink-0">{player.strPosition}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{player.strPlayer}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {[player.strSport, player.strTeam, player.strNationality].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {player.strCutout && (
            <div
              className="rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
              style={{
                background: "linear-gradient(160deg, #e8edf5 0%, #d1d9e6 100%)",
                minHeight: 320,
              }}
            >
              <img
                src={player.strCutout}
                alt={player.strPlayer}
                className="max-w-full max-h-80 object-contain"
              />
            </div>
          )}

          <a
            href={player.strCutout!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ExternalLink size={14} />
            Abrir cutout em tamanho original
          </a>

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
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-5">
                {player.strDescriptionEN}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length <= 1) return null;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-xs font-medium pl-3 pr-7 py-1.5 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300 border transition-colors ${
          value !== "Todos"
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
        }`}
      >
        <option value="Todos">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
          value !== "Todos" ? "text-white/70" : "text-slate-500"
        }`}
      />
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [imageSize, setImageSize] = useState(320);
  const [filterSport, setFilterSport] = useState("Todos");
  const [filterTeam, setFilterTeam] = useState("Todos");
  const [filterNationality, setFilterNationality] = useState("Todos");
  const [filterPosition, setFilterPosition] = useState("Todos");
  const [showOnlyCutout] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const allPlayers = data?.player ?? [];
  const cutoutPlayers = showOnlyCutout
    ? allPlayers.filter((p) => !!p.strCutout)
    : allPlayers;

  const sportOptions = useMemo(
    () => [...new Set(cutoutPlayers.map((p) => p.strSport).filter(Boolean))].sort(),
    [cutoutPlayers]
  );
  const teamOptions = useMemo(
    () => [...new Set(cutoutPlayers.map((p) => p.strTeam).filter(Boolean))].sort(),
    [cutoutPlayers]
  );
  const nationalityOptions = useMemo(
    () => [...new Set(cutoutPlayers.map((p) => p.strNationality).filter(Boolean))].sort(),
    [cutoutPlayers]
  );
  const positionOptions = useMemo(
    () => [...new Set(cutoutPlayers.map((p) => p.strPosition).filter(Boolean))].sort(),
    [cutoutPlayers]
  );

  const filtered = useMemo(() => {
    return cutoutPlayers.filter((p) => {
      if (filterSport !== "Todos" && p.strSport !== filterSport) return false;
      if (filterTeam !== "Todos" && p.strTeam !== filterTeam) return false;
      if (filterNationality !== "Todos" && p.strNationality !== filterNationality) return false;
      if (filterPosition !== "Todos" && p.strPosition !== filterPosition) return false;
      return true;
    });
  }, [cutoutPlayers, filterSport, filterTeam, filterNationality, filterPosition]);

  const activeFiltersCount = [filterSport, filterTeam, filterNationality, filterPosition].filter(
    (f) => f !== "Todos"
  ).length;

  const clearFilters = () => {
    setFilterSport("Todos");
    setFilterTeam("Todos");
    setFilterNationality("Todos");
    setFilterPosition("Todos");
  };

  const handleSearch = useCallback(() => {
    setSearchTerm(query);
    clearFilters();
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const hasResults = !isLoading && searchTerm && allPlayers.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Fotos de Atletas</h1>
              <p className="text-xs text-slate-500">Cutout · Todos os esportes</p>
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
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar atleta (ex: Messi, LeBron, Federer...)"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-colors"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSearchTerm(""); clearFilters(); }}
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

          {hasResults && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  filtersOpen || activeFiltersCount > 0
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                <SlidersHorizontal size={12} />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {filtersOpen && (
                <>
                  <FilterSelect label="Esporte" value={filterSport} options={sportOptions} onChange={setFilterSport} />
                  <FilterSelect label="Time" value={filterTeam} options={teamOptions} onChange={setFilterTeam} />
                  <FilterSelect label="País" value={filterNationality} options={nationalityOptions} onChange={setFilterNationality} />
                  <FilterSelect label="Posição" value={filterPosition} options={positionOptions} onChange={setFilterPosition} />
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-slate-500 hover:text-slate-700 underline"
                    >
                      Limpar
                    </button>
                  )}
                </>
              )}

              <span className="text-xs text-slate-400 ml-auto">
                {filtered.length} de {allPlayers.length} atleta{allPlayers.length !== 1 ? "s" : ""}
                {cutoutPlayers.length < allPlayers.length && (
                  <> · <span className="text-slate-500">{cutoutPlayers.length} com cutout</span></>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!searchTerm && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✂️</div>
            <h2 className="text-lg font-semibold text-slate-700 mb-1">
              Fotos Cutout de Atletas
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
                <div className="bg-slate-200" style={{ height: 220 }} />
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

        {hasResults && filtered.length > 0 && (
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
        )}

        {hasResults && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Nenhum atleta com cutout nestes filtros.</p>
            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
              Limpar filtros
            </button>
          </div>
        )}

        {!isLoading && searchTerm && allPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Nenhum atleta encontrado para "{searchTerm}".</p>
            <p className="text-slate-400 text-xs mt-1">Tente um nome diferente ou em inglês.</p>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
