/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";

import { useInstance } from "@/contexts/InstanceContext";

import { useFetchultraai } from "@/lib/queries/ultraai/fetchultraai";

import { useMediaQuery } from "@/utils/useMediaQuery";

import { DefaultSettingsultraai } from "./DefaultSettingsultraai";
import { Newultraai } from "./Newultraai";
import { Sessionsultraai } from "./Sessionsultraai";
import { Updateultraai } from "./Updateultraai";

function ultraai() {
  const { t } = useTranslation();
  const isMD = useMediaQuery("(min-width: 768px)");
  const { instance } = useInstance();

  const { ultraaiId } = useParams<{ ultraaiId: string }>();

  const {
    data: bots,
    refetch,
    isLoading,
  } = useFetchultraai({
    instanceName: instance?.name,
  });

  const navigate = useNavigate();

  const handleBotClick = (botId: string) => {
    if (!instance) return;

    navigate(`/manager/instance/${instance.id}/ultraai/${botId}`);
  };

  const resetTable = () => {
    refetch();
  };

  return (
    <main className="pt-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("ultraai.title")}</h3>
        <div className="flex items-center justify-end gap-2">
          <Sessionsultraai />
          <DefaultSettingsultraai />
          <Newultraai resetTable={resetTable} />
        </div>
      </div>
      <Separator className="my-4" />
      <ResizablePanelGroup direction={isMD ? "horizontal" : "vertical"}>
        <ResizablePanel defaultSize={35} className="pr-4">
          <div className="flex flex-col gap-3">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {bots && bots.length > 0 && Array.isArray(bots) ? (
                  bots.map((bot) => (
                    <Button className="flex h-auto flex-col items-start justify-start" key={bot.id} onClick={() => handleBotClick(`${bot.id}`)} variant={ultraaiId === bot.id ? "secondary" : "outline"}>
                      <h4 className="text-base">{bot.description || bot.id}</h4>
                    </Button>
                  ))
                ) : (
                  <Button variant="link">{t("ultraai.table.none")}</Button>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        {ultraaiId && (
          <>
            <ResizableHandle withHandle className="border border-border" />
            <ResizablePanel>
              <Updateultraai ultraaiId={ultraaiId} resetTable={resetTable} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </main>
  );
}

export { ultraai };
