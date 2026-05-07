import { useQuery } from "@tanstack/react-query";

import { api } from "../api";
import { UseQueryParams } from "../types";
import { GetultraaiResponse } from "./types";

interface IParams {
  ultraaiId: string;
  instanceName: string;
}

const queryKey = (params: Partial<IParams>) => ["ultraai", "getultraai", JSON.stringify(params)];

export const getultraai = async ({ ultraaiId, instanceName }: IParams) => {
  const response = await api.get(`/ultraai/fetch/${ultraaiId}/${instanceName}`);
  return response.data;
};

export const useGetultraai = (props: UseQueryParams<GetultraaiResponse> & Partial<IParams>) => {
  const { ultraaiId, instanceName, ...rest } = props;
  return useQuery<GetultraaiResponse>({
    ...rest,
    queryKey: queryKey({ ultraaiId, instanceName }),
    queryFn: () => getultraai({ ultraaiId: ultraaiId!, instanceName: instanceName! }),
    enabled: !!instanceName && !!ultraaiId && (props.enabled ?? true),
  });
};
