import { ultralutionBot, ultralutionBotSettings } from "@/types/ultralution.types";

import { api } from "../api";
import { useManageMutation } from "../mutateQuery";

interface CreateultralutionBotParams {
  instanceName: string;
  token?: string;
  data: ultralutionBot;
}

const createultralutionBot = async ({ instanceName, token, data }: CreateultralutionBotParams) => {
  const response = await api.post(`/ultralutionBot/create/${instanceName}`, data, { headers: { apikey: token } });
  return response.data;
};

interface UpdateultralutionBotParams extends CreateultralutionBotParams {
  ultralutionBotId: string;
}

const updateultralutionBot = async ({ instanceName, token, ultralutionBotId, data }: UpdateultralutionBotParams) => {
  const response = await api.put(`/ultralutionBot/update/${ultralutionBotId}/${instanceName}`, data, {
    headers: { apikey: token },
  });
  return response.data;
};

interface DeleteultralutionBotParams {
  instanceName: string;
  ultralutionBotId: string;
}
const deleteultralutionBot = async ({ instanceName, ultralutionBotId }: DeleteultralutionBotParams) => {
  const response = await api.delete(`/ultralutionBot/delete/${ultralutionBotId}/${instanceName}`);
  return response.data;
};

interface SetDefaultSettingsultralutionBotParams {
  instanceName: string;
  token: string;
  data: ultralutionBotSettings;
}
const setDefaultSettingsultralutionBot = async ({ instanceName, token, data }: SetDefaultSettingsultralutionBotParams) => {
  const response = await api.post(`/ultralutionBot/settings/${instanceName}`, data, { headers: { apikey: token } });
  return response.data;
};

interface ChangeStatusultralutionBotParams {
  instanceName: string;
  token: string;
  remoteJid: string;
  status: string;
}
const changeStatusultralutionBot = async ({ instanceName, token, remoteJid, status }: ChangeStatusultralutionBotParams) => {
  const response = await api.post(
    `/ultralutionBot/changeStatus/${instanceName}`,
    {
      remoteJid,
      status,
    },
    { headers: { apikey: token } },
  );
  return response.data;
};

export function useManageultralutionBot() {
  const setDefaultSettingsultralutionBotMutation = useManageMutation(setDefaultSettingsultralutionBot, {
    invalidateKeys: [["ultralutionBot", "fetchDefaultSettings"]],
  });
  const changeStatusultralutionBotMutation = useManageMutation(changeStatusultralutionBot, {
    invalidateKeys: [
      ["ultralutionBot", "getultralutionBot"],
      ["ultralutionBot", "fetchSessions"],
    ],
  });
  const deleteultralutionBotMutation = useManageMutation(deleteultralutionBot, {
    invalidateKeys: [
      ["ultralutionBot", "getultralutionBot"],
      ["ultralutionBot", "findultralutionBot"],
      ["ultralutionBot", "fetchSessions"],
    ],
  });
  const updateultralutionBotMutation = useManageMutation(updateultralutionBot, {
    invalidateKeys: [
      ["ultralutionBot", "getultralutionBot"],
      ["ultralutionBot", "findultralutionBot"],
      ["ultralutionBot", "fetchSessions"],
    ],
  });
  const createultralutionBotMutation = useManageMutation(createultralutionBot, {
    invalidateKeys: [["ultralutionBot", "findultralutionBot"]],
  });

  return {
    setDefaultSettingsultralutionBot: setDefaultSettingsultralutionBotMutation,
    changeStatusultralutionBot: changeStatusultralutionBotMutation,
    deleteultralutionBot: deleteultralutionBotMutation,
    updateultralutionBot: updateultralutionBotMutation,
    createultralutionBot: createultralutionBotMutation,
  };
}
