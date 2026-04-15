import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Download, CheckCircle } from "lucide-react";

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

const QUICK_SEARCHES = ["Messi", "Ronaldo", "LeBron", "Neymar", "Haaland"];

function sendToPhotopea(imageUrl: string, playerName: string) {
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

function placeFromUrl(imageUrl: string) {
  const script = `app.open("${imageUrl}", null, true);`;
  window.parent.postMessage({ photopea: { script } }, "https://www.photopea.com");
}

export default function Plugin() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [placed, setPlaced] = useState<string | null>(null);

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
    if (!player.strCutout) return;
    placeFromUrl(player.strCutout);
    setPlaced(player.idPlayer);
    setTimeout(() => setPlaced(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#2c2c2c] text-white text-sm flex flex-col">
      <div className="bg-[#1e1e1e] border-b border-[#444] px-3 py-2.5">
        <h1 className="font-bold text-white text-sm">Athlete Cutouts</h1>
        <p className="text-[10px] text-gray-400">Clique para inserir no Photopea</p>
      </div>

      <div className="px-2 pt-2 pb-1">
        <div className="flex gap-1">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nome do atleta..."
              className="w-full bg-[#3a3a3a] border border-[#555] text-white text-xs pl-7 pr-6 py-1.5 rounded focus:outline-none focus:border-blue-500"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSearchTerm(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded transition-colors shrink-0"
          >
            Ir
          </button>
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {QUICK_SEARCHES.map((n) => (
              <button
                key={n}
                onClick={() => { setQuery(n); setSearchTerm(n); }}
                className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300 text-[10px] px-2 py-0.5 rounded border border-[#555]"
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading && (
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#3a3a3a] rounded animate-pulse" style={{ height: 90 }} />
            ))}
          </div>
        )}

        {!isLoading && searchTerm && players.length === 0 && (
          <p className="text-gray-400 text-xs text-center py-6">
            Nenhum cutout encontrado.<br />
            <span className="text-[10px]">Tente outro nome.</span>
          </p>
        )}

        {!isLoading && players.length > 0 && (
          <>
            <p className="text-[10px] text-gray-500 mt-1.5 mb-1">
              {players.length} cutout{players.length !== 1 ? "s" : ""} encontrado{players.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {players.map((player) => {
                const isPlaced = placed === player.idPlayer;
                return (
                  <button
                    key={player.idPlayer}
                    onClick={() => handlePlace(player)}
                    className="relative bg-[#383838] hover:bg-[#444] rounded overflow-hidden border border-[#555] hover:border-blue-500 transition-all group"
                    style={{ height: 90 }}
                    title={`Inserir ${player.strPlayer} no Photopea`}
                  >
                    <div
                      className="w-full h-full flex items-end justify-center"
                      style={{ background: "linear-gradient(160deg, #3a3d45 0%, #2d3040 100%)" }}
                    >
                      <img
                        src={`${player.strCutout}/preview`}
                        alt={player.strPlayer}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-3">
                      <p className="text-[9px] text-white font-medium leading-tight truncate">
                        {player.strPlayer}
                      </p>
                    </div>

                    {isPlaced && (
                      <div className="absolute inset-0 bg-blue-600/80 flex items-center justify-center">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                    )}

                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download size={10} className="text-white/70" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {!searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-xs">Busque um atleta e clique na foto para inserir o cutout no documento ativo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
