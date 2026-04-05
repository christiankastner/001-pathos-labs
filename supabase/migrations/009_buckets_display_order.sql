-- Add display_order to thematic_buckets for explicit sort control
alter table thematic_buckets
  add column display_order int not null default 0;
