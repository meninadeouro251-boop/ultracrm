import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FetchSessionsultralutionBotResponse } from "./types";

interface IParams {
  instanceName: string | null;
  ultralutionBotId: string | null;
  token?: string | null;
}

const queryKey = (params: Partial<IParams>) => ["ultralutionBot", "fetchSessions", JSON.stringify(params)];

export const fetchultralutionBotSessions = async ({ instanceName, ultralutionBotId, token }: IParams) => {
  const response = await api.get(`/ultralutionBot/fetchSessions/${ultralutionBotId}/${instanceName}`, {
    headers: { apiKey: token },
  });
  return response.data;
};

export const useFetchSessionsultralutionBot = (props: UseQueryParams<FetchSessionsultralutionBotResponse> & Partial<IParams>) => {
  const { instanceName, token, ultralutionBotId, ...rest } = props;
  return useQuery<FetchSessionsultralutionBotResponse>({
    ...rest,
    queryKey: queryKey({ instanceName }),
    queryFn: () =>
      fetchultralutionBotSessions({
        instanceName: instanceName!,
        token,
        ultralutionBotId: ultralutionBotId!,
      }),
    enabled: !!instanceName && !!ultralutionBotId && (props.enabled ?? true),
  });
};
