import { ultraai, ultraaiSettings } from "@/types/ultralution.types";

import { api } from "../api";
import { useManageMutation } from "../mutateQuery";

interface CreateultraaiParams {
  instanceName: string;
  token: string;
  data: ultraai;
}

const createultraai = async ({ instanceName, token, data }: CreateultraaiParams) => {
  const response = await api.post(`/ultraai/create/${instanceName}`, data, {
    headers: { apikey: token },
  });
  return response.data;
};

interface UpdateultraaiParams {
  instanceName: string;
  ultraaiId: string;
  data: ultraai;
}
const updateultraai = async ({ instanceName, ultraaiId, data }: UpdateultraaiParams) => {
  const response = await api.put(`/ultraai/update/${ultraaiId}/${instanceName}`, data);
  return response.data;
};

interface DeleteultraaiParams {
  instanceName: string;
  ultraaiId: string;
}
const deleteultraai = async ({ instanceName, ultraaiId }: DeleteultraaiParams) => {
  const response = await api.delete(`/ultraai/delete/${ultraaiId}/${instanceName}`);
  return response.data;
};

interface SetDefaultSettingsultraaiParams {
  instanceName: string;
  token: string;
  data: ultraaiSettings;
}
const setDefaultSettingsultraai = async ({ instanceName, token, data }: SetDefaultSettingsultraaiParams) => {
  const response = await api.post(`/ultraai/settings/${instanceName}`, data, {
    headers: { apikey: token },
  });
  return response.data;
};

interface ChangeStatusultraaiParams {
  instanceName: string;
  token: string;
  remoteJid: string;
  status: string;
}
const changeStatusultraai = async ({ instanceName, token, remoteJid, status }: ChangeStatusultraaiParams) => {
  const response = await api.post(`/ultraai/changeStatus/${instanceName}`, { remoteJid, status }, { headers: { apikey: token } });
  return response.data;
};

export function useManageultraai() {
  const setDefaultSettingsultraaiMutation = useManageMutation(setDefaultSettingsultraai, {
    invalidateKeys: [["ultraai", "fetchDefaultSettings"]],
  });
  const changeStatusultraaiMutation = useManageMutation(changeStatusultraai, {
    invalidateKeys: [
      ["ultraai", "getultraai"],
      ["ultraai", "fetchSessions"],
    ],
  });
  const deleteultraaiMutation = useManageMutation(deleteultraai, {
    invalidateKeys: [
      ["ultraai", "getultraai"],
      ["ultraai", "fetchultraai"],
      ["ultraai", "fetchSessions"],
    ],
  });
  const updateultraaiMutation = useManageMutation(updateultraai, {
    invalidateKeys: [
      ["ultraai", "getultraai"],
      ["ultraai", "fetchultraai"],
      ["ultraai", "fetchSessions"],
    ],
  });
  const createultraaiMutation = useManageMutation(createultraai, {
    invalidateKeys: [["ultraai", "fetchultraai"]],
  });

  return {
    setDefaultSettingsultraai: setDefaultSettingsultraaiMutation,
    changeStatusultraai: changeStatusultraaiMutation,
    deleteultraai: deleteultraaiMutation,
    updateultraai: updateultraaiMutation,
    createultraai: createultraaiMutation,
  };
}
