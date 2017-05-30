import { Configuration } from './configuration/configuration';
import { DefaultTasksHandler } from './tasks/default-tasks-handler';

// Load configuration
Configuration.Init();

// Load tasks
new DefaultTasksHandler();
