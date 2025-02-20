import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export interface Comparison {
  _id: string;
  text1: string;
  text2: string;
  similarity: number;
  model: string;
  createdAt: string;
}

export interface ComparisonsResponse {
  comparisons: Comparison[];
  totalPages: number;
}

export const fetchComparisons = async (
  page: number
): Promise<ComparisonsResponse> => {
  try {
    const { data } = await axios.get<ComparisonsResponse>(
      `http://localhost:5000/api/compare?page=${page}&limit=3`
    );
    return data;
  } catch (error) {
    console.error("Error fetching comparisons: ", error);
    return { comparisons: [], totalPages: 0 } as ComparisonsResponse;
  }
};

export const compareTexts = async (
  text1: string,
  text2: string,
  model: string = "sentence-transformers"
): Promise<Comparison> => {
  try {
    const { data } = await api.post<Comparison>(
      "http://localhost:5000/api/compare",
      {
        text1,
        text2,
        model,
      }
    );

    return data;
  } catch (error) {
    console.error("Error comparing texts: ", error);
    throw new Error("Failed to compare texts");
  }
};

export const deleteComparison = async (id: string): Promise<void> => {
  try {
    await api.delete(`/compare/${id}`);
  } catch (error) {
    console.error("Error deleting comparison:", error);
    throw new Error("Failed to delete comparison");
  }
};

export default api;
