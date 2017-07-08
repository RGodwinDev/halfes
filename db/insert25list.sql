--kill previous table
truncate table top25;
--remake it

--insert 25 rows, 1 for each top 25 user
insert into top25 values(25689976160);
insert into top25 values(25691481440);
insert into top25 values(25692306896);
insert into top25 values(25690076288); --how to make these come from a parameter?
insert into top25 values(25690099264);
insert into top25 values(25692321648);
insert into top25 values(25692253584);
insert into top25 values(25692307840);
insert into top25 values(25692657872);
insert into top25 values(25691897152);
insert into top25 values(25691712976);
insert into top25 values(25692183568);
insert into top25 values(25692185152);
insert into top25 values(25691593488);
insert into top25 values(25691819936);
insert into top25 values(25691920672);
insert into top25 values(25692309408);
insert into top25 values(25693122688);
insert into top25 values(25692627504);
insert into top25 values(25692398736);
insert into top25 values(25692284368);
insert into top25 values(25691746528);
insert into top25 values(25692812384);
insert into top25 values(25692905856);
insert into top25 values(25693057216);

select * from top25;
