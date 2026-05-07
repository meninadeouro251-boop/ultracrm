import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { GetultralutionBotResponse } from "./types";

interface IParams {
  instanceName: string;
  ultralutionBotId: string;
  token?: string | null;
}

const queryKey = (params: Partial<IParams>) => ["ultralutionBot", "getultralutionBot", JSON.stringify(params)];

export const getultralutionBot = async ({ instanceName, token, ultralutionBotId }: IParams) => {
  const response = await api.get(`/ultralutionBot/fetch/${ultralutionBotId}/${instanceName}`, {
    headers: { apiKey: token },
  });
  if (Array.isArray(response.data)) {
    return response.data[0];
  }
  return response.data;
};

export const useGetultralutionBot = (props: UseQueryParams<GetultralutionBotResponse> & Partial<IParams>) => {
  const { instanceName, token, ultralutionBotId, ...rest } = props;
  return useQuery<GetultralutionBotResponse>({
    ...rest,
    queryKey: queryKey({ instanceName }),
    queryFn: () =>
      getultralutionBot({
        instanceName: instanceName!,
        token,
        ultralutionBotId: ultralutionBotId!,
      }),
    enabled: !!instanceName && !!ultralutionBotId && (props.enabled ?? true),
  });
};
