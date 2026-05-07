import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FetchultraaiRsponse } from "./types";

interface IParams {
  instanceName: string;
  token?: string;
}

const queryKey = (params: Partial<IParams>) => ["ultraai", "fetchultraai", JSON.stringify(params)];

export const fetchultraai = async ({ instanceName, token }: IParams) => {
  const response = await api.get(`/ultraai/find/${instanceName}`, {
    headers: { apikey: token },
  });
  return response.data;
};

export const useFetchultraai = (props: UseQueryParams<FetchultraaiRsponse> & Partial<IParams>) => {
  const { instanceName, token, ...rest } = props;
  return useQuery<FetchultraaiRsponse>({
    ...rest,
    queryKey: queryKey({ instanceName, token }),
    queryFn: () => fetchultraai({ instanceName: instanceName!, token: token! }),
    enabled: !!instanceName && (props.enabled ?? true),
  });
};
