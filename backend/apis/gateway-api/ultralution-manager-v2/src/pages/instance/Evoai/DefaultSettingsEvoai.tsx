/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormInput, FormSelect, FormSwitch, FormTags } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useInstance } from "@/contexts/InstanceContext";

import { useFetchultraai } from "@/lib/queries/ultraai/fetchultraai";
import { useManageultraai } from "@/lib/queries/ultraai/manageultraai";
import { useFetchDefaultSettings } from "@/lib/queries/ultraai/settingsFind";

import { ultraaiSettings } from "@/types/ultralution.types";

const FormSchema = z.object({
  expire: z.string(),
  keywordFinish: z.string(),
  delayMessage: z.string(),
  unknownMessage: z.string(),
  listeningFromMe: z.boolean(),
  stopBotFromMe: z.boolean(),
  keepOpen: z.boolean(),
  debounceTime: z.string(),
  ignoreJids: z.array(z.string()).default([]),
  ultraaiIdFallback: z.union([z.null(), z.string()]).optional(),
  splitMessages: z.boolean(),
  timePerChar: z.string(),
});

function DefaultSettingsultraai() {
  const { t } = useTranslation();
  const { instance } = useInstance();

  const { setDefaultSettingsultraai } = useManageultraai();
  const [open, setOpen] = useState(false);
  const { data: bots, refetch: refetchultraai } = useFetchultraai({
    instanceName: instance?.name,
    token: instance?.token,
    enabled: open,
  });
  const { data: settings, refetch: refetchDefaultSettings } = useFetchDefaultSettings({
    instanceName: instance?.name,
    token: instance?.token,
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      expire: "0",
      keywordFinish: t("ultraai.form.examples.keywordFinish"),
      delayMessage: "1000",
      unknownMessage: t("ultraai.form.examples.unknownMessage"),
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: "0",
      ignoreJids: [],
      ultraaiIdFallback: undefined,
      splitMessages: false,
      timePerChar: "0",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        expire: settings?.expire ? settings.expire.toString() : "0",
        keywordFinish: settings.keywordFinish,
        delayMessage: settings.delayMessage ? settings.delayMessage.toString() : "0",
        unknownMessage: settings.unknownMessage,
        listeningFromMe: settings.listeningFromMe,
        stopBotFromMe: settings.stopBotFromMe,
        keepOpen: settings.keepOpen,
        debounceTime: settings.debounceTime ? settings.debounceTime.toString() : "0",
        ignoreJids: settings.ignoreJids,
        ultraaiIdFallback: settings.ultraaiIdFallback,
        splitMessages: settings.splitMessages,
        timePerChar: settings.timePerChar ? settings.timePerChar.toString() : "0",
      });
    }
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      if (!instance || !instance.name) {
        throw new Error("instance not found.");
      }

      const settingsData: ultraaiSettings = {
        expire: parseInt(data.expire),
        keywordFinish: data.keywordFinish,
        delayMessage: parseInt(data.delayMessage),
        unknownMessage: data.unknownMessage,
        listeningFromMe: data.listeningFromMe,
        stopBotFromMe: data.stopBotFromMe,
        keepOpen: data.keepOpen,
        debounceTime: parseInt(data.debounceTime),
        ultraaiIdFallback: data.ultraaiIdFallback || undefined,
        ignoreJids: data.ignoreJids,
        splitMessages: data.splitMessages,
        timePerChar: parseInt(data.timePerChar),
      };

      await setDefaultSettingsultraai({
        instanceName: instance.name,
        token: instance.token,
        data: settingsData,
      });
      toast.success(t("ultraai.toast.defaultSettings.success"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error?.response?.data?.response?.message}`);
    }
  };

  function onReset() {
    refetchDefaultSettings();
    refetchultraai();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Cog size={16} className="mr-1" />
          <span className="hidden sm:inline">{t("ultraai.defaultSettings")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[600px] sm:max-w-[740px]" onCloseAutoFocus={onReset}>
        <DialogHeader>
          <DialogTitle>{t("ultraai.defaultSettings")}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="w-full space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <div className="space-y-4">
                <FormSelect
                  name="ultraaiIdFallback"
                  label={t("ultraai.form.ultraaiIdFallback.label")}
                  options={
                    bots
                      ?.filter((bot) => !!bot.id)
                      .map((bot) => ({
                        label: bot.description!,
                        value: bot.id!,
                      })) ?? []
                  }
                />
                <FormInput name="expire" label={t("ultraai.form.expire.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="keywordFinish" label={t("ultraai.form.keywordFinish.label")}>
                  <Input />
                </FormInput>
                <FormInput name="delayMessage" label={t("ultraai.form.delayMessage.label")}>
                  <Input type="number" />
                </FormInput>
                <FormInput name="unknownMessage" label={t("ultraai.form.unknownMessage.label")}>
                  <Input />
                </FormInput>
                <FormSwitch name="listeningFromMe" label={t("ultraai.form.listeningFromMe.label")} reverse />
                <FormSwitch name="stopBotFromMe" label={t("ultraai.form.stopBotFromMe.label")} reverse />
                <FormSwitch name="keepOpen" label={t("ultraai.form.keepOpen.label")} reverse />
                <FormInput name="debounceTime" label={t("ultraai.form.debounceTime.label")}>
                  <Input type="number" />
                </FormInput>

                <FormSwitch name="splitMessages" label={t("ultraai.form.splitMessages.label")} reverse />

                <FormInput name="timePerChar" label={t("ultraai.form.timePerChar.label")}>
                  <Input type="number" />
                </FormInput>

                <FormTags name="ignoreJids" label={t("ultraai.form.ignoreJids.label")} placeholder={t("ultraai.form.ignoreJids.placeholder")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("ultraai.button.save")}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { DefaultSettingsultraai };
