import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, CheckCircle, Loader2 } from "lucide-react";

interface Player {
  idPlayer: string;
  strPlayer: string;
  strSport: string;
  strTeam: string;
  strNationality: string;
  strPosition: string;
  strCutout: string | null;
}

interface SportsDBResponse {
  player: Player[] | null;
}

const QUICK_SEARCHES = ["Messi", "Ronaldo", "Neymar", "Haaland", "Mbappé", "Vini Jr"];

function insertAsSmartObject(imageUrl: string, playerName: string) {
  const script = `
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "${imageUrl}", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
      var blob = new Uint8Array(xhr.response);
      app.open(blob, { name: "${playerName}.png" }, true);
    };
    xhr.send();
  `;
  window.parent.postMessage(
    { photopea: { script } },
    "https://www.photopea.com"
  );
}

export default function Plugin() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [placed, setPlaced] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery<SportsDBResponse>({
    queryKey: ["players-plugin", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { player: null };
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(searchTerm)}`
      );
      return res.json();
    },
    enabled: !!searchTerm.trim(),
  });

  const players = (data?.player ?? []).filter((p) => !!p.strCutout);

  const handleSearch = useCallback(() => {
    setSearchTerm(query);
    setPlaced(null);
  }, [query]);

  const handlePlace = (player: Player) => {
    if (!player.strCutout || loading) return;
    setLoading(player.idPlayer);
    insertAsSmartObject(player.strCutout, player.strPlayer);
    setTimeout(() => {
      setLoading(null);
      setPlaced(player.idPlayer);
      setTimeout(() => setPlaced(null), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      <div className="bg-[#141414] border-b border-[#333] px-4 py-3">
        <h1 className="font-bold text-white text-base">Athlete Cutouts</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Toque para inserir como objeto inteligente</p>
      </div>

      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nome do atleta..."
              className="w-full bg-[#2a2a2a] border border-[#444] text-white text-sm pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-blue-500"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSearchTerm(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            Buscar
          </button>
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SEARCHES.map((n) => (
              <button
                key={n}
                onClick={() => { setQuery(n); setSearchTerm(n); }}
                className="bg-[#2a2a2a] hover:bg-[#363636] active:bg-[#404040] text-gray-300 text-xs px-3 py-1.5 rounded-full border border-[#444]"
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#2a2a2a] rounded-xl animate-pulse" style={{ height: 140 }} />
            ))}
          </div>
        )}

        {!isLoading && searchTerm && players.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">
            Nenhum cutout encontrado.<br />
            <span className="text-xs text-gray-500">Tente outro nome.</span>
          </p>
        )}

        {!isLoading && players.length > 0 && (
          <>
            <p className="text-[11px] text-gray-500 mt-1 mb-2">
              {players.length} cutout{players.length !== 1 ? "s" : ""} encontrado{players.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => {
                const isPlaced = placed === player.idPlayer;
                const isLoading_ = loading === player.idPlayer;
                return (
                  <button
                    key={player.idPlayer}
                    onClick={() => handlePlace(player)}
                    disabled={!!loading}
                    className="relative bg-[#2a2a2a] hover:bg-[#333] active:bg-[#3a3a3a] rounded-xl overflow-hidden border border-[#444] hover:border-blue-500 transition-all"
                    style={{ height: 140 }}
                    title={`Inserir ${player.strPlayer}`}
                  >
                    <div
                      className="w-full h-full flex items-end justify-center"
                      style={{ background: "linear-gradient(160deg, #2d3040 0%, #232635 100%)" }}
                    >
                      <img
                        src={`${player.strCutout}/preview`}
                        alt={player.strPlayer}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-6">
                      <p className="text-[11px] text-white font-semibold leading-tight truncate text-left">
                        {player.strPlayer}
                      </p>
                      {player.strTeam && (
                        <p className="text-[10px] text-gray-400 truncate text-left">{player.strTeam}</p>
                      )}
                    </div>

                    {(isPlaced || isLoading_) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl"
                        style={{ background: isPlaced ? "rgba(37,99,235,0.85)" : "rgba(0,0,0,0.6)" }}>
                        {isLoading_ ? (
                          <Loader2 size={28} className="text-white animate-spin" />
                        ) : (
                          <CheckCircle size={28} className="text-white" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm px-4">
              Busque um atleta e toque na foto para inserir o cutout no documento ativo como objeto inteligente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
