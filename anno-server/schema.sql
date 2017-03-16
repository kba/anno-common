DROP TABLE IF EXISTS "users";
CREATE TABLE users (
  user_id int,
  email varchar(255),
  primary key(user_id)
);

DROP TABLE IF EXISTS "anno";
CREATE TABLE anno (
  anno_id int,
  creator varchar(255),
  primary key(anno_id),
  foreign key (creator) references users(user_id)
);

DROP TABLE IF EXISTS "anno_rev";
CREATE TABLE anno_rev (
  rev_id int,
  rev_of int,
  email varchar(255),
  primary key(rev_id),
  foreign key (rev_of) references anno(anno_id)
);

DROP TABLE IF EXISTS 'targets';
CREATE TABLE targets (
  target_id varchar(255),
  target_type varchar(255),
  target_body blob,
  target_of int,
  foreign key(target_of) references anno_rev(rev_id)
);

INSERT INTO users (email) VALUES ('john@doe');
SELECT * FROM users;
