import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchQueue } from "@/lib/api";
import { ExternalLink, Loader2, Clock, CheckCircle } from "lucide-react";

export default function PostsPage() {
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
  const { data: queue, isLoading: queueLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: fetchQueue,
  });

  const isLoading = postsLoading || queueLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Posts</h2>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin" /> Carregando...
        </div>
      )}

      {/* Fila de vídeos */}
      {!queueLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-neon-blue" />
            <h3 className="font-heading font-semibold text-lg">
              Fila ({queue?.length ?? 0} vídeos)
            </h3>
          </div>

          {queue && queue.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum vídeo na fila.</p>
          )}

          {queue && queue.length > 0 && (
            <div className="glass-card-blue overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-4 font-medium w-8">#</th>
                      <th className="text-left p-4 font-medium">Arquivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((filename, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-4 text-muted-foreground">{i + 1}</td>
                        <td className="p-4 font-medium truncate max-w-[400px]">{filename}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico de posts */}
      {!postsLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="neon-text-green" />
            <h3 className="font-heading font-semibold text-lg">
              Postados ({posts?.length ?? 0})
            </h3>
          </div>

          {postsError && <p className="text-destructive text-sm">Falha ao carregar posts.</p>}

          {posts && posts.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum post ainda.</p>
          )}

          {posts && posts.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-4 font-medium">Arquivo</th>
                      <th className="text-left p-4 font-medium">Data</th>
                      <th className="text-left p-4 font-medium hidden md:table-cell">Legenda</th>
                      <th className="text-center p-4 font-medium w-16">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post, i) => (
                      <tr
                        key={post.post_id || i}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors animate-row-enter"
                        style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
                      >
                        <td className="p-4 font-medium truncate max-w-[200px]">{post.filename}</td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {new Date(post.posted_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          <span className="line-clamp-2 max-w-[300px] block">{post.caption}</span>
                        </td>
                        <td className="p-4 text-center">
                          {post.post_id && (
                            <a
                              href={`https://www.instagram.com/p/${post.post_id}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex text-neon-blue hover:neon-text-blue transition-all"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
