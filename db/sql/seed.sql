INSERT INTO resource
  (name, folderId)
  VALUES
  ('red', 1),          -- id 1
  ('green', 1),        -- id 2
  ('magenta', 1),      -- id 3
  ('cyan', 1),         -- id 4
  ('orange', 2),
  ('light-urple', 2),
  ('mauve', 3),
  ('taupe', 3),
  ('sarcoline', 4)
;

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
