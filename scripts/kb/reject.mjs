#!/usr/bin/env node
/** Rejects proposed claims. Usage: npm run kb:reject -- --list | --claim <id> | --topic <id> --all */
import { review } from './review.mjs';

await review('rejected', 'kb:reject');
