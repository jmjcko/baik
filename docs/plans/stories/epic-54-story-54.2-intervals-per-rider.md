# Epic 54, Story 54.2: the Intervals.icu key and rules belong to the rider

**Status:** 🟡 In Progress (G1: the owner asked on 2026-11-06 "I manage the family bikes; I want to connect my wife's bike with her Intervals.icu" and approved with "proceed"; code, tests and gates done; not committed).

## Problem
One key for the whole browser, and the rules of all bikes compared with each other: the key of the owner would be replaced by the key of the wife, and "road rides" on both bikes would be refused as an overlap.

## Acceptance criteria
1. The key of Intervals.icu is stored per rider (`baik_intervals_keys`, a map from the id of the rider; browser only). A rider without a key sees the key form, whatever the other riders have.
2. The key of the first version (`baik_intervals_key`) is taken over by the rider of a bike that is already paired with Intervals.icu, and by nobody else; it is then removed.
3. The overlap of rules is checked only among the bikes of one rider; "Forget key" removes the key, the rules and the loaded rides of that rider only.
4. When the account has several riders the card says whose connection it is.
5. EN and CS parity, gates green.

## Out of scope
Server storage of keys, Strava (it is tied to the account on the server), the trainer access of Intervals.icu.
