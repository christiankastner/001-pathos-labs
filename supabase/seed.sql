-- Seed data: 5 thematic buckets, 3 questions each, all themed around AI

-- ── Buckets ────────────────────────────────────────────────────────────────

insert into thematic_buckets (name, description) values
  ('Environment',   'Exploring how artificial intelligence intersects with climate, energy, and ecological sustainability.'),
  ('Health',        'Examining AI''s growing role in medicine, diagnostics, mental health, and patient care.'),
  ('Technology',    'Understanding how AI is reshaping the digital landscape, software, and everyday tools.'),
  ('Education',     'Investigating AI''s impact on learning, teaching, academic integrity, and knowledge access.'),
  ('Society & Work','Considering how AI affects employment, governance, ethics, and social structures.');


-- ── Environment questions & options ────────────────────────────────────────

with b as (select id from thematic_buckets where name = 'Environment')

insert into questions (bucket_id, type, prompt, display_order, required)
select b.id, q.type::question_type, q.prompt, q.display_order, q.required
from b, (values
  ('multiple_choice', 'How concerned are you about AI''s energy consumption and its environmental impact?', 1, true),
  ('select_all',      'Which areas do you think AI can most effectively help address environmental challenges?', 2, true),
  ('free_text',       'In your view, does AI''s potential to fight climate change outweigh its environmental costs? Explain your thinking.', 3, false)
) as q(type, prompt, display_order, required);

-- Q1 options (multiple_choice)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Environment' and questions.display_order = 1
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Not at all concerned',   'not_at_all',  1),
  ('Slightly concerned',     'slightly',    2),
  ('Moderately concerned',   'moderately',  3),
  ('Very concerned',         'very',        4),
  ('Extremely concerned',    'extremely',   5)
) as o(label, value, display_order);

-- Q2 options (select_all)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Environment' and questions.display_order = 2
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Climate modelling and prediction',      'climate_modelling',   1),
  ('Renewable energy optimisation',         'renewable_energy',    2),
  ('Wildlife and biodiversity monitoring',  'wildlife',            3),
  ('Smart grid and energy management',      'smart_grid',          4),
  ('Reducing industrial waste',             'industrial_waste',    5)
) as o(label, value, display_order);


-- ── Health questions & options ──────────────────────────────────────────────

with b as (select id from thematic_buckets where name = 'Health')

insert into questions (bucket_id, type, prompt, display_order, required)
select b.id, q.type::question_type, q.prompt, q.display_order, q.required
from b, (values
  ('dropdown',        'How comfortable are you with AI playing a role in diagnosing your health conditions?', 1, true),
  ('select_all',      'Which AI-assisted health applications do you currently trust or find valuable?', 2, true),
  ('free_text',       'What do you believe is the greatest risk of relying on AI in healthcare?', 3, false)
) as q(type, prompt, display_order, required);

-- Q1 options (dropdown)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Health' and questions.display_order = 1
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Very comfortable',    'very_comfortable',   1),
  ('Comfortable',         'comfortable',        2),
  ('Neutral',             'neutral',            3),
  ('Uncomfortable',       'uncomfortable',      4),
  ('Very uncomfortable',  'very_uncomfortable', 5)
) as o(label, value, display_order);

-- Q2 options (select_all)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Health' and questions.display_order = 2
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('AI symptom checkers',              'symptom_checkers',  1),
  ('Mental health and therapy apps',   'mental_health',     2),
  ('Wearable health monitors',         'wearables',         3),
  ('AI-assisted drug discovery',       'drug_discovery',    4),
  ('Robotic or AI-guided surgery',     'surgery',           5)
) as o(label, value, display_order);


-- ── Technology questions & options ─────────────────────────────────────────

with b as (select id from thematic_buckets where name = 'Technology')

insert into questions (bucket_id, type, prompt, display_order, required)
select b.id, q.type::question_type, q.prompt, q.display_order, q.required
from b, (values
  ('multiple_choice', 'How do you primarily interact with AI in your daily digital life?', 1, true),
  ('select_all',      'Which technological sectors do you think AI will most transform in the next decade?', 2, true),
  ('free_text',       'What concerns, if any, do you have about AI''s growing role in shaping future technology?', 3, false)
) as q(type, prompt, display_order, required);

