create table if not exists openstreams (userid text, start text, streamid bigint);

create table if not exists closedstreams (userid bigint, starttime text, endtime text, streamid bigint);

create table if not exists users (userid bigint, name text, display_name text, logo text, game text, tracking boolean, viewers bigint);

create table if not exists top25 (userid bigint);
