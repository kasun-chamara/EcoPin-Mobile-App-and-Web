-- Sample data for local testing only.
-- The council boundary below is a rough rectangle around Kalutara, NOT an official boundary.
-- Replace it with real local-authority boundaries (Survey Department / open data) before launch.

insert into public.councils (id, name, name_si, name_ta, district, boundary) values (
  '00000000-0000-0000-0000-000000000001',
  'Kalutara Urban Council', 'කළුතර නගර සභාව', 'களுத்துறை நகர சபை', 'Kalutara',
  ST_GeogFromText('MULTIPOLYGON(((79.93 6.55, 79.99 6.55, 79.99 6.62, 79.93 6.62, 79.93 6.55)))')
);
