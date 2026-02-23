@echo off
call tsc
move /y dist\mktest.js dist\mktest.r8 
echo Usage:
echo r8 run dist\mktest.r8 -- ..\problem-specifications\exercises\pangram\canonical-data.json 
