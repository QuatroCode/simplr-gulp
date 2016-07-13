import * as gulp from 'gulp';
import Configuration from './configuration/configuration-loader';
import DefaultTasksHandler from './tasks/default/default-tasks-handler';

// Load configuration
Configuration.Init();

// Load tasks
new DefaultTasksHandler();