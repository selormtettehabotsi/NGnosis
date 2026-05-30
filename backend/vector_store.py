"""ChromaDB wrapper for Gnosis vector store operations."""

from typing import Optional
import chromadb
from chromadb.config import Settings as ChromaSettings

from config import get_settings

_settings = get_settings()


class VectorStore:
    """Thin wrapper around ChromaDB providing collection-per-course isolation."""

    def __init__(self) -> None:
        self._client = chromadb.PersistentClient(
            path=_settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )

    def _collection_name(self, course_id: int) -> str:
        return f"course_{course_id}"

    def get_or_create_collection(self, course_id: int):
        return self._client.get_or_create_collection(
            name=self._collection_name(course_id),
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(
        self,
        course_id: int,
        chunks: list[str],
        metadatas: list[dict],
        ids: list[str],
    ) -> None:
        collection = self.get_or_create_collection(course_id)
        collection.add(documents=chunks, metadatas=metadatas, ids=ids)

    def query(
        self,
        course_id: int,
        query_text: str,
        n_results: int = 5,
        where: Optional[dict] = None,
    ) -> list[dict]:
        collection = self.get_or_create_collection(course_id)
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        hits = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({"text": doc, "metadata": meta, "distance": dist})
        return hits

    def delete_document_chunks(self, course_id: int, document_id: int) -> None:
        collection = self.get_or_create_collection(course_id)
        collection.delete(where={"document_id": document_id})

    def delete_collection(self, course_id: int) -> None:
        name = self._collection_name(course_id)
        try:
            self._client.delete_collection(name)
        except Exception:
            pass

    def collection_count(self, course_id: int) -> int:
        collection = self.get_or_create_collection(course_id)
        return collection.count()


# Singleton
_vector_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
