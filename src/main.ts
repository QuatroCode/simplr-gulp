import * as gulp from 'gulp';
import Configuration from './configuration/configuration-loader';

import Server from './server';
import Watcher from './watcher/watchers';
import DefaultTasks from './tasks/default/default-tasks';

// Load configuration
Configuration.Init();

// Load tasks
new DefaultTasks();