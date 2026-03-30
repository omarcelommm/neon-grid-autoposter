import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/api";
import { ExternalLink, Loader2 } from "lucide-react";

export default function PostsPage() {
  const { data: posts, isLoading, error } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Posts History</h2>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={18} className="animate-spin" /> Loading...
        </div>
      )}

      {error && <p className="text-destructive">Failed to load posts.</p>}

      {posts && posts.length === 0 && <p className="text-muted-foreground">No posts yet.</p>}

      {posts && posts.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left p-4 font-medium">Filename</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Caption</th>
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
                      {new Date(post.posted_at).toLocaleString()}
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
  );
}
