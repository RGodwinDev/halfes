update users
  set name = $2,
    display_name = $3,
    logo = $4,
    game = $5,
    viewers = $7
  where userid = $1;
