INSERT INTO folder
  (name, parentId)
  VALUES
  ('root folder', null), -- id 1
  ('folder1', 1),        -- id 2
  ('folder2', 1),        -- id 3
  ('folder3', 1),        -- id 4
  ('folder1.1', 2),
  ('folder1.2', 2),
  ('folder2.1', 3),
  ('folder2.2', 3),
  ('folder3.1', 4)
