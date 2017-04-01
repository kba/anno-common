DROP TABLE IF EXISTS "anno";
CREATE TABLE anno (
    anno_id varchar(40),
    creator varchar(255),
    created datetime,
    modified datetime,

    primary key(anno_id)
);

DROP TABLE IF EXISTS "anno_rev";
CREATE TABLE anno_rev (
    rev_id int,
    anno_id int,
    created datetime,

    primary key(rev_id),
    foreign key (anno_id) references anno(anno_id)
);

DROP TABLE IF EXISTS 'target';
CREATE TABLE targets (
    target_id varchar(255),
    target_type varchar(255),
    target_body blob,
    rev_id int,

    foreign key(rev_id) references anno_rev(rev_id)
);
