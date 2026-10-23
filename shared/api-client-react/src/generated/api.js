import { useQuery } from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
const getHealthCheckUrl = () => {
  return `/api/healthz`;
};
const healthCheck = async (options) => {
  return customFetch(getHealthCheckUrl(), {
    ...options,
    method: "GET"
  });
};
const getHealthCheckQueryKey = () => {
  return [`/api/healthz`];
};
const getHealthCheckQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({
    signal
  }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useHealthCheck(options) {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
export {
  getHealthCheckQueryKey,
  getHealthCheckQueryOptions,
  getHealthCheckUrl,
  healthCheck,
  useHealthCheck
};
