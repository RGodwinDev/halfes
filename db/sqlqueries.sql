
-- insert a new stream into stream_times
insert into stream_times values (default, 1, timestamp '2017-06-28 04:00', timestamp '2017-06-28 05:00');


--get user, and start hour
select user_id, date_part('hour', start_time) from stream_times;

--get streams at time/hour grouped by starting hour
select date_part('hour', start_time) as hour, count(date_part('hour', start_time))
from stream_times
group by date_part('hour', start_time);


--get duration of streams
select user_id, age(end_time, start_time) as duration from stream_times;


--creates tables in db
create table if not exists openstreams (userid text, start text, streamid bigint);

create table if not exists closedstreams (userid bigint, starttime text, endtime text, streamid bigint);

create table if not exists users (userid bigint, name text, display_name text, logo text, game text, tracking boolean, viewers bigint);




--insert a new user into users table
insert into users values(userid, name, displayname, logo, game, tracking)
--find out how to put in variables
