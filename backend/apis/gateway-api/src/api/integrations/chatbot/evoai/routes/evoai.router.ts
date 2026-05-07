import { RouterBroker } from '@api/abstract/abstract.router';
import { IgnoreJidDto } from '@api/dto/chatbot.dto';
import { InstanceDto } from '@api/dto/instance.dto';
import { HttpStatus } from '@api/routes/index.router';
import { ultraaiController } from '@api/server.module';
import {
  ultraaiIgnoreJidSchema,
  ultraaiSchema,
  ultraaiSettingSchema,
  ultraaiStatusSchema,
  instanceSchema,
} from '@validate/validate.schema';
import { RequestHandler, Router } from 'express';

import { ultraaiDto, ultraaiSettingDto } from '../dto/ultraai.dto';

export class ultraaiRouter extends RouterBroker {
  constructor(...guards: RequestHandler[]) {
    super();
    this.router
      .post(this.routerPath('create'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultraaiDto>({
          request: req,
          schema: ultraaiSchema,
          ClassRef: ultraaiDto,
          execute: (instance, data) => ultraaiController.createBot(instance, data),
        });

        res.status(HttpStatus.CREATED).json(response);
      })
      .get(this.routerPath('find'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultraaiController.findBot(instance),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetch/:ultraaiId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultraaiController.fetchBot(instance, req.params.ultraaiId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .put(this.routerPath('update/:ultraaiId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultraaiDto>({
          request: req,
          schema: ultraaiSchema,
          ClassRef: ultraaiDto,
          execute: (instance, data) => ultraaiController.updateBot(instance, req.params.ultraaiId, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .delete(this.routerPath('delete/:ultraaiId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultraaiController.deleteBot(instance, req.params.ultraaiId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('settings'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ultraaiSettingDto>({
          request: req,
          schema: ultraaiSettingSchema,
          ClassRef: ultraaiSettingDto,
          execute: (instance, data) => ultraaiController.settings(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetchSettings'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultraaiController.fetchSettings(instance),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('changeStatus'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: ultraaiStatusSchema,
          ClassRef: InstanceDto,
          execute: (instance, data) => ultraaiController.changeStatus(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .get(this.routerPath('fetchSessions/:ultraaiId'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => ultraaiController.fetchSessions(instance, req.params.ultraaiId),
        });

        res.status(HttpStatus.OK).json(response);
      })
      .post(this.routerPath('ignoreJid'), ...guards, async (req, res) => {
        const response = await this.dataValidate<IgnoreJidDto>({
          request: req,
          schema: ultraaiIgnoreJidSchema,
          ClassRef: IgnoreJidDto,
          execute: (instance, data) => ultraaiController.ignoreJid(instance, data),
        });

        res.status(HttpStatus.OK).json(response);
      });
  }

  public readonly router: Router = Router();
}
