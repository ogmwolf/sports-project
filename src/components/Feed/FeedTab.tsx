"use client";
import { useApp } from "@/context/AppContext";
import Composer from "./Composer";
import FeedPost from "./FeedPost";
import NewsCard from "./NewsCard";

export default function FeedTab() {
  const { posts } = useApp();

  return (
    <div>
      <Composer />
      {posts.map((post, idx) => (
        <div key={post.id}>
          {idx === 1 && (
            // Show news inline on mobile/tablet; hidden on desktop (sidebar handles it)
            <div className="news-inline">
              <NewsCard />
            </div>
          )}
          <FeedPost post={post as any} />
        </div>
      ))}
    </div>
  );
}
