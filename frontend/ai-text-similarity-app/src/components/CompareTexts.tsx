import React, { useState, useEffect } from "react";
import { compareTexts } from "../api";
import { useQueryClient } from "@tanstack/react-query";

const CompareTexts: React.FC = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("sentence-transformers");

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const form = document.getElementById("compare-form");
      if (form) {
        const rect = form.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCompare = async () => {
    if (!text1 || !text2) {
      setError("Both texts are required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await compareTexts(text1, text2, model);
      setSimilarity(response.similarity);
      setError(null);

      await queryClient.invalidateQueries({ queryKey: ["comparisons"] });

      setText1("");
      setText2("");
    } catch (err) {
      setError("Failed to compare texts. Please try again.");
      console.error("Error comparing texts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 ">
      <div
        id="compare-form"
        className="relative w-full max-w-2xl p-8 overflow-hidden  backdrop-blur-md rounded-lg border border-white/20 shadow-xl"
        style={{
          backgroundImage: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(74, 222, 128, 0.1), transparent 40%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 pointer-events-none" />
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Text Similarity
        </h1>
        <div className="space-y-6">
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter first text"
            className="w-full p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all resize-none h-24"
          />
          {error && <p className="text-red-500 -mt-6">{error}</p>}
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter second text"
            className="w-full p-4 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all resize-none h-24"
          />
          {error && <p className="text-red-500 -mt-6">{error}</p>}

          <div className="flex justify-center">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 bg-white/40 backdrop-blur-sm rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition-all"
            >
              <option className="text-black" value="sentence-transformers">
                Sentence Transformers
              </option>
              <option className="text-black" value="bert-small">
                BERT Small
              </option>
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={isLoading}
            className={`w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg border border-green-400 relative ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Compare</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              "Compare"
            )}
          </button>

          {similarity !== null && (
            <div className="text-center">
              <p className="text-xl font-semibold text-white">
                Similarity Score:{" "}
                <span className="text-white">{similarity}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareTexts;
