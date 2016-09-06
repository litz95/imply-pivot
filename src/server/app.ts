/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from 'path';
import { HerculesServer, logAndTrack, LOGGER, Handler, Request, Response, Router } from 'nike-hercules';
import { GetSettingsOptions } from '../server/utils/settings-manager/settings-manager';
import { PivotRequest } from './utils/index';
import { VERSION, AUTH, SERVER_SETTINGS, SETTINGS_MANAGER } from './config';
import * as plywoodRoutes from './routes/plywood/plywood';
import * as plyqlRoutes from './routes/plyql/plyql';
import * as pivotRoutes from './routes/pivot/pivot';
import * as collectionsRoutes from './routes/collections/collections';
import * as settingsRoutes from './routes/settings/settings';
import * as mkurlRoutes from './routes/mkurl/mkurl';
import * as healthRoutes from './routes/health/health';
import * as errorRoutes from './routes/error/error';

import { errorLayout } from './views';

function makeGuard(guard: string): Handler {
  return (req: PivotRequest, res: Response, next: Function) => {
    const user = req.user;
    if (!user) {
      next(new Error('no user'));
      return;
    }

    const { allow } = user;
    if (!allow) {
      next(new Error('no user.allow'));
      return;
    }

    if (!allow[guard]) {
      next(new Error('not allowed'));
      return;
    }

    next();
  };
}

var server = new HerculesServer({
  serverRoot: SERVER_SETTINGS.getServerRoot(),
});

if (SERVER_SETTINGS.getTrustProxy() === 'always') {
  server.getApp().set('trust proxy', 1); // trust first proxy
}

function addGuardedRoutes(attach: string, guard: string, router: Router | Handler): void {
  var guardHandler = makeGuard(guard);
  server.getApp().use(attach, guardHandler, router);
  server.getApp().use(SERVER_SETTINGS.getServerRoot() + attach, guardHandler, router);
}

// Add compression
server.addCompress();

// Add request logging and tracking
server.getApp().use(logAndTrack(SERVER_SETTINGS.getRequestLogFormat()));

// Add Strict Transport Security
if (SERVER_SETTINGS.getStrictTransportSecurity() === "always") {
  server.addHsts();
}

server.addRoutes('/health', healthRoutes);

server.addStaticRoutes([
  path.join(__dirname, '../../build/public'),
  path.join(__dirname, '../../assets')
]);

server.addBodyParser();

// Assign basics
var stateful = SETTINGS_MANAGER.isStateful();
server.getApp().use((req: PivotRequest, res: Response, next: Function) => {
  req.user = null;
  req.version = VERSION;
  req.stateful = stateful;
  req.getFullSettings = (opts: GetSettingsOptions = {}) => {
    return SETTINGS_MANAGER.getFullSettings(opts);
  };
  next();
});

// Global, optional version check
server.getApp().use((req: PivotRequest, res: Response, next: Function) => {
  var { version } = req.body;
  if (version && version !== req.version) {
    res.status(412).send({
      error: 'incorrect version',
      action: 'reload'
    });
    return;
  }
  next();
});

// Auth
if (AUTH) {
  server.getApp().use(AUTH);
} else {
  server.getApp().use((req: PivotRequest, res: Response, next: Function) => {
    if (req.stateful) {
      req.user = {
        id: 'admin',
        email: 'admin@admin.com',
        displayName: 'Admin',
        allow: {
          settings: true
        }
      };
    }
    next();
  });
}

// Data routes
server.addRoutes('/plywood', plywoodRoutes);
server.addRoutes('/plyql', plyqlRoutes);
server.addRoutes('/mkurl', mkurlRoutes);
server.addRoutes('/error', errorRoutes);
if (stateful) {
  server.addRoutes('/collections', collectionsRoutes);
  addGuardedRoutes('/settings', 'settings', settingsRoutes);
}


// View routes
if (SERVER_SETTINGS.getIframe() === 'deny') {
  server.getApp().use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
    next();
  });
}

server.addRoutes('/', pivotRoutes);

// Catch 404 and redirect to /
server.getApp().use((req: Request, res: Response, next: Function) => {
  res.redirect('/');
});

// error handlers

// development error handler
// will print stacktrace
if (server.getApp().get('env') === 'development') { // NODE_ENV
  server.getApp().use((err: any, req: Request, res: Response, next: Function) => {
    LOGGER.error(`Server Error: ${err.message}`);
    LOGGER.error(err.stack);
    res.status(err.status || 500);
    res.send(errorLayout({ version: VERSION, title: 'Error' }, err.message, err));
  });
}

// production error handler
// no stacktraces leaked to user
server.getApp().use((err: any, req: Request, res: Response, next: Function) => {
  LOGGER.error(`Server Error: ${err.message}`);
  LOGGER.error(err.stack);
  res.status(err.status || 500);
  res.send(errorLayout({ version: VERSION, title: 'Error' }, err.message));
});

export = server;
