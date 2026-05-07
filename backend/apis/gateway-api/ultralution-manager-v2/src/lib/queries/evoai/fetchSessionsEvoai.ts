import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FetchSessionsultraaiResponse } from "./types";

interface IParams {
  ultraaiId: string;
  instanceName: string;
}

const queryKey = (params: Partial<IParams>) => ["ultraai", "fetchSessions", JSON.stringify(params)];

export const fetchSessionsultraai = async ({ ultraaiId, instanceName }: IParams) => {
  const response = await api.get(`/ultraai/fetchSessions/${ultraaiId}/${instanceName}`);
  return response.data;
};

export const useFetchSessionsultraai = (props: UseQueryParams<FetchSessionsultraaiResponse> & Partial<IParams>) => {
  const { ultraaiId, instanceName, ...rest } = props;
  return useQuery<FetchSessionsultraaiResponse>({
    ...rest,
    queryKey: queryKey({ ultraaiId, instanceName }),
    queryFn: () => fetchSessionsultraai({ ultraaiId: ultraaiId!, instanceName: instanceName! }),
    enabled: !!instanceName && !!ultraaiId && (props.enabled ?? true),
    staleTime: 1000 * 10, // 10 seconds
  });
};
