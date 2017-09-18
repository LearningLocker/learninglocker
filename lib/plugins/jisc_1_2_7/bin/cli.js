#!/usr/bin/env node
require('dotenv').config();
require('../../../../server.babel'); // babel registration (runtime transpilation for node)
require('../commands/cli');
