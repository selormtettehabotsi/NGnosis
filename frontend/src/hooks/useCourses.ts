import { useCallback, useEffect, useState } from "react";
import { coursesApi } from "../lib/api";
import type { Course } from "../lib/types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    coursesApi
      .list()
      .then(setCourses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const deleteCourse = useCallback(
    async (id: number) => {
      await coursesApi.delete(id);
      refresh();
    },
    [refresh]
  );

  return { courses, loading, error, refresh, deleteCourse };
}
