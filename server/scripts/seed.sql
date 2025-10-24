-- Light seed so charts have data to show.
-- Generates a few days of events for a handful of users and types.


-- You can safely run this multiple times; it's simple random-ish data.
DO $$
DECLARE
d DATE;
u TEXT;
t TEXT;
i INT;
types TEXT[] := ARRAY['page_view','click','signup','purchase'];
users TEXT[] := ARRAY['u_101','u_102','u_103','u_104','u_105'];
BEGIN
FOR d IN CURRENT_DATE - INTERVAL '14 days' .. CURRENT_DATE LOOP
FOREACH u IN ARRAY users LOOP
FOR i IN 1..(1 + (random()*6)::int) LOOP
t := types[1 + (random()*3)::int];
INSERT INTO events(user_id, type, metadata, created_at)
VALUES (u, t, json_build_object('note','seed'), d + (random()*86399 || ' seconds')::interval);
END LOOP;
END LOOP;
END LOOP;
END $$;