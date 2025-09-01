CREATE TABLE companies (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	ticker TEXT NOT NULL
);

INSERT INTO companies (name, ticker) VALUES ('Apple Inc.', 'AAPL');
INSERT INTO companies (name, ticker) VALUES ('Microsoft Corp.', 'MSFT');
