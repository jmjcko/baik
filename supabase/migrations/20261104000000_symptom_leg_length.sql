-- Epic 48 (KB v1.5.0, section 3.4): the rider can report "leg_length" (a structural difference in the length of the legs, for example after a fracture).
-- The column `symptoms` is a jsonb array that the app validates when it reads it (unknown values are dropped), and no constraint lists the values, so nothing in the data changes.
-- This only documents the column. Safe to run again. Health data: stored only for the signed in owner of the row (row level security is unchanged).

comment on column public.rider_profiles.symptoms is 'Reported symptoms, health data: numb_hands, front_knee, back_knee, lower_back, neck_pain, saddle_sores, leg_length, arm_pump.';
