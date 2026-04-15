import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, CheckCircle, Loader2, Plus } from "lucide-react";

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

async function insertAsSmartObject(imageUrl: string, playerName: string) {
  const safeName = playerName.replace(/"/g, "");
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  const response = await fetch(proxyUrl);
  const arrayBuffer = await response.arrayBuffer();
  const script = `app.open(new Uint8Array(photopea.resources[0]), { name: "${safeName}.png" }, true);`;
  window.parent.postMessage({ photopea: { script, resources: [arrayBuffer] } }, "*");
}

export default function Plugin() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [placed, setPlaced] = useState<string | null>(null);
  const [inserting, setInserting] = useState<string | null>(null);

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

  const handleInsert = async (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    if (!player.strCutout || inserting) return;
    setInserting(player.idPlayer);
    try {
      await insertAsSmartObject(player.strCutout, player.strPlayer);
      setInserting(null);
      setPlaced(player.idPlayer);
      setTimeout(() => setPlaced(null), 2500);
    } catch {
      setInserting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      <div className="bg-[#141414] border-b border-[#333] px-4 py-3">
        <h1 className="font-bold text-white text-base">Athlete Cutouts</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Busque e insira cutouts no Photopea</p>
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

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {isLoading && (
          <div className="space-y-2 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#2a2a2a] rounded-xl animate-pulse h-16" />
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
            <p className="text-[11px] text-gray-500 mt-1">
              {players.length} cutout{players.length !== 1 ? "s" : ""} encontrado{players.length !== 1 ? "s" : ""}
            </p>
            {players.map((player) => {
              const isPlaced = placed === player.idPlayer;
              const isInserting = inserting === player.idPlayer;
              return (
                <div
                  key={player.idPlayer}
                  className="flex items-center gap-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2"
                >
                  <div
                    className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      width: 52,
                      height: 64,
                      background: "linear-gradient(160deg, #2d3040 0%, #232635 100%)",
                    }}
                  >
                    <img
                      src={`${player.strCutout}/preview`}
                      alt={player.strPlayer}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{player.strPlayer}</p>
                    {player.strTeam && (
                      <p className="text-[11px] text-gray-400 truncate">{player.strTeam}</p>
                    )}
                    {player.strPosition && (
                      <p className="text-[10px] text-gray-500 truncate">{player.strPosition}</p>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleInsert(e, player)}
                    disabled={!!inserting}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                      isPlaced
                        ? "bg-green-600 text-white"
                        : isInserting
                        ? "bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white"
                    }`}
                  >
                    {isInserting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isPlaced ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Plus size={14} />
                    )}
                    {isInserting ? "..." : isPlaced ? "Ok!" : "Inserir"}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {!searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm px-4">
              Busque um atleta e toque em <strong className="text-gray-400">Inserir</strong> para adicionar o cutout ao documento ativo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
