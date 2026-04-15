import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, CheckCircle, Loader2, Plus, AlertCircle } from "lucide-react";

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

export default function Plugin() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [placed, setPlaced] = useState<string | null>(null);
  const [inserting, setInserting] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");
  const [isInPhotopea, setIsInPhotopea] = useState<boolean | null>(null);

  useEffect(() => {
    const inIframe = window.parent !== window;
    setIsInPhotopea(inIframe);
    setLog(inIframe ? "✓ Dentro de um iframe" : "✗ Não está em iframe (não está no Photopea)");

    const handler = (e: MessageEvent) => {
      if (e.data && typeof e.data === "string") {
        setLog("Photopea respondeu: " + e.data);
      } else if (e.data && e.data.photopea) {
        setLog("Photopea msg: " + JSON.stringify(e.data.photopea));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

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

  const handleInsert = async (player: Player) => {
    if (!player.strCutout || inserting) return;
    const safeName = player.strPlayer.replace(/['"\\]/g, "");
    setInserting(player.idPlayer);
    setLog("Buscando imagem...");
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(player.strCutout)}`;
      const resp = await fetch(proxyUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      const script = `app.open(new Uint8Array(photopea.resources[0]), { name: "${safeName}.png" }); app.echoToOE("done");`;
      window.parent.postMessage({ photopea: { script, resultType: "text", resources: [arrayBuffer] } }, "*");
      setLog("✓ Enviado ao Photopea!");
      setTimeout(() => {
        setInserting(null);
        setPlaced(player.idPlayer);
        setTimeout(() => setPlaced(null), 3000);
      }, 500);
    } catch (err) {
      setLog("Erro: " + String(err));
      setInserting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      <div className="bg-[#141414] border-b border-[#333] px-4 py-3">
        <h1 className="font-bold text-white text-base">Athlete Cutouts</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Toque em Inserir para adicionar ao Photopea</p>
      </div>

      {/* Debug panel */}
      <div className={`mx-3 mt-2 px-3 py-2 rounded-lg text-[11px] flex items-start gap-2 ${
        isInPhotopea === false ? "bg-red-900/50 border border-red-700 text-red-300"
        : isInPhotopea === true ? "bg-green-900/30 border border-green-800 text-green-300"
        : "bg-[#2a2a2a] text-gray-400"
      }`}>
        {isInPhotopea === false ? <AlertCircle size={12} className="shrink-0 mt-0.5" /> : <CheckCircle size={12} className="shrink-0 mt-0.5" />}
        <span>{log || "Carregando..."}</span>
      </div>

      <div className="px-3 pt-2 pb-2 space-y-2">
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
              <button onClick={() => { setQuery(""); setSearchTerm(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg shrink-0">
            Buscar
          </button>
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SEARCHES.map((n) => (
              <button key={n} onClick={() => { setQuery(n); setSearchTerm(n); }}
                className="bg-[#2a2a2a] text-gray-300 text-xs px-3 py-1.5 rounded-full border border-[#444]">
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#2a2a2a] rounded-xl animate-pulse h-16" />
        ))}

        {!isLoading && searchTerm && players.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">Nenhum cutout encontrado.</p>
        )}

        {!isLoading && players.length > 0 && (
          <>
            <p className="text-[11px] text-gray-500 mt-1">
              {players.length} cutout{players.length !== 1 ? "s" : ""} encontrado{players.length !== 1 ? "s" : ""}
            </p>
            {players.map((player) => {
              const isPlaced = placed === player.idPlayer;
              const isInserting_ = inserting === player.idPlayer;
              return (
                <div key={player.idPlayer} className="flex items-center gap-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2">
                  <div className="shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ width: 52, height: 64, background: "linear-gradient(160deg, #2d3040 0%, #232635 100%)" }}>
                    <img src={`${player.strCutout}/preview`} alt={player.strPlayer} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{player.strPlayer}</p>
                    {player.strTeam && <p className="text-[11px] text-gray-400 truncate">{player.strTeam}</p>}
                    {player.strPosition && <p className="text-[10px] text-gray-500 truncate">{player.strPosition}</p>}
                  </div>
                  <button
                    onClick={() => handleInsert(player)}
                    disabled={!!inserting}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                      isPlaced ? "bg-green-600 text-white"
                      : isInserting_ ? "bg-blue-700 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isInserting_ ? <Loader2 size={14} className="animate-spin" />
                      : isPlaced ? <CheckCircle size={14} />
                      : <Plus size={14} />}
                    {isInserting_ ? "..." : isPlaced ? "Ok!" : "Inserir"}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {!searchTerm && (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm px-4">Busque um atleta e toque em <strong className="text-gray-400">Inserir</strong>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
