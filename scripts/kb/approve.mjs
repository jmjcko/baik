#!/usr/bin/env node
/** Approves proposed claims. Usage: npm run kb:approve -- --list | --claim <id> | --topic <id> --all */
import { review } from './review.mjs';

await review('approved', 'kb:approve');