-- Q1 options (multiple_choice)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Technology' and questions.display_order = 1
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Voice assistants (e.g. Siri, Alexa)', 'voice_assistants',   1),
  ('Recommendation algorithms',           'recommendations',     2),
  ('AI productivity and writing tools',   'productivity_tools',  3),
  ('Creative tools (image, video, music)','creative_tools',      4),
  ('I actively avoid AI tools',           'avoid_ai',            5)
) as o(label, value, display_order);

-- Q2 options (select_all)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Technology' and questions.display_order = 2
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Software development',  'software_dev',    1),
  ('Cybersecurity',         'cybersecurity',   2),
  ('Transportation',        'transportation',  3),
  ('Manufacturing',         'manufacturing',   4),
  ('Entertainment',         'entertainment',   5)
) as o(label, value, display_order);


-- ── Education questions & options ──────────────────────────────────────────

with b as (select id from thematic_buckets where name = 'Education')

insert into questions (bucket_id, type, prompt, display_order, required)
select b.id, q.type::question_type, q.prompt, q.display_order, q.required
from b, (values
  ('multiple_choice', 'Should AI tools like large language models be permitted in academic settings?', 1, true),
  ('select_all',      'Which educational benefits of AI are most significant to you personally?', 2, true),
  ('free_text',       'How do you think AI will change the role of teachers and educators over the next 10 years?', 3, false)
) as q(type, prompt, display_order, required);

-- Q1 options (multiple_choice)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Education' and questions.display_order = 1
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Yes, without restriction',            'yes_unrestricted', 1),
  ('Yes, with clear guidelines',          'yes_guidelines',   2),
  ('Only for specific tasks',             'specific_tasks',   3),
  ('No, they should be banned',           'banned',           4),
  ('Unsure',                              'unsure',           5)
) as o(label, value, display_order);

-- Q2 options (select_all)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Education' and questions.display_order = 2
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Personalised learning paths',                    'personalised_learning', 1),
  ('Instant feedback on work',                       'instant_feedback',      2),
  ('Accessibility for learners with disabilities',   'accessibility',         3),
  ('On-demand tutoring support',                     'tutoring',              4),
  ('Reducing administrative burden on teachers',     'admin_efficiency',      5)
) as o(label, value, display_order);


-- ── Society & Work questions & options ─────────────────────────────────────

with b as (select id from thematic_buckets where name = 'Society & Work')

insert into questions (bucket_id, type, prompt, display_order, required)
select b.id, q.type::question_type, q.prompt, q.display_order, q.required
from b, (values
  ('dropdown',        'How worried are you about AI causing significant job displacement in your field?', 1, true),
  ('select_all',      'Which societal challenges related to AI concern you most?', 2, true),
  ('multiple_choice', 'Who should be primarily responsible for regulating AI?', 3, true)
) as q(type, prompt, display_order, required);

-- Q1 options (dropdown)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Society & Work' and questions.display_order = 1
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Not at all worried',   'not_at_all', 1),
  ('Slightly worried',     'slightly',   2),
  ('Moderately worried',   'moderately', 3),
  ('Very worried',         'very',       4),
  ('Extremely worried',    'extremely',  5)
) as o(label, value, display_order);

-- Q2 options (select_all)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Society & Work' and questions.display_order = 2
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('Algorithmic bias and discrimination', 'algorithmic_bias',   1),
  ('Surveillance and loss of privacy',    'surveillance',       2),
  ('Misinformation and deepfakes',        'misinformation',     3),
  ('Wealth concentration among few firms','wealth_concentration',4),
  ('Erosion of human connection',         'human_connection',   5)
) as o(label, value, display_order);

-- Q3 options (multiple_choice)
with q as (
  select questions.id from questions
  join thematic_buckets on thematic_buckets.id = questions.bucket_id
  where thematic_buckets.name = 'Society & Work' and questions.display_order = 3
)
insert into options (question_id, label, value, display_order)
select q.id, o.label, o.value, o.display_order from q, (values
  ('National governments',                  'national_govts',    1),
  ('International bodies (e.g. UN, OECD)', 'international',     2),
  ('The technology companies themselves',   'tech_companies',    3),
  ('Independent civil society groups',      'civil_society',     4),
  ('A combination of all of the above',     'combination',       5)
) as o(label, value, display_order);
