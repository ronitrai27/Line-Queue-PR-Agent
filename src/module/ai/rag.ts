import { pineconeIndex } from "@/lib/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";

interface FileItem {
  path: string;
  content: string;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // embeddingModel
  const { embedding } = await embed({
    model: google.textEmbeddingModel("text-embedding-004"),
    value: text,
  });

  return embedding;
}

export async function indexCodebase(
  repoId: string,
  files: FileItem[]
): Promise<void> {
  const vectors = [];

  for (const file of files) {
    const content = `File ${file.path}:\n\n${file.content}`;
    const tuncatedContent = content.substring(0, 8000);

    try {
      const embedding = await generateEmbedding(tuncatedContent);

      vectors.push({
        id: `${repoId}-${file.path.replace(/\//g, "_")}`,
        values: embedding,
        metadata: {
          repoId,
          path: file.path,
          content: tuncatedContent,
        },
      });
    } catch (error) {
      console.error(`Failed to generate embedding for ${file.path}: ${error}`);
    }
  }

  if (vectors.length > 0) {
    const batchSize = 100;

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);

      console.log(`Indexing ${batch.length} vectors...`);

      await pineconeIndex.upsert(batch);
    }
  }

  console.log;
}

export async function retrieveContext(
  query: string,
  repoId: string,
  topK: number = 5
) {
  const embeddings = await generateEmbedding(query);

  const result = await pineconeIndex.query({
    vector: embeddings,
    topK,
    includeMetadata: true,
  });

  //   return result.matches;
  return result.matches
    .map((match) => match.metadata?.content as string)
    .filter(Boolean);
}
