import { useState } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchComparisons } from "../api";

interface Comparison {
  _id: string;
  text1: string;
  text2: string;
  similarity: number;
  model: string;
  createdAt: string;
}

interface ComparisonsResponse {
  comparisons: Comparison[];
  totalPages: number;
}

export default function ComparisonsList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError }: UseQueryResult<ComparisonsResponse> =
    useQuery({
      queryKey: ["comparisons", page],
      queryFn: () => fetchComparisons(page),
    });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching comparisons.</p>;
  if (!data) return <p>No comparisons found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-white mb-4 text-center">
        Comparison History
      </h2>
      <div className="space-y-2">
        {data.comparisons.length > 0 ? (
          data.comparisons.map((comp) => (
            <div
              key={comp._id}
              className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <h3 className="text-green-400 text-sm font-medium uppercase tracking-wider mb-2">
                    Text 1
                  </h3>
                  <p className="text-white/90 bg-black/20 p-3 rounded-lg min-h-[70px] whitespace-pre-wrap">
                    {comp.text1}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-green-400 text-sm font-medium uppercase tracking-wider mb-2">
                    Text 2
                  </h3>
                  <p className="text-white/90 bg-black/20 p-3 rounded-lg min-h-[70px] whitespace-pre-wrap">
                    {comp.text2}
                  </p>
                </div>
                {comp.model}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="text-white/80">Similarity Score:</span>
                  <span
                    className={`text-lg font-semibold ${
                      comp.similarity >= 0.7
                        ? "text-green-400"
                        : comp.similarity >= 0.4
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {comp.similarity.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-white/60 mt-2 sm:mt-0">
                  {new Date(comp.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60 text-lg">No comparisons found.</p>
          </div>
        )}
      </div>

      {data.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-6 py-2 bg-green-500/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500/30 transition-all duration-300 font-medium"
          >
            Previous
          </button>
          <span className="text-white font-medium">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((prev) => (prev < data.totalPages ? prev + 1 : prev))
            }
            disabled={page === data.totalPages}
            className="px-6 py-2 bg-green-500/20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-500/30 transition-all duration-300 font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
