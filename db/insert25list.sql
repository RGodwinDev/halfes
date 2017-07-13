--kill previous table
create table if not exists top25 (userId bigint);
truncate table top25;
--remake it
--insert 25 rows, 1 for each top 25 user
insert into top25 values($1);
insert into top25 values($2);
insert into top25 values($3);
insert into top25 values($4); --how to make these come from a parameter?
insert into top25 values($5);
insert into top25 values($6);
insert into top25 values($7);
insert into top25 values($8);
insert into top25 values($9);
insert into top25 values($10);
insert into top25 values($11);
insert into top25 values($12);
insert into top25 values($13);
insert into top25 values($14);
insert into top25 values($15);
insert into top25 values($16);
insert into top25 values($17);
insert into top25 values($18);
insert into top25 values($19);
insert into top25 values($20);
insert into top25 values($21);
insert into top25 values($22);
insert into top25 values($23);
insert into top25 values($24);
insert into top25 values($25);

select * from top25;
