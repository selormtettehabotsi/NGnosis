import { useCallback, useState } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic hook for one-off API calls with loading / error state.
 *
 * @example
 * const { execute, data, loading } = useApi(coursesApi.get);
 * useEffect(() => { execute(courseId); }, [courseId]);
 */
export function useApi<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  const [state, setState] = useState<UseApiState<TReturn>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await fn(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (e: unknown) {
        const error = e instanceof Error ? e.message : "Unknown error";
        setState({ data: null, loading: false, error });
        throw e;
      }
    },
    [fn]
  );

  return { ...state, execute };
}
