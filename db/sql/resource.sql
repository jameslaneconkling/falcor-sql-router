CREATE TABLE resource (
  id INTEGER PRIMARY KEY,
  name TEXT,
  body TEXT,
  folderId INTEGER,
  FOREIGN KEY (folderId) REFERENCES resource (id)
)
