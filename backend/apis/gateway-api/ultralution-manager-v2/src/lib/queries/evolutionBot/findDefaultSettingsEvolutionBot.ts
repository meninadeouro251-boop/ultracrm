import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { FindDefaultSettingsultralutionBot } from "./types";

interface IParams {
  instanceName: string | null;
  token?: string | null;
}

const queryKey = (params: Partial<IParams>) => ["ultralutionBot", "fetchDefaultSettings", JSON.stringify(params)];

export const findDefaultSettingsultralutionBot = async ({ instanceName, token }: IParams) => {
  const response = await api.get(`/ultralutionBot/fetchSettings/${instanceName}`, { headers: { apiKey: token } });
  if (Array.isArray(response.data)) {
    return response.data[0];
  }
  return response.data;
};

export const useFindDefaultSettingsultralutionBot = (props: UseQueryParams<FindDefaultSettingsultralutionBot> & Partial<IParams>) => {
  const { instanceName, token, ...rest } = props;
  return useQuery<FindDefaultSettingsultralutionBot>({
    ...rest,
    queryKey: queryKey({ instanceName }),
    queryFn: () => findDefaultSettingsultralutionBot({ instanceName: instanceName!, token }),
    enabled: !!instanceName && (props.enabled ?? true),
  });
};
