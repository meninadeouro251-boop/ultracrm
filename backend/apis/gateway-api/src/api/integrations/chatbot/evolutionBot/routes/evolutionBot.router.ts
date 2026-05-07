import { RouterBroker } from '@api/abstract/abstract.router';
import { IgnoreJidDto } from '@api/dto/chatbot.dto';
import { InstanceDto } from '@api/dto/instance.dto';
import { HttpStatus } from '@api/routes/index.router';
import { ultralutionBotController } from '@api/server.module';
import { instanceSchema } from '@validate/instance.schema';
import { RequestHandler, Router } from 'express';

import { ultralutionBotDto, ultralutionBotSettingDto } from '../dto/ultralutionBot.dto';
import {
  ultralutionBotIgnoreJidSchema,
  ultralutionBotSchema,
  ultralutionBotSettingSchema,
  ultralutionBotStatusSchema,
} from '../validate/ultralutionBot.schema';

export class ultralutionBotRouter extends RouterBroker {
  constructor(...guards: RequestHandler[]) {
    super();
    this.router
      .post(this.routerPath('create'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultralutionBotDto>({
          request: req,
          schema: ultralutionBotSchema,
          ClassRef: ultralutionBotDto,
          execute: (instance, data) => ultralutionBotController.createBot(instance, data),
        });

        res.status(HttpStatus.CREATED).json(response);
      })
      .get(this.routerPath('find'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultralutionBotController.findBot(instance),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetch/:ultralutionBotId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultralutionBotController.fetchBot(instance, req.params.ultralutionBotId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .put(this.routerPath('update/:ultralutionBotId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultralutionBotDto>({
          request: req,
          schema: ultralutionBotSchema,
          ClassRef: ultralutionBotDto,
          execute: (instance, data) => ultralutionBotController.updateBot(instance, req.params.ultralutionBotId, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .delete(this.routerPath('delete/:ultralutionBotId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultralutionBotController.deleteBot(instance, req.params.ultralutionBotId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('settings'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultralutionBotSettingDto>({
          request: req,
          schema: ultralutionBotSettingSchema,
          ClassRef: ultralutionBotSettingDto,
          execute: (instance, data) => ultralutionBotController.settings(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetchSettings'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultralutionBotController.fetchSettings(instance),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('changeStatus'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: ultralutionBotStatusSchema,
          ClassRef: InstanceDto,
          execute: (instance, data) => ultralutionBotController.changeStatus(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetchSessions/:ultralutionBotId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultralutionBotController.fetchSessions(instance, req.params.ultralutionBotId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('ignoreJid'), ...guards, async (req, res) => {
        const response = await this.dataValidate<IgnoreJidDto>({
          request: req,
          schema: ultralutionBotIgnoreJidSchema,
          ClassRef: IgnoreJidDto,
          execute: (instance, data) => ultralutionBotController.ignoreJid(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      });
  }

  public readonly router: Router = Router();
}
