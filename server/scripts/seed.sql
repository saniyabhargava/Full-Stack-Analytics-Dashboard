-- Light seed so charts have data to show (last 14 days).
-- Uses generate_series to iterate over days (works with dates).

DO $$
DECLARE
  d DATE;
  u TEXT;
  t TEXT;
  i INT;
  types TEXT[] := ARRAY['page_view','click','signup','purchase'];
  users TEXT[] := ARRAY['u_101','u_102','u_103','u_104','u_105'];
BEGIN
  -- Loop over each day in the last 14 days up to today
  FOR d IN
    SELECT generate_series(
             CURRENT_DATE - INTERVAL '14 days',
             CURRENT_DATE,
             INTERVAL '1 day'
           )::date
  LOOP
    -- For each user, insert a handful of random events on that day
    FOREACH u IN ARRAY users LOOP
      FOR i IN 1..(1 + (random()*6)::int) LOOP
        t := types[1 + floor(random() * array_length(types,1))::int];

        INSERT INTO events(user_id, type, metadata, created_at)
        VALUES (
          u,
          t,
          json_build_object('note','seed'),
          (d::timestamp) + make_interval(secs => (random()*86399)::int) -- random time within the day
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
