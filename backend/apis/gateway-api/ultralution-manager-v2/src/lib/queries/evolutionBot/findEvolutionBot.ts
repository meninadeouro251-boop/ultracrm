import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FindultralutionBotResponse } from "./types";

interface IParams {
  instanceName: string | null;
  token?: string | null;
}

const queryKey = (params: Partial<IParams>) => ["ultralutionBot", "findultralutionBot", JSON.stringify(params)];

export const findultralutionBot = async ({ instanceName, token }: IParams) => {
  const response = await api.get(`/ultralutionBot/find/${instanceName}`, {
    headers: { apiKey: token },
  });
  return response.data;
};

export const useFindultralutionBot = (props: UseQueryParams<FindultralutionBotResponse> & Partial<IParams>) => {
  const { instanceName, token, ...rest } = props;
  return useQuery<FindultralutionBotResponse>({
    ...rest,
    queryKey: queryKey({ instanceName }),
    queryFn: () => findultralutionBot({ instanceName: instanceName!, token }),
    enabled: !!instanceName && (props.enabled ?? true),
  });
};
