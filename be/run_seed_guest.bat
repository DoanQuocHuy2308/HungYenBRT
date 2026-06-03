@echo off
chcp 65001 > nul
"C:\Program Files\MySQL\MySQL Server 9.6\bin\mysql.exe" -u root -p12345 --default-character-set=utf8mb4 hungyenbrt < "C:\Users\Doan Huy\Desktop\HungYenBRT\be\seed_guest.sql"
echo Done!
