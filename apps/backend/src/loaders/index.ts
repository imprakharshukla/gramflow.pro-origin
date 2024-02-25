import { Express, Application } from 'express';
import dependencyInjectorLoader from './di';
import expressLoader from './express';
import Logger from './logger';

export default async ({ expressApp }: {
    expressApp: Application
}) => {
    await dependencyInjectorLoader();
    Logger.info('✌️ Dependency Injector loaded');
    
    await expressLoader({ app: expressApp });
    Logger.info('✌️ Express loaded');
   
};
