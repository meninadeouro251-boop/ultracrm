/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { useInstance } from "@/contexts/InstanceContext";

import { useGetultraai } from "@/lib/queries/ultraai/getultraai";
import { useManageultraai } from "@/lib/queries/ultraai/manageultraai";

import { ultraai } from "@/types/ultralution.types";

import { ultraaiForm, FormSchemaType } from "./ultraaiForm";

type UpdateultraaiProps = {
  ultraaiId: string;
  resetTable: () => void;
};

function Updateultraai({ ultraaiId, resetTable }: UpdateultraaiProps) {
  const { t } = useTranslation();
  const { instance } = useInstance();
  const navigate = useNavigate();
  const [openDeletionDialog, setOpenDeletionDialog] = useState<boolean>(false);

  const { deleteultraai, updateultraai } = useManageultraai();
  const { data: ultraai, isLoading: loading } = useGetultraai({
    ultraaiId,
    instanceName: instance?.name,
  });

  const initialData = useMemo(
    () => ({
      enabled: !!ultraai?.enabled,
      description: ultraai?.description ?? "",
      agentUrl: ultraai?.agentUrl ?? "",
      apiKey: ultraai?.apiKey ?? "",
      triggerType: ultraai?.triggerType ?? "",
      triggerOperator: ultraai?.triggerOperator ?? "",
      triggerValue: ultraai?.triggerValue ?? "",
      expire: ultraai?.expire ?? 0,
      keywordFinish: ultraai?.keywordFinish ?? "",
      delayMessage: ultraai?.delayMessage ?? 0,
      unknownMessage: ultraai?.unknownMessage ?? "",
      listeningFromMe: !!ultraai?.listeningFromMe,
      stopBotFromMe: !!ultraai?.stopBotFromMe,
      keepOpen: !!ultraai?.keepOpen,
      debounceTime: ultraai?.debounceTime ?? 0,
      splitMessages: ultraai?.splitMessages ?? false,
      timePerChar: ultraai?.timePerChar ?? 0,
    }),
    [
      ultraai?.agentUrl,
      ultraai?.apiKey,
      ultraai?.debounceTime,
      ultraai?.delayMessage,
      ultraai?.description,
      ultraai?.enabled,
      ultraai?.expire,
      ultraai?.keepOpen,
      ultraai?.keywordFinish,
      ultraai?.listeningFromMe,
      ultraai?.stopBotFromMe,
      ultraai?.triggerOperator,
      ultraai?.triggerType,
      ultraai?.triggerValue,
      ultraai?.unknownMessage,
      ultraai?.splitMessages,
      ultraai?.timePerChar,
    ],
  );

  const onSubmit = async (data: FormSchemaType) => {
    try {
      if (instance && instance.name && ultraaiId) {
        const ultraaiData: ultraai = {
          enabled: data.enabled,
          description: data.description,
          agentUrl: data.agentUrl,
          apiKey: data.apiKey,
          triggerType: data.triggerType,
          triggerOperator: data.triggerOperator || "",
          triggerValue: data.triggerValue || "",
          expire: data.expire || 0,
          keywordFinish: data.keywordFinish || "",
          delayMessage: data.delayMessage || 1000,
          unknownMessage: data.unknownMessage || "",
          listeningFromMe: data.listeningFromMe || false,
          stopBotFromMe: data.stopBotFromMe || false,
          keepOpen: data.keepOpen || false,
          debounceTime: data.debounceTime || 0,
          splitMessages: data.splitMessages || false,
          timePerChar: data.timePerChar || 0,
        };

        await updateultraai({
          instanceName: instance.name,
          ultraaiId,
          data: ultraaiData,
        });
        toast.success(t("ultraai.toast.success.update"));
        resetTable();
        navigate(`/manager/instance/${instance.id}/ultraai/${ultraaiId}`);
      } else {
        console.error("Token not found");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      if (instance && instance.name && ultraaiId) {
        await deleteultraai({ instanceName: instance.name, ultraaiId });
        toast.success(t("ultraai.toast.success.delete"));

        setOpenDeletionDialog(false);
        resetTable();
        navigate(`/manager/instance/${instance.id}/ultraai`);
      } else {
        console.error("instance not found");
      }
    } catch (error) {
      console.error("Erro ao excluir ultraai:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="m-4">
      <ultraaiForm
        initialData={initialData}
        onSubmit={onSubmit}
        ultraaiId={ultraaiId}
        handleDelete={handleDelete}
        isModal={false}
        isLoading={loading}
        openDeletionDialog={openDeletionDialog}
        setOpenDeletionDialog={setOpenDeletionDialog}
      />
    </div>
  );
}

export { Updateultraai };
