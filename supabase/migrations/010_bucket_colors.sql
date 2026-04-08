-- Add yes/no color fields to thematic_buckets
alter table thematic_buckets
  add column yes_color text not null default '#22c55e',
  add column no_color  text not null default '#ef4444';
