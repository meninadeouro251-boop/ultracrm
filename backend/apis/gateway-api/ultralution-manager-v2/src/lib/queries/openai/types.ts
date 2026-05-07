import { Openai, OpenaiSettings, IntegrationSession, ModelOpenai, OpenaiCreds } from "@/types/ultralution.types";

export type FindOpenaiResponse = Openai[];

export type GetOpenaiResponse = Openai;

export type FindDefaultSettingsOpenaiResponse = OpenaiSettings;

export type FetchSessionsOpenaiResponse = IntegrationSession[];

export type GetModelsResponse = ModelOpenai[];

export type FindOpenaiCredsResponse = OpenaiCreds[];
